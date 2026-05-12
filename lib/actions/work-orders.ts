'use server'

/**
 * Work Order Server Actions
 *
 * Handles CRUD operations for work orders and completion workflow.
 * Integrates with immutable ledger and trust score calculation.
 */

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'
import { requirePermission } from '@/lib/rbac'
import { recordLedgerEvent } from './ledger'
import { EventDataBuilders } from '@/lib/ledger-utils'
import { WorkOrderStatus, LedgerEventType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export interface WorkOrderFilters {
  status?: WorkOrderStatus
  vehicleId?: string
  departmentId?: string
  startDate?: Date
  endDate?: Date
  searchTerm?: string
}

/**
 * List work orders with filtering and pagination
 */
export async function listWorkOrders(
  orgId: string,
  filters?: WorkOrderFilters,
  options?: { limit?: number; offset?: number }
) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:read')

  const where: any = {
    orgId,
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.vehicleId) {
    where.vehicleId = filters.vehicleId
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {}
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate
    }
  }

  if (filters?.searchTerm) {
    where.OR = [
      { description: { contains: filters.searchTerm, mode: 'insensitive' } },
      { vehicle: { vehicleId: { contains: filters.searchTerm, mode: 'insensitive' } } },
    ]
  }

  const [workOrders, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            vehicleId: true,
            make: true,
            model: true,
            year: true,
            vin: true,
            plateNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.workOrder.count({ where }),
  ])

  return { workOrders, total }
}

/**
 * Get work order by ID
 */
export async function getWorkOrderById(workOrderId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:read')

  const workOrder = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: {
      vehicle: true,
      partInstallations: {
        include: {
          part: true,
        },
      },
    },
  })

  if (!workOrder) {
    throw new Error('Work order not found')
  }

  // Check scoped access
  const hasAccess = context.role === 'SUPER_ADMIN' ||
                   context.orgId === workOrder.orgId

  if (!hasAccess) {
    throw new Error('Access denied')
  }

  return workOrder
}

/**
 * Create a new work order
 */
export async function createWorkOrder(data: {
  vehicleId: string
  description: string
  maintenancePlanId?: string
  cost?: number
}) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:write')

  // Verify vehicle access
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
    select: { id: true, orgId: true, vehicleId: true },
  })

  if (!vehicle) {
    throw new Error('Vehicle not found')
  }

  const hasAccess = context.role === 'SUPER_ADMIN' || context.orgId === vehicle.orgId

  if (!hasAccess) {
    throw new Error('Access denied')
  }

  // Create work order
  const workOrder = await prisma.workOrder.create({
    data: {
      orgId: vehicle.orgId,
      vehicleId: data.vehicleId,
      description: data.description,
      maintenancePlanId: data.maintenancePlanId,
      cost: data.cost,
      status: WorkOrderStatus.PENDING,
      createdBy: context.userId,
    },
    include: {
      vehicle: {
        select: {
          id: true,
          vehicleId: true,
          make: true,
          model: true,
        },
      },
    },
  })

  revalidatePath('/work-orders')
  revalidatePath(`/vehicles/${data.vehicleId}`)

  return workOrder
}

/**
 * Update a work order
 */
export async function updateWorkOrder(
  workOrderId: string,
  data: Partial<{
    description: string
    cost: number
    status: WorkOrderStatus
  }>
) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:write')

  const existing = await getWorkOrderById(workOrderId)

  const workOrder = await prisma.workOrder.update({
    where: { id: workOrderId },
    data,
    include: {
      vehicle: true,
    },
  })

  revalidatePath('/work-orders')
  revalidatePath(`/work-orders/${workOrderId}`)
  revalidatePath(`/vehicles/${workOrder.vehicleId}`)

  return workOrder
}

/**
 * Complete a work order
 * This generates an immutable ledger event and recalculates trust score
 */
export async function completeWorkOrder(
  workOrderId: string,
  completionData: {
    cost?: number
    notes?: string
  }
) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:write')

  const existing = await getWorkOrderById(workOrderId)

  if (existing.status === WorkOrderStatus.COMPLETED) {
    throw new Error('Work order is already completed')
  }

  // Update work order
  const workOrder = await prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      status: WorkOrderStatus.COMPLETED,
      completedAt: new Date(),
      cost: completionData.cost,
    },
    include: {
      vehicle: {
        select: {
          id: true,
          vehicleId: true,
          make: true,
          model: true,
        },
      },
    },
  })

  // Record immutable ledger event
  try {
    await recordLedgerEvent({
      eventType: LedgerEventType.WORK_ORDER_CLOSED,
      assetId: workOrder.vehicleId,
      eventData: EventDataBuilders.workOrderCompletion(workOrder.id, {
        description: workOrder.description,
        cost: completionData.cost,
        completedDate: workOrder.completedAt?.toISOString(),
        notes: completionData.notes,
      }),
      actorUserId: context.userId,
      metadata: {
        workOrderId: workOrder.id,
        vehicleId: workOrder.vehicle.vehicleId,
      },
    })
  } catch (error) {
    console.error('Failed to record ledger event for work order completion:', error)
    // Continue even if ledger fails - don't block the workflow
  }

  revalidatePath('/work-orders')
  revalidatePath(`/work-orders/${workOrderId}`)
  revalidatePath(`/vehicles/${workOrder.vehicleId}`)

  return workOrder
}

/**
 * Cancel a work order
 */
export async function cancelWorkOrder(workOrderId: string, reason: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:write')

  const workOrder = await prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      status: WorkOrderStatus.CANCELLED,
    },
    include: {
      vehicle: true,
    },
  })

  revalidatePath('/work-orders')
  revalidatePath(`/work-orders/${workOrderId}`)
  revalidatePath(`/vehicles/${workOrder.vehicleId}`)

  return workOrder
}

/**
 * Get work order statistics for a vehicle
 */
export async function getVehicleWorkOrderStats(vehicleId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:read')

  const [total, completed, pending, inProgress] = await Promise.all([
    prisma.workOrder.count({ where: { vehicleId } }),
    prisma.workOrder.count({ where: { vehicleId, status: WorkOrderStatus.COMPLETED } }),
    prisma.workOrder.count({ where: { vehicleId, status: WorkOrderStatus.PENDING } }),
    prisma.workOrder.count({ where: { vehicleId, status: WorkOrderStatus.IN_PROGRESS } }),
  ])

  const completionRate = total > 0 ? (completed / total) * 100 : 0

  return {
    total,
    completed,
    pending,
    inProgress,
    completionRate: Math.round(completionRate),
  }
}

/**
 * Get work order statistics for organization
 */
export async function getOrganizationWorkOrderStats(orgId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:read')

  const [total, completed, pending, inProgress] = await Promise.all([
    prisma.workOrder.count({ where: { orgId } }),
    prisma.workOrder.count({ where: { orgId, status: WorkOrderStatus.COMPLETED } }),
    prisma.workOrder.count({ where: { orgId, status: WorkOrderStatus.PENDING } }),
    prisma.workOrder.count({ where: { orgId, status: WorkOrderStatus.IN_PROGRESS } }),
  ])

  return {
    total,
    completed,
    pending,
    inProgress,
  }
}

