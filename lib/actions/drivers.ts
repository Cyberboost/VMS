'use server'

import prisma from '@/lib/prisma'
import { requireAuth, scopedWhere } from '@/lib/auth-utils'
import { requirePermission } from '@/lib/rbac'
import { auditCreate, auditUpdate, auditDelete } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { DriverStatus } from '@prisma/client'

export async function getDrivers(
  orgId?: string,
  filters?: {
    search?: string
    department?: string
    status?: DriverStatus
  },
  pagination?: {
    page?: number
    pageSize?: number
  },
  sort?: {
    field?: string
    direction?: 'asc' | 'desc'
  }
) {
  const context = await requireAuth()
  requirePermission(context.role, 'drivers:read')

  const effectiveOrgId = orgId || context.orgId
  if (!effectiveOrgId) {
    throw new Error('Organization ID is required')
  }

  const where: any = scopedWhere(effectiveOrgId, context.role, context.departmentId)

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

  const page = pagination?.page || 1
  const pageSize = pagination?.pageSize || 50
  const skip = (page - 1) * pageSize

  const orderBy: any = {}
  if (sort?.field) {
    orderBy[sort.field] = sort.direction || 'asc'
  } else {
    orderBy.driverId = 'asc'
  }

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        _count: {
          select: { incidents: true, assignments: true },
        },
      },
    }),
    prisma.driver.count({ where }),
  ])

  return {
    drivers,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

export async function getDriverById(id: string, orgId?: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'drivers:read')

  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      incidents: {
        orderBy: { incidentDate: 'desc' },
        include: { vehicle: true },
      },
      assignments: {
        orderBy: { startedAt: 'desc' },
        include: {
          vehicle: true,
        },
      },
      ingestion: true,
    },
  })

  if (!driver) {
    throw new Error('Driver not found')
  }

  // Verify user has access to this org
  if (context.orgId && driver.orgId !== context.orgId) {
    throw new Error('Access denied')
  }

  return driver
}

export async function createDriver(data: any) {
  const context = await requireAuth()
  requirePermission(context.role, 'drivers:create')

  const orgId = data.orgId || context.orgId
  if (!orgId) {
    throw new Error('Organization ID is required')
  }

  const driver = await prisma.driver.create({
    data: {
      ...data,
      orgId,
      cdlExpiration: data.cdlExpiration ? new Date(data.cdlExpiration) : undefined,
      medicalCertExpiration: data.medicalCertExpiration
        ? new Date(data.medicalCertExpiration)
        : undefined,
    },
  })

  await auditCreate('Driver', driver.id, driver, context.userId, orgId)
  revalidatePath('/drivers')

  return driver
}

export async function updateDriver(id: string, data: any) {
  const context = await requireAuth()
  requirePermission(context.role, 'drivers:update')

  const existing = await prisma.driver.findUnique({ where: { id } })
  if (!existing) {
    throw new Error('Driver not found')
  }

  // Verify user has access to this org
  if (context.orgId && existing.orgId !== context.orgId) {
    throw new Error('Access denied')
  }

  const updated = await prisma.driver.update({
    where: { id },
    data: {
      ...data,
      cdlExpiration: data.cdlExpiration ? new Date(data.cdlExpiration) : undefined,
      medicalCertExpiration: data.medicalCertExpiration
        ? new Date(data.medicalCertExpiration)
        : undefined,
    },
  })

  await auditUpdate('Driver', id, existing, updated, context.userId, existing.orgId)
  revalidatePath('/drivers')
  revalidatePath(`/drivers/${id}`)

  return updated
}

export async function deleteDriver(id: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'drivers:delete')

  const driver = await prisma.driver.findUnique({ where: { id } })
  if (!driver) {
    throw new Error('Driver not found')
  }

  // Verify user has access to this org
  if (context.orgId && driver.orgId !== context.orgId) {
    throw new Error('Access denied')
  }

  await prisma.driver.delete({ where: { id } })
  await auditDelete('Driver', id, driver, context.userId, driver.orgId)
  revalidatePath('/drivers')

  return { success: true }
}

export async function getDriverStats(orgId?: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'drivers:read')

  const effectiveOrgId = orgId || context.orgId
  if (!effectiveOrgId) {
    throw new Error('Organization ID is required')
  }

  const where = scopedWhere(effectiveOrgId, context.role, context.departmentId)

  const [
    totalDrivers,
    activeDrivers,
    inactiveDrivers,
    suspendedDrivers,
    cdlExpiringSoon,
    medicalCertExpiringSoon,
  ] = await Promise.all([
    prisma.driver.count({ where }),
    prisma.driver.count({ where: { ...where, status: DriverStatus.Active } }),
    prisma.driver.count({ where: { ...where, status: DriverStatus.Inactive } }),
    prisma.driver.count({ where: { ...where, status: DriverStatus.Suspended } }),
    prisma.driver.count({
      where: {
        ...where,
        cdlExpiration: {
          lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          gte: new Date(),
        },
      },
    }),
    prisma.driver.count({
      where: {
        ...where,
        medicalCertExpiration: {
          lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          gte: new Date(),
        },
      },
    }),
  ])

  return {
    totalDrivers,
    activeDrivers,
    inactiveDrivers,
    suspendedDrivers,
    cdlExpiringSoon,
    medicalCertExpiringSoon,
  }
}
