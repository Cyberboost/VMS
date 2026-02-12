'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'
import { vehicleSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { VehicleStatus } from '@prisma/client'
import { auditCreate, auditUpdate, auditDelete } from '@/lib/audit'

export async function createVehicle(data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'vehicles:create')

  const orgId = session.user.orgId
  if (!orgId) {
    throw new Error('Organization ID is required')
  }

  const validatedData = vehicleSchema.parse(data)

  const vehicle = await prisma.vehicle.create({
    data: {
      ...validatedData,
      orgId,
      inServiceDate: validatedData.inServiceDate
        ? new Date(validatedData.inServiceDate)
        : null,
      lastDOTDate: validatedData.lastDOTDate ? new Date(validatedData.lastDOTDate) : null,
    },
  })

  await auditCreate('Vehicle', vehicle.id, validatedData, session.user.id, orgId)

  revalidatePath('/vehicles')
  return vehicle
}

export async function updateVehicle(id: string, data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'vehicles:update')

  const before = await prisma.vehicle.findUnique({ where: { id } })
  if (!before) {
    throw new Error('Vehicle not found')
  }

  const validatedData = vehicleSchema.partial().parse(data)

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      ...validatedData,
      inServiceDate: validatedData.inServiceDate
        ? new Date(validatedData.inServiceDate)
        : undefined,
      lastDOTDate: validatedData.lastDOTDate ? new Date(validatedData.lastDOTDate) : undefined,
    },
  })

  await auditUpdate('Vehicle', vehicle.id, before, validatedData, session.user.id, before.orgId)

  revalidatePath('/vehicles')
  revalidatePath(`/vehicles/${id}`)
  return vehicle
}

export async function deleteVehicle(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'vehicles:delete')

  const before = await prisma.vehicle.findUnique({ where: { id } })
  if (!before) {
    throw new Error('Vehicle not found')
  }

  const vehicle = await prisma.vehicle.delete({
    where: { id },
  })

  await auditDelete('Vehicle', vehicle.id, before, session.user.id, before.orgId)

  revalidatePath('/vehicles')
  return vehicle
}

export async function getVehicles(filters?: {
  search?: string
  department?: string
  status?: VehicleStatus
  yearFrom?: number
  yearTo?: number
}) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'vehicles:read')

  const where: any = {}

  if (filters?.search) {
    where.OR = [
      { vehicleId: { contains: filters.search, mode: 'insensitive' } },
      { vin: { contains: filters.search, mode: 'insensitive' } },
      { make: { contains: filters.search, mode: 'insensitive' } },
      { model: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  if (filters?.department) {
    where.department = filters.department
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.yearFrom) {
    where.year = { ...where.year, gte: filters.yearFrom }
  }

  if (filters?.yearTo) {
    where.year = { ...where.year, lte: filters.yearTo }
  }

  return await prisma.vehicle.findMany({
    where,
    orderBy: { vehicleId: 'asc' },
  })
}

export async function getVehicleById(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'vehicles:read')

  return await prisma.vehicle.findUnique({
    where: { id },
    include: {
      incidents: {
        orderBy: { incidentDate: 'desc' },
        include: { driver: true },
      },
      surplusRequests: {
        orderBy: { createdAt: 'desc' },
        include: {
          requester: true,
          approver: true,
        },
      },
    },
  })
}
