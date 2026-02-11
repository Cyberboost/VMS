'use server'

import prisma from '@/lib/prisma'
import { requireAuth, scopedWhere } from '@/lib/auth-utils'
import { requirePermission } from '@/lib/rbac'
import { auditCreate, auditUpdate } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { IncidentStatus, IncidentSeverity } from '@prisma/client'

export async function getIncidents(
  orgId?: string,
  filters?: {
    search?: string
    department?: string
    status?: IncidentStatus
    severity?: IncidentSeverity
    dateFrom?: Date
    dateTo?: Date
  }
) {
  const context = await requireAuth()
  requirePermission(context.role, 'incidents:read')

  const effectiveOrgId = orgId || context.orgId
  if (!effectiveOrgId) {
    throw new Error('Organization ID is required')
  }

  const where: any = scopedWhere(effectiveOrgId, context.role, context.departmentId)

  if (filters?.department) {
    where.department = filters.department
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.severity) {
    where.severity = filters.severity
  }

  if (filters?.dateFrom) {
    where.incidentDate = { ...where.incidentDate, gte: filters.dateFrom }
  }

  if (filters?.dateTo) {
    where.incidentDate = { ...where.incidentDate, lte: filters.dateTo }
  }

  return await prisma.incident.findMany({
    where,
    orderBy: { incidentDate: 'desc' },
    include: {
      vehicle: true,
      driver: true,
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function getIncidentById(id: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'incidents:read')

  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
      createdByUser: true,
      updatedByUser: true,
    },
  })

  if (!incident) {
    throw new Error('Incident not found')
  }

  // Verify user has access to this org
  if (context.orgId && incident.orgId !== context.orgId) {
    throw new Error('Access denied')
  }

  return incident
}

export async function createIncident(data: any) {
  const context = await requireAuth()
  requirePermission(context.role, 'incidents:create')

  const orgId = data.orgId || context.orgId
  if (!orgId) {
    throw new Error('Organization ID is required')
  }

  const incident = await prisma.incident.create({
    data: {
      ...data,
      orgId,
      incidentDate: new Date(data.incidentDate),
      createdBy: context.userId,
    },
  })

  await auditCreate('Incident', incident.id, incident, context.userId, orgId)
  revalidatePath('/incidents')

  return incident
}

export async function updateIncident(id: string, data: any) {
  const context = await requireAuth()
  requirePermission(context.role, 'incidents:update')

  const existing = await prisma.incident.findUnique({ where: { id } })
  if (!existing) {
    throw new Error('Incident not found')
  }

  // Verify user has access to this org
  if (context.orgId && existing.orgId !== context.orgId) {
    throw new Error('Access denied')
  }

  const updated = await prisma.incident.update({
    where: { id },
    data: {
      ...data,
      incidentDate: data.incidentDate ? new Date(data.incidentDate) : undefined,
      updatedBy: context.userId,
    },
  })

  await auditUpdate('Incident', id, existing, updated, context.userId, existing.orgId)
  revalidatePath('/incidents')
  revalidatePath(`/incidents/${id}`)

  return updated
}

export async function getIncidentStats(
  orgId?: string,
  dateRange?: {
    from: Date
    to: Date
  }
) {
  const context = await requireAuth()
  requirePermission(context.role, 'incidents:read')

  const effectiveOrgId = orgId || context.orgId
  if (!effectiveOrgId) {
    throw new Error('Organization ID is required')
  }

  const where = scopedWhere(effectiveOrgId, context.role, context.departmentId)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const [
    totalIncidents,
    openIncidents,
    closedIncidents,
    last30Days,
    last90Days,
    atFaultCount,
    criticalIncidents,
  ] = await Promise.all([
    prisma.incident.count({ where }),
    prisma.incident.count({ where: { ...where, status: { not: IncidentStatus.CLOSED } } }),
    prisma.incident.count({ where: { ...where, status: IncidentStatus.CLOSED } }),
    prisma.incident.count({
      where: {
        ...where,
        incidentDate: { gte: thirtyDaysAgo },
      },
    }),
    prisma.incident.count({
      where: {
        ...where,
        incidentDate: { gte: ninetyDaysAgo },
      },
    }),
    prisma.incident.count({
      where: {
        ...where,
        atFault: true,
      },
    }),
    prisma.incident.count({
      where: {
        ...where,
        severity: IncidentSeverity.Critical,
      },
    }),
  ])

  return {
    totalIncidents,
    openIncidents,
    closedIncidents,
    last30Days,
    last90Days,
    atFaultCount,
    criticalIncidents,
  }
}

export async function getRepeatOperators(
  orgId?: string,
  threshold: number = 3,
  days: number = 90
) {
  const context = await requireAuth()
  requirePermission(context.role, 'incidents:read')

  const effectiveOrgId = orgId || context.orgId
  if (!effectiveOrgId) {
    throw new Error('Organization ID is required')
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  // Get drivers with multiple incidents in the timeframe
  const incidents = await prisma.incident.groupBy({
    by: ['driverId'],
    where: {
      orgId: effectiveOrgId,
      incidentDate: { gte: since },
      driverId: { not: null },
    },
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: {
          gte: threshold,
        },
      },
    },
  })

  // Get driver details
  const driverIds = incidents.map((i) => i.driverId).filter((id): id is string => id !== null)
  const drivers = await prisma.driver.findMany({
    where: {
      id: { in: driverIds },
    },
    include: {
      incidents: {
        where: {
          incidentDate: { gte: since },
        },
        orderBy: {
          incidentDate: 'desc',
        },
      },
    },
  })

  return drivers.map((driver) => ({
    driver,
    incidentCount: driver.incidents.length,
  }))
}
