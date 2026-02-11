'use server'

import prisma from '@/lib/prisma'
import { requireAuth, scopedWhere } from '@/lib/auth-utils'
import { requirePermission } from '@/lib/rbac'
import { getVehicleStats } from './vehicles'
import { getDriverStats } from './drivers'
import { getIncidentStats, getRepeatOperators } from './incidents'
import { getComplianceStats } from './compliance'
import { VehicleStatus, WorkOrderStatus } from '@prisma/client'

export interface DashboardKPI {
  label: string
  value: number | string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage?: number
  }
  drillDownUrl?: string
  description?: string
}

export async function getDashboardKPIs(orgId?: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:read')

  const effectiveOrgId = orgId || context.orgId
  if (!effectiveOrgId) {
    throw new Error('Organization ID is required')
  }

  // Fetch all stats in parallel
  const [vehicleStats, driverStats, incidentStats, complianceStats, maintenanceStats, surplusStats] =
    await Promise.all([
      getVehicleStats(effectiveOrgId),
      getDriverStats(effectiveOrgId),
      getIncidentStats(effectiveOrgId),
      getComplianceStats(effectiveOrgId),
      getMaintenanceStats(effectiveOrgId),
      getSurplusStats(effectiveOrgId),
    ])

  // Calculate Fleet Risk Score
  const fleetRiskScore = calculateFleetRiskScore(
    complianceStats.compliancePercentage,
    maintenanceStats,
    incidentStats
  )

  // Build KPI objects
  const kpis: Record<string, DashboardKPI> = {
    fleetRiskScore: {
      label: 'Fleet Risk Score',
      value: fleetRiskScore.score,
      description: `Compliance: ${fleetRiskScore.complianceScore}%, Maintenance: ${fleetRiskScore.maintenanceScore}%, Incidents: ${fleetRiskScore.incidentScore}%`,
      drillDownUrl: '/dashboard/risk-analysis',
      trend: {
        direction: fleetRiskScore.score >= 80 ? 'up' : fleetRiskScore.score >= 60 ? 'neutral' : 'down',
      },
    },
    openComplianceIssues: {
      label: 'Open Compliance Issues',
      value: complianceStats.openIssuesCount,
      description: `${complianceStats.criticalEvents} critical, ${complianceStats.warningEvents} warnings`,
      drillDownUrl: '/compliance?status=open',
      trend: {
        direction: complianceStats.openIssuesCount === 0 ? 'up' : 'down',
      },
    },
    accidents30Days: {
      label: 'Accidents (30 Days)',
      value: incidentStats.last30Days,
      description: `${incidentStats.atFaultCount} at-fault incidents`,
      drillDownUrl: '/incidents?days=30',
    },
    accidents90Days: {
      label: 'Accidents (90 Days)',
      value: incidentStats.last90Days,
      drillDownUrl: '/incidents?days=90',
    },
    repeatOperators: {
      label: 'Repeat Operators',
      value: (await getRepeatOperators(effectiveOrgId, 3, 90)).length,
      description: '3+ incidents in 90 days',
      drillDownUrl: '/drivers?filter=repeat-offenders',
      trend: {
        direction: 'down',
      },
    },
    pmOverdue: {
      label: 'PM Overdue',
      value: maintenanceStats.overdueCount,
      description: 'Preventive maintenance overdue',
      drillDownUrl: '/maintenance?status=overdue',
      trend: {
        direction: maintenanceStats.overdueCount === 0 ? 'up' : 'down',
      },
    },
    pmUpcoming30Days: {
      label: 'PM Due (30 Days)',
      value: maintenanceStats.upcoming30Days,
      description: 'Upcoming preventive maintenance',
      drillDownUrl: '/maintenance?status=upcoming',
    },
    surplusPipeline: {
      label: 'Surplus Pipeline',
      value: surplusStats.totalInPipeline,
      description: `${surplusStats.pendingReview} pending review, ${surplusStats.pendingApproval} pending approval`,
      drillDownUrl: '/surplus',
    },
    budgetReadiness: {
      label: 'Budget Readiness',
      value: `$${formatNumber(vehicleStats.replacementCostExposure)}`,
      description: `${vehicleStats.vehiclesOlderThan7Years} vehicles > 7 years`,
      drillDownUrl: '/vehicles?age=7plus',
    },
  }

  return {
    kpis,
    fleetRiskScore,
    vehicleStats,
    driverStats,
    incidentStats,
    complianceStats,
    maintenanceStats,
    surplusStats,
  }
}

function calculateFleetRiskScore(
  compliancePercentage: number,
  maintenanceStats: any,
  incidentStats: any
): {
  score: number
  complianceScore: number
  maintenanceScore: number
  incidentScore: number
} {
  // Compliance contributes 40% to risk score
  const complianceScore = compliancePercentage

  // Maintenance contributes 30% to risk score
  // Calculate based on overdue maintenance
  const totalMaintenance = maintenanceStats.overdueCount + maintenanceStats.upcoming30Days + 50 // Assume baseline
  const maintenanceScore =
    totalMaintenance > 0
      ? Math.round(
          ((totalMaintenance - maintenanceStats.overdueCount) / totalMaintenance) * 100
        )
      : 100

  // Incidents contribute 30% to risk score
  // Lower incidents = higher score
  const maxIncidents = 50 // Assume max expected incidents in 30 days
  const incidentScore = Math.max(
    0,
    Math.round(((maxIncidents - incidentStats.last30Days) / maxIncidents) * 100)
  )

  // Calculate weighted average
  const score = Math.round(
    complianceScore * 0.4 + maintenanceScore * 0.3 + incidentScore * 0.3
  )

  return {
    score: Math.max(0, Math.min(100, score)),
    complianceScore,
    maintenanceScore,
    incidentScore,
  }
}

async function getMaintenanceStats(orgId: string) {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [overdueCount, upcoming30Days, totalPlans, openWorkOrders] = await Promise.all([
    prisma.maintenancePlan.count({
      where: {
        orgId,
        nextDueDate: {
          lt: now,
        },
      },
    }),
    prisma.maintenancePlan.count({
      where: {
        orgId,
        nextDueDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    }),
    prisma.maintenancePlan.count({
      where: { orgId },
    }),
    prisma.workOrder.count({
      where: {
        orgId,
        status: {
          in: [WorkOrderStatus.PENDING, WorkOrderStatus.IN_PROGRESS],
        },
      },
    }),
  ])

  return {
    overdueCount,
    upcoming30Days,
    totalPlans,
    openWorkOrders,
  }
}

async function getSurplusStats(orgId: string) {
  const [totalInPipeline, pendingReview, pendingApproval, approved, disposed] = await Promise.all([
    prisma.surplusCase.count({
      where: {
        orgId,
        status: {
          notIn: ['DISPOSED'],
        },
      },
    }),
    prisma.surplusCase.count({
      where: {
        orgId,
        status: 'PENDING_REVIEW',
      },
    }),
    prisma.surplusCase.count({
      where: {
        orgId,
        status: 'PENDING_APPROVAL',
      },
    }),
    prisma.surplusCase.count({
      where: {
        orgId,
        status: 'APPROVED',
      },
    }),
    prisma.surplusCase.count({
      where: {
        orgId,
        status: 'DISPOSED',
      },
    }),
  ])

  return {
    totalInPipeline,
    pendingReview,
    pendingApproval,
    approved,
    disposed,
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K'
  }
  return num.toString()
}

export async function getRecentActivity(orgId?: string, limit: number = 10) {
  const context = await requireAuth()
  const effectiveOrgId = orgId || context.orgId

  if (!effectiveOrgId) {
    return []
  }

  return await prisma.auditLog.findMany({
    where: {
      orgId: effectiveOrgId,
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}
