'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'
import { vehicleSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { VehicleStatus } from '@prisma/client'

export async function createVehicle(data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'vehicles:create')

  const validatedData = vehicleSchema.parse(data)

  const vehicle = await prisma.vehicle.create({
    data: {
      ...validatedData,
      inServiceDate: validatedData.inServiceDate ? new Date(validatedData.inServiceDate) : undefined,
      lastDOTDate: validatedData.lastDOTDate ? new Date(validatedData.lastDOTDate) : undefined,
    },
  })

  await prisma.auditLog.create({
    data: {
      entityType: 'Vehicle',
      entityId: vehicle.id,
      action: 'CREATE',
      changes: validatedData,
      actorId: session.user.id,
    },
  })

  revalidatePath('/vehicles')
  return vehicle
}

export async function updateVehicle(id: string, data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'vehicles:update')

  const validatedData = vehicleSchema.partial().parse(data)

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      ...validatedData,
      inServiceDate: validatedData.inServiceDate ? new Date(validatedData.inServiceDate) : undefined,
      lastDOTDate: validatedData.lastDOTDate ? new Date(validatedData.lastDOTDate) : undefined,
    },
  })

  await prisma.auditLog.create({
    data: {
      entityType: 'Vehicle',
      entityId: vehicle.id,
      action: 'UPDATE',
      changes: validatedData,
      actorId: session.user.id,
    },
  })

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

  const vehicle = await prisma.vehicle.delete({
    where: { id },
  })

  await prisma.auditLog.create({
    data: {
      entityType: 'Vehicle',
      entityId: vehicle.id,
      action: 'DELETE',
      changes: undefined,
      actorId: session.user.id,
    },
  })

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
