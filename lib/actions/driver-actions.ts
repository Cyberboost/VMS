'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'
import { driverSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { DriverStatus } from '@prisma/client'
import { auditCreate, auditUpdate, auditDelete } from '@/lib/audit'

export async function createDriver(data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'drivers:create')

  const orgId = session.user.orgId
  if (!orgId) {
    throw new Error('Organization ID is required')
  }

  const validatedData = driverSchema.parse(data)

  const driver = await prisma.driver.create({
    data: {
      ...validatedData,
      orgId,
      cdlExpiration: validatedData.cdlExpiration
        ? new Date(validatedData.cdlExpiration)
        : null,
      medicalCertExpiration: validatedData.medicalCertExpiration
        ? new Date(validatedData.medicalCertExpiration)
        : null,
    },
  })

  await auditCreate('Driver', driver.id, validatedData, session.user.id, orgId)

  revalidatePath('/drivers')
  return driver
}

export async function updateDriver(id: string, data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'drivers:update')

  const before = await prisma.driver.findUnique({ where: { id } })
  if (!before) {
    throw new Error('Driver not found')
  }

  const validatedData = driverSchema.partial().parse(data)

  const driver = await prisma.driver.update({
    where: { id },
    data: {
      ...validatedData,
      cdlExpiration: validatedData.cdlExpiration
        ? new Date(validatedData.cdlExpiration)
        : null,
      medicalCertExpiration: validatedData.medicalCertExpiration
        ? new Date(validatedData.medicalCertExpiration)
        : null,
    },
  })

  await auditUpdate('Driver', driver.id, before, validatedData, session.user.id, before.orgId)

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

  const before = await prisma.driver.findUnique({ where: { id } })
  if (!before) {
    throw new Error('Driver not found')
  }

  const driver = await prisma.driver.delete({
    where: { id },
  })

  await auditDelete('Driver', driver.id, before, session.user.id, before.orgId)

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
