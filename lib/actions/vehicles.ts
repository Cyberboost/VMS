'use server'

import prisma from '@/lib/prisma'
import { requireAuth, scopedWhere } from '@/lib/auth-utils'
import { requirePermission } from '@/lib/rbac'
import { auditCreate, auditUpdate, auditDelete } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { VehicleStatus } from '@prisma/client'

export async function getVehicles(
  orgId?: string,
  filters?: {
    search?: string
    department?: string
    status?: VehicleStatus
    yearFrom?: number
    yearTo?: number
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
  requirePermission(context.role, 'vehicles:read')

  const effectiveOrgId = orgId || context.orgId
  if (!effectiveOrgId) {
    throw new Error('Organization ID is required')
  }

  const where: any = scopedWhere(effectiveOrgId, context.role, context.departmentId)

  if (filters?.search) {
    where.OR = [
      { vehicleId: { contains: filters.search, mode: 'insensitive' } },
      { vin: { contains: filters.search, mode: 'insensitive' } },
      { make: { contains: filters.search, mode: 'insensitive' } },
      { model: { contains: filters.search, mode: 'insensitive' } },
      { plateNumber: { contains: filters.search, mode: 'insensitive' } },
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

  const page = pagination?.page || 1
  const pageSize = pagination?.pageSize || 50
  const skip = (page - 1) * pageSize

  const orderBy: any = {}
  if (sort?.field) {
    orderBy[sort.field] = sort.direction || 'asc'
  } else {
    orderBy.vehicleId = 'asc'
  }

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
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
    prisma.vehicle.count({ where }),
  ])

  return {
    vehicles,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

export async function getVehicleById(id: string, orgId?: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:read')

  const vehicle = await prisma.vehicle.findUnique({
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
      surplusCases: {
        orderBy: { createdAt: 'desc' },
        include: {
          approvals: {
            include: {
              approver: true,
            },
          },
        },
      },
      assignments: {
        orderBy: { startedAt: 'desc' },
        include: {
          driver: true,
        },
      },
      maintenancePlans: {
        orderBy: { createdAt: 'desc' },
      },
      workOrders: {
        orderBy: { createdAt: 'desc' },
      },
      ingestion: true,
    },
  })

  if (!vehicle) {
    throw new Error('Vehicle not found')
  }

  // Verify user has access to this org
  if (context.orgId && vehicle.orgId !== context.orgId) {
    throw new Error('Access denied')
  }

  return vehicle
}

export async function createVehicle(data: any) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:create')

  const orgId = data.orgId || context.orgId
  if (!orgId) {
    throw new Error('Organization ID is required')
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      ...data,
      orgId,
      inServiceDate: data.inServiceDate ? new Date(data.inServiceDate) : undefined,
      lastDOTDate: data.lastDOTDate ? new Date(data.lastDOTDate) : undefined,
      insuranceExpiration: data.insuranceExpiration
        ? new Date(data.insuranceExpiration)
        : undefined,
      registrationExpiration: data.registrationExpiration
        ? new Date(data.registrationExpiration)
        : undefined,
    },
  })

  await auditCreate('Vehicle', vehicle.id, vehicle, context.userId, orgId)
  revalidatePath('/vehicles')

  return vehicle
}

export async function updateVehicle(id: string, data: any) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:update')

  const existing = await prisma.vehicle.findUnique({ where: { id } })
  if (!existing) {
    throw new Error('Vehicle not found')
  }

  // Verify user has access to this org
  if (context.orgId && existing.orgId !== context.orgId) {
    throw new Error('Access denied')
  }

  const updated = await prisma.vehicle.update({
    where: { id },
    data: {
      ...data,
      inServiceDate: data.inServiceDate ? new Date(data.inServiceDate) : undefined,
      lastDOTDate: data.lastDOTDate ? new Date(data.lastDOTDate) : undefined,
      insuranceExpiration: data.insuranceExpiration
        ? new Date(data.insuranceExpiration)
        : undefined,
      registrationExpiration: data.registrationExpiration
        ? new Date(data.registrationExpiration)
        : undefined,
    },
  })

  await auditUpdate('Vehicle', id, existing, updated, context.userId, existing.orgId)
  revalidatePath('/vehicles')
  revalidatePath(`/vehicles/${id}`)

  return updated
}

export async function deleteVehicle(id: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:delete')

  const vehicle = await prisma.vehicle.findUnique({ where: { id } })
  if (!vehicle) {
    throw new Error('Vehicle not found')
  }

  // Verify user has access to this org
  if (context.orgId && vehicle.orgId !== context.orgId) {
    throw new Error('Access denied')
  }

  await prisma.vehicle.delete({ where: { id } })
  await auditDelete('Vehicle', id, vehicle, context.userId, vehicle.orgId)
  revalidatePath('/vehicles')

  return { success: true }
}

export async function getVehicleStats(orgId?: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:read')

  const effectiveOrgId = orgId || context.orgId
  if (!effectiveOrgId) {
    throw new Error('Organization ID is required')
  }

  const where = scopedWhere(effectiveOrgId, context.role, context.departmentId)
  const currentYear = new Date().getFullYear()

  const [
    totalVehicles,
    inServiceVehicles,
    inRepairVehicles,
    outOfServiceVehicles,
    surplusVehicles,
    dotDueSoon,
    insuranceExpiringSoon,
    registrationExpiringSoon,
    vehiclesOlderThan7Years,
  ] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.count({ where: { ...where, status: VehicleStatus.InService } }),
    prisma.vehicle.count({ where: { ...where, status: VehicleStatus.InRepair } }),
    prisma.vehicle.count({ where: { ...where, status: VehicleStatus.OutOfService } }),
    prisma.vehicle.count({
      where: { ...where, status: { in: [VehicleStatus.Surplus, VehicleStatus.PENDING_SURPLUS] } },
    }),
    prisma.vehicle.count({
      where: {
        ...where,
        lastDOTDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      },
    }),
    prisma.vehicle.count({
      where: {
        ...where,
        insuranceExpiration: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          gte: new Date(),
        },
      },
    }),
    prisma.vehicle.count({
      where: {
        ...where,
        registrationExpiration: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          gte: new Date(),
        },
      },
    }),
    prisma.vehicle.count({
      where: {
        ...where,
        year: {
          lte: currentYear - 7,
        },
      },
    }),
  ])

  // Calculate replacement cost exposure for vehicles > 7 years
  const oldVehicles = await prisma.vehicle.findMany({
    where: {
      ...where,
      year: {
        lte: currentYear - 7,
      },
    },
    select: {
      replacementCostEstimate: true,
    },
  })

  const replacementCostExposure = oldVehicles.reduce((sum, v) => {
    if (v.replacementCostEstimate) {
      return sum + Number(v.replacementCostEstimate)
    }
    return sum
  }, 0)

  return {
    totalVehicles,
    inServiceVehicles,
    inRepairVehicles,
    outOfServiceVehicles,
    surplusVehicles,
    dotDueSoon,
    insuranceExpiringSoon,
    registrationExpiringSoon,
    vehiclesOlderThan7Years,
    replacementCostExposure,
  }
}
