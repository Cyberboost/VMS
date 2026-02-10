'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'
import { driverSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { DriverStatus } from '@prisma/client'

export async function createDriver(data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'drivers:create')

  const validatedData = driverSchema.parse(data)

  const driver = await prisma.driver.create({
    data: {
      ...validatedData,
      cdlExpiration: validatedData.cdlExpiration ? new Date(validatedData.cdlExpiration) : undefined,
    },
  })

  await prisma.auditLog.create({
    data: {
      entityType: 'Driver',
      entityId: driver.id,
      action: 'CREATE',
      changes: validatedData,
      actorId: session.user.id,
    },
  })

  revalidatePath('/drivers')
  return driver
}

export async function updateDriver(id: string, data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'drivers:update')

  const validatedData = driverSchema.partial().parse(data)

  const driver = await prisma.driver.update({
    where: { id },
    data: {
      ...validatedData,
      cdlExpiration: validatedData.cdlExpiration ? new Date(validatedData.cdlExpiration) : undefined,
    },
  })

  await prisma.auditLog.create({
    data: {
      entityType: 'Driver',
      entityId: driver.id,
      action: 'UPDATE',
      changes: validatedData,
      actorId: session.user.id,
    },
  })

  revalidatePath('/drivers')
  revalidatePath(`/drivers/${id}`)
  return driver
}

export async function deleteDriver(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'drivers:delete')

  const driver = await prisma.driver.delete({
    where: { id },
  })

  await prisma.auditLog.create({
    data: {
      entityType: 'Driver',
      entityId: driver.id,
      action: 'DELETE',
      changes: null,
      actorId: session.user.id,
    },
  })

  revalidatePath('/drivers')
  return driver
}

export async function getDrivers(filters?: {
  search?: string
  department?: string
  status?: DriverStatus
}) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'drivers:read')

  const where: any = {}

  if (filters?.search) {
    where.OR = [
      { driverId: { contains: filters.search, mode: 'insensitive' } },
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  if (filters?.department) {
    where.department = filters.department
  }

  if (filters?.status) {
    where.status = filters.status
  }

  return await prisma.driver.findMany({
    where,
    orderBy: { driverId: 'asc' },
    include: {
      _count: {
        select: { incidents: true },
      },
    },
  })
}

export async function getDriverById(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'drivers:read')

  return await prisma.driver.findUnique({
    where: { id },
    include: {
      incidents: {
        orderBy: { incidentDate: 'desc' },
        include: { vehicle: true },
      },
    },
  })
}
