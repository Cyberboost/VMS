'use server'

/**
 * Work Order Server Actions
 *
 * Handles CRUD operations for work orders, mechanic assignment, and completion workflow.
 * Integrates with immutable ledger and trust score calculation.
 */

import prisma from '@/lib/prisma'
import { requireAuth, scopedWhere } from '@/lib/auth-utils'
import { requirePermission } from '@/lib/rbac'
import { recordLedgerEvent } from './ledger'
import { EventDataBuilders } from '@/lib/ledger-utils'
import { WorkOrderStatus, WorkOrderPriority, LedgerEventType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export interface WorkOrderFilters {
  status?: WorkOrderStatus
  priority?: WorkOrderPriority
  vehicleId?: string
  assignedMechanicId?: string
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

  const where: any = scopedWhere(context, {
    vehicle: { orgId },
  })

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.priority) {
    where.priority = filters.priority
  }

  if (filters?.vehicleId) {
    where.vehicleId = filters.vehicleId
  }

  if (filters?.assignedMechanicId) {
    where.assignedMechanicId = filters.assignedMechanicId
  }

  if (filters?.departmentId) {
    where.vehicle = { ...where.vehicle, departmentId: filters.departmentId }
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
      { workOrderNumber: { contains: filters.searchTerm, mode: 'insensitive' } },
      { description: { contains: filters.searchTerm, mode: 'insensitive' } },
      { vehicle: { name: { contains: filters.searchTerm, mode: 'insensitive' } } },
    ]
  }

  const [workOrders, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true,
            year: true,
            vin: true,
            plateNumber: true,
          },
        },
        assignedMechanic: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
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
      vehicle: {
        include: {
          department: true,
        },
      },
      assignedMechanic: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })

  if (!workOrder) {
    throw new Error('Work order not found')
  }

  // Check scoped access
  const hasAccess = context.role === 'SUPER_ADMIN' ||
                   context.orgId === workOrder.vehicle.orgId

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
  workOrderNumber: string
  type: string
  priority: WorkOrderPriority
  description: string
  estimatedCost?: number
  dueDate?: Date
  assignedMechanicId?: string
  partsNeeded?: string[]
}) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:write')

  // Verify vehicle access
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
    select: { id: true, orgId: true, name: true },
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
      vehicleId: data.vehicleId,
      workOrderNumber: data.workOrderNumber,
      type: data.type,
      priority: data.priority,
      description: data.description,
      estimatedCost: data.estimatedCost,
      dueDate: data.dueDate,
      assignedMechanicId: data.assignedMechanicId,
      status: WorkOrderStatus.Open,
      createdBy: context.userId,
    },
    include: {
      vehicle: {
        select: {
          id: true,
          name: true,
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
    type: string
    priority: WorkOrderPriority
    description: string
    estimatedCost: number
    actualCost: number
    dueDate: Date
    assignedMechanicId: string
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
      assignedMechanic: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  revalidatePath('/work-orders')
  revalidatePath(`/work-orders/${workOrderId}`)
  revalidatePath(`/vehicles/${workOrder.vehicleId}`)

  return workOrder
}

/**
 * Assign mechanic to work order
 */
export async function assignMechanic(workOrderId: string, mechanicId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:write')

  const workOrder = await prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      assignedMechanicId: mechanicId,
      status: WorkOrderStatus.InProgress,
    },
    include: {
      vehicle: true,
      assignedMechanic: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  revalidatePath('/work-orders')
  revalidatePath(`/work-orders/${workOrderId}`)

  return workOrder
}

/**
 * Complete a work order
 * This generates an immutable ledger event and recalculates trust score
 */
export async function completeWorkOrder(
  workOrderId: string,
  completionData: {
    actualCost?: number
    laborHours?: number
    notes?: string
    partsUsed?: Array<{ partId: string; quantity: number }>
  }
) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:write')

  const existing = await getWorkOrderById(workOrderId)

  if (existing.status === WorkOrderStatus.Completed) {
    throw new Error('Work order is already completed')
  }

  // Update work order
  const workOrder = await prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      status: WorkOrderStatus.Completed,
      completedDate: new Date(),
      actualCost: completionData.actualCost,
      laborHours: completionData.laborHours,
      completionNotes: completionData.notes,
    },
    include: {
      vehicle: {
        select: {
          id: true,
          name: true,
          make: true,
          model: true,
        },
      },
      assignedMechanic: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  // Record immutable ledger event
  try {
    await recordLedgerEvent({
      eventType: LedgerEventType.WorkOrderCompletion,
      assetId: workOrder.vehicleId,
      eventData: EventDataBuilders.workOrderCompletion(workOrder.id, {
        workOrderNumber: workOrder.workOrderNumber,
        type: workOrder.type,
        priority: workOrder.priority,
        description: workOrder.description,
        actualCost: completionData.actualCost,
        laborHours: completionData.laborHours,
        mechanicName: workOrder.assignedMechanic
          ? `${workOrder.assignedMechanic.firstName} ${workOrder.assignedMechanic.lastName}`
          : 'Unassigned',
        completedDate: workOrder.completedDate?.toISOString(),
      }),
      actorUserId: context.userId,
      metadata: {
        workOrderId: workOrder.id,
        vehicleName: workOrder.vehicle.name,
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
      status: WorkOrderStatus.Cancelled,
      completionNotes: `Cancelled: ${reason}`,
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

  const [total, completed, open, inProgress, overdue] = await Promise.all([
    prisma.workOrder.count({ where: { vehicleId } }),
    prisma.workOrder.count({ where: { vehicleId, status: WorkOrderStatus.Completed } }),
    prisma.workOrder.count({ where: { vehicleId, status: WorkOrderStatus.Open } }),
    prisma.workOrder.count({ where: { vehicleId, status: WorkOrderStatus.InProgress } }),
    prisma.workOrder.count({
      where: {
        vehicleId,
        status: { notIn: [WorkOrderStatus.Completed, WorkOrderStatus.Cancelled] },
        dueDate: { lt: new Date() },
      },
    }),
  ])

  const completionRate = total > 0 ? (completed / total) * 100 : 0

  return {
    total,
    completed,
    open,
    inProgress,
    overdue,
    completionRate: Math.round(completionRate),
  }
}

/**
 * Get work order statistics for organization
 */
export async function getOrganizationWorkOrderStats(orgId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:read')

  const vehicles = await prisma.vehicle.findMany({
    where: { orgId },
    select: { id: true },
  })

  const vehicleIds = vehicles.map(v => v.id)

  const [total, completed, open, inProgress, overdue] = await Promise.all([
    prisma.workOrder.count({ where: { vehicleId: { in: vehicleIds } } }),
    prisma.workOrder.count({
      where: { vehicleId: { in: vehicleIds }, status: WorkOrderStatus.Completed },
    }),
    prisma.workOrder.count({ where: { vehicleId: { in: vehicleIds }, status: WorkOrderStatus.Open } }),
    prisma.workOrder.count({
      where: { vehicleId: { in: vehicleIds }, status: WorkOrderStatus.InProgress },
    }),
    prisma.workOrder.count({
      where: {
        vehicleId: { in: vehicleIds },
        status: { notIn: [WorkOrderStatus.Completed, WorkOrderStatus.Cancelled] },
        dueDate: { lt: new Date() },
      },
    }),
  ])

  return {
    total,
    completed,
    open,
    inProgress,
    overdue,
  }
}

/**
 * Get overdue work orders
 */
export async function getOverdueWorkOrders(orgId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'workOrders:read')

  const workOrders = await prisma.workOrder.findMany({
    where: {
      vehicle: { orgId },
      status: { notIn: [WorkOrderStatus.Completed, WorkOrderStatus.Cancelled] },
      dueDate: { lt: new Date() },
    },
    include: {
      vehicle: {
        select: {
          id: true,
          name: true,
          make: true,
          model: true,
        },
      },
      assignedMechanic: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  })

  return workOrders
}
