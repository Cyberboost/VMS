'use server'

/**
 * Inspection Server Actions
 *
 * Handles CRUD operations for vehicle inspections and checklist items.
 * Integrates with immutable ledger and trust score calculation.
 */

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'
import { requirePermission } from '@/lib/rbac'
import { recordLedgerEvent } from './ledger'
import { EventDataBuilders } from '@/lib/ledger-utils'
import { LedgerEventType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export interface InspectionFilters {
  vehicleId?: string
  inspectorId?: string
  status?: string
  startDate?: Date
  endDate?: Date
  searchTerm?: string
}

/**
 * List inspections with filtering and pagination
 */
export async function listInspections(
  orgId: string,
  filters?: InspectionFilters,
  options?: { limit?: number; offset?: number }
) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:read')

  const where: any = {
    orgId,
  }

  if (filters?.vehicleId) {
    where.vehicleId = filters.vehicleId
  }

  if (filters?.inspectorId) {
    where.inspectorId = filters.inspectorId
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.startDate || filters?.endDate) {
    where.inspectionDate = {}
    if (filters.startDate) {
      where.inspectionDate.gte = filters.startDate
    }
    if (filters.endDate) {
      where.inspectionDate.lte = filters.endDate
    }
  }

  const [inspections, total] = await Promise.all([
    prisma.inspection.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            vehicleId: true,
            make: true,
            model: true,
            year: true,
          },
        },
        inspector: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
      orderBy: { inspectionDate: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.inspection.count({ where }),
  ])

  return { inspections, total }
}

/**
 * Get inspection by ID
 */
export async function getInspectionById(inspectionId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:read')

  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: {
      vehicle: true,
      inspector: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: true,
    },
  })

  if (!inspection) {
    throw new Error('Inspection not found')
  }

  // Check scoped access
  const hasAccess = context.role === 'SUPER_ADMIN' || context.orgId === inspection.orgId

  if (!hasAccess) {
    throw new Error('Access denied')
  }

  return inspection
}

/**
 * Create a new inspection
 */
export async function createInspection(data: {
  vehicleId: string
  inspectionType: string
  inspectorId?: string
  notes?: string
  checklistData?: any
}) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:read')

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

  // Create inspection
  const inspection = await prisma.inspection.create({
    data: {
      orgId: vehicle.orgId,
      vehicleId: data.vehicleId,
      inspectionType: data.inspectionType,
      inspectorId: data.inspectorId || context.userId,
      inspectionDate: new Date(),
      status: 'In Progress',
      notes: data.notes,
      checklistData: data.checklistData || {},
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

  revalidatePath('/inspections')
  revalidatePath(`/vehicles/${data.vehicleId}`)

  return inspection
}

/**
 * Add inspection items to a checklist
 */
export async function addInspectionItems(
  inspectionId: string,
  items: Array<{
    category: string
    item: string
    status: string
    notes?: string
  }>
) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:read')

  const inspection = await getInspectionById(inspectionId)

  // Create all inspection items
  const createdItems = await Promise.all(
    items.map((item) =>
      prisma.inspectionItem.create({
        data: {
          inspectionId,
          category: item.category,
          item: item.item,
          status: item.status,
          notes: item.notes,
        },
      })
    )
  )

  revalidatePath(`/inspections/${inspectionId}`)

  return createdItems
}

/**
 * Complete an inspection
 * This generates an immutable ledger event and recalculates trust score
 */
export async function completeInspection(
  inspectionId: string,
  completionData: {
    result: string // "Passed" or "Failed"
    score?: number
    notes?: string
  }
) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:read')

  const existing = await getInspectionById(inspectionId)

  if (existing.status === 'Completed') {
    throw new Error('Inspection is already completed')
  }

  // Count passed vs failed items
  const items = await prisma.inspectionItem.findMany({
    where: { inspectionId },
  })

  const passedCount = items.filter((i) => i.status === 'Pass').length
  const failedCount = items.filter((i) => i.status === 'Fail').length
  const totalCount = items.length

  // Determine overall result if not provided
  let finalResult = completionData.result
  if (!finalResult && totalCount > 0) {
    finalResult = failedCount === 0 ? 'Passed' : 'Failed'
  }

  // Calculate score if not provided
  let finalScore = completionData.score
  if (finalScore === undefined && totalCount > 0) {
    finalScore = Math.round((passedCount / totalCount) * 100)
  }

  // Update inspection
  const inspection = await prisma.inspection.update({
    where: { id: inspectionId },
    data: {
      status: 'Completed',
      result: finalResult,
      score: finalScore,
      completedAt: new Date(),
      notes: completionData.notes || existing.notes,
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
      eventType: LedgerEventType.INSPECTION_COMPLETED,
      assetId: inspection.vehicleId,
      eventData: EventDataBuilders.inspectionCompletion(
        inspection.id,
        (finalResult || 'Unknown') as 'Passed' | 'Failed',
        {
          inspectionType: inspection.inspectionType,
          score: finalScore,
          inspector: context.userId,
          itemsChecked: totalCount,
          itemsPassed: passedCount,
          itemsFailed: failedCount,
        }
      ),
      actorUserId: context.userId,
      metadata: {
        inspectionId: inspection.id,
        vehicleId: inspection.vehicle.vehicleId,
      },
    })
  } catch (error) {
    console.error('Failed to record ledger event for inspection completion:', error)
    // Continue even if ledger fails - don't block the workflow
  }

  revalidatePath('/inspections')
  revalidatePath(`/inspections/${inspectionId}`)
  revalidatePath(`/vehicles/${inspection.vehicleId}`)

  return inspection
}

/**
 * Get inspection statistics for a vehicle
 */
export async function getVehicleInspectionStats(vehicleId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:read')

  const [total, passed, failed, inProgress] = await Promise.all([
    prisma.inspection.count({ where: { vehicleId } }),
    prisma.inspection.count({ where: { vehicleId, result: 'Passed' } }),
    prisma.inspection.count({ where: { vehicleId, result: 'Failed' } }),
    prisma.inspection.count({ where: { vehicleId, status: 'In Progress' } }),
  ])

  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

  return {
    total,
    passed,
    failed,
    inProgress,
    passRate,
  }
}

/**
 * Get inspection statistics for organization
 */
export async function getOrganizationInspectionStats(orgId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'vehicles:read')

  const [total, passed, failed, inProgress] = await Promise.all([
    prisma.inspection.count({ where: { orgId } }),
    prisma.inspection.count({ where: { orgId, result: 'Passed' } }),
    prisma.inspection.count({ where: { orgId, result: 'Failed' } }),
    prisma.inspection.count({ where: { orgId, status: 'In Progress' } }),
  ])

  return {
    total,
    passed,
    failed,
    inProgress,
  }
}
