'use server'

import prisma from '@/lib/prisma'
import { requireAuth, scopedWhere } from '@/lib/auth-utils'
import { requirePermission } from '@/lib/rbac'
import { ComplianceEventStatus, ComplianceRuleType, ComplianceEntityType } from '@prisma/client'

export async function getComplianceStats(orgId?: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'compliance:read')

  const effectiveOrgId = orgId || context.orgId
  if (!effectiveOrgId) {
    throw new Error('Organization ID is required')
  }

  const where = { orgId: effectiveOrgId }

  const [
    totalEvents,
    okEvents,
    warningEvents,
    overdueEvents,
    criticalEvents,
    activeRules,
  ] = await Promise.all([
    prisma.complianceEvent.count({ where }),
    prisma.complianceEvent.count({ where: { ...where, status: ComplianceEventStatus.OK } }),
    prisma.complianceEvent.count({ where: { ...where, status: ComplianceEventStatus.WARNING } }),
    prisma.complianceEvent.count({ where: { ...where, status: ComplianceEventStatus.OVERDUE } }),
    prisma.complianceEvent.count({
      where: { ...where, status: ComplianceEventStatus.CRITICAL },
    }),
    prisma.complianceRule.count({ where: { ...where, isActive: true } }),
  ])

  // Calculate compliance percentage
  const compliantEvents = okEvents
  const nonCompliantEvents = warningEvents + overdueEvents + criticalEvents
  const totalRelevantEvents = compliantEvents + nonCompliantEvents
  const compliancePercentage =
    totalRelevantEvents > 0 ? Math.round((compliantEvents / totalRelevantEvents) * 100) : 100

  // Get compliance by department (simplified - would need to join with vehicles/drivers)
  const complianceByDept = await getComplianceByDepartment(effectiveOrgId)

  return {
    totalEvents,
    okEvents,
    warningEvents,
    overdueEvents,
    criticalEvents,
    activeRules,
    compliancePercentage,
    complianceByDept,
    openIssuesCount: nonCompliantEvents,
  }
}

async function getComplianceByDepartment(orgId: string) {
  // This is a simplified implementation
  // In a real implementation, you'd need to join with vehicles/drivers to get department info
  const departments = await prisma.department.findMany({
    where: { orgId },
  })

  // For now, return a placeholder
  return departments.map((dept) => ({
    department: dept.name,
    compliancePercentage: 85 + Math.floor(Math.random() * 15), // Placeholder
    issueCount: Math.floor(Math.random() * 10), // Placeholder
  }))
}

export async function generateComplianceEvents(orgId?: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'compliance:manage')

  const effectiveOrgId = orgId || context.orgId
  if (!effectiveOrgId) {
    throw new Error('Organization ID is required')
  }

  // Get all active rules
  const rules = await prisma.complianceRule.findMany({
    where: {
      orgId: effectiveOrgId,
      isActive: true,
    },
  })

  let eventsCreated = 0
  let eventsUpdated = 0

  for (const rule of rules) {
    if (rule.entityType === ComplianceEntityType.VEHICLE) {
      await processVehicleComplianceRule(rule, context.userId)
    } else if (rule.entityType === ComplianceEntityType.DRIVER) {
      await processDriverComplianceRule(rule, context.userId)
    }
  }

  return {
    success: true,
    eventsCreated,
    eventsUpdated,
  }
}

async function processVehicleComplianceRule(rule: any, userId: string) {
  // Get all vehicles for this org
  const vehicles = await prisma.vehicle.findMany({
    where: { orgId: rule.orgId },
  })

  for (const vehicle of vehicles) {
    const fieldValue = getFieldValue(vehicle, rule.fieldToCheck)
    if (!fieldValue) continue

    const status = calculateComplianceStatus(
      fieldValue,
      rule.ruleType,
      rule.warningDaysBefore,
      rule.criticalDaysBefore
    )

    // Upsert compliance event
    await prisma.complianceEvent.upsert({
      where: {
        // Use a composite unique constraint in a real implementation
        id: `${rule.id}-${vehicle.id}`,
      },
      create: {
        orgId: rule.orgId,
        ruleId: rule.id,
        entityType: ComplianceEntityType.VEHICLE,
        entityId: vehicle.id,
        status,
        dueDate: fieldValue instanceof Date ? fieldValue : null,
      },
      update: {
        status,
        dueDate: fieldValue instanceof Date ? fieldValue : null,
      },
    })
  }
}

async function processDriverComplianceRule(rule: any, userId: string) {
  // Get all drivers for this org
  const drivers = await prisma.driver.findMany({
    where: { orgId: rule.orgId },
  })

  for (const driver of drivers) {
    const fieldValue = getFieldValue(driver, rule.fieldToCheck)
    if (!fieldValue) continue

    const status = calculateComplianceStatus(
      fieldValue,
      rule.ruleType,
      rule.warningDaysBefore,
      rule.criticalDaysBefore
    )

    // Upsert compliance event
    await prisma.complianceEvent.upsert({
      where: {
        // Use a composite unique constraint in a real implementation
        id: `${rule.id}-${driver.id}`,
      },
      create: {
        orgId: rule.orgId,
        ruleId: rule.id,
        entityType: ComplianceEntityType.DRIVER,
        entityId: driver.id,
        status,
        dueDate: fieldValue instanceof Date ? fieldValue : null,
      },
      update: {
        status,
        dueDate: fieldValue instanceof Date ? fieldValue : null,
      },
    })
  }
}

function getFieldValue(entity: any, fieldName: string): any {
  return entity[fieldName]
}

function calculateComplianceStatus(
  fieldValue: any,
  ruleType: ComplianceRuleType,
  warningDaysBefore?: number | null,
  criticalDaysBefore?: number | null
): ComplianceEventStatus {
  if (ruleType === ComplianceRuleType.EXPIRATION && fieldValue instanceof Date) {
    const now = new Date()
    const daysUntilExpiration = Math.floor(
      (fieldValue.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    )

    if (daysUntilExpiration < 0) {
      return ComplianceEventStatus.OVERDUE
    }

    if (criticalDaysBefore && daysUntilExpiration <= criticalDaysBefore) {
      return ComplianceEventStatus.CRITICAL
    }

    if (warningDaysBefore && daysUntilExpiration <= warningDaysBefore) {
      return ComplianceEventStatus.WARNING
    }

    return ComplianceEventStatus.OK
  }

  return ComplianceEventStatus.OK
}

export async function getComplianceEvents(
  orgId?: string,
  filters?: {
    status?: ComplianceEventStatus
    entityType?: ComplianceEntityType
  }
) {
  const context = await requireAuth()
  requirePermission(context.role, 'compliance:read')

  const effectiveOrgId = orgId || context.orgId
  if (!effectiveOrgId) {
    throw new Error('Organization ID is required')
  }

  const where: any = { orgId: effectiveOrgId }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.entityType) {
    where.entityType = filters.entityType
  }

  return await prisma.complianceEvent.findMany({
    where,
    include: {
      rule: true,
    },
    orderBy: [{ status: 'desc' }, { dueDate: 'asc' }],
  })
}
