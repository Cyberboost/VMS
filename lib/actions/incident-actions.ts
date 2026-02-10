'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'
import { incidentSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { IncidentStatus, IncidentSeverity } from '@prisma/client'

export async function createIncident(data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'incidents:create')

  const validatedData = incidentSchema.parse(data)

  const incident = await prisma.incident.create({
    data: {
      ...validatedData,
      incidentDate: new Date(validatedData.incidentDate),
    },
  })

  await prisma.auditLog.create({
    data: {
      entityType: 'Incident',
      entityId: incident.id,
      action: 'CREATE',
      changes: validatedData,
      actorId: session.user.id,
    },
  })

  revalidatePath('/incidents')
  revalidatePath(`/vehicles/${validatedData.vehicleId}`)
  return incident
}

export async function updateIncident(id: string, data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'incidents:update')

  const validatedData = incidentSchema.partial().parse(data)

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      ...validatedData,
      incidentDate: validatedData.incidentDate ? new Date(validatedData.incidentDate) : undefined,
    },
  })

  await prisma.auditLog.create({
    data: {
      entityType: 'Incident',
      entityId: incident.id,
      action: 'UPDATE',
      changes: validatedData,
      actorId: session.user.id,
    },
  })

  revalidatePath('/incidents')
  revalidatePath(`/incidents/${id}`)
  return incident
}

export async function deleteIncident(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'incidents:delete')

  const incident = await prisma.incident.delete({
    where: { id },
  })

  await prisma.auditLog.create({
    data: {
      entityType: 'Incident',
      entityId: incident.id,
      action: 'DELETE',
      changes: undefined,
      actorId: session.user.id,
    },
  })

  revalidatePath('/incidents')
  return incident
}

export async function getIncidents(filters?: {
  search?: string
  department?: string
  vehicleId?: string
  driverId?: string
  severity?: IncidentSeverity
  status?: IncidentStatus
  dateFrom?: Date
  dateTo?: Date
}) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'incidents:read')

  const where: any = {}

  if (filters?.search) {
    where.OR = [{ description: { contains: filters.search, mode: 'insensitive' } }]
  }

  if (filters?.department) {
    where.department = filters.department
  }

  if (filters?.vehicleId) {
    where.vehicleId = filters.vehicleId
  }

  if (filters?.driverId) {
    where.driverId = filters.driverId
  }

  if (filters?.severity) {
    where.severity = filters.severity
  }

  if (filters?.status) {
    where.status = filters.status
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
    },
  })
}

export async function getIncidentById(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'incidents:read')

  return await prisma.incident.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  })
}
