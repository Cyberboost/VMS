'use server'

/**
 * Immutable Ledger Server Actions
 *
 * Provides server-side functions for creating, retrieving, and verifying
 * immutable ledger events with cryptographic hashing.
 */

import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'
import { requirePermission } from '@/lib/rbac'
import {
  generateEventHash,
  generateEventSignature,
  verifyEventHash,
  verifyEventChain,
  calculateChainStats,
  type LedgerEventData,
  type LedgerEvent,
} from '@/lib/ledger-utils'
import { LedgerEventType, LedgerVerificationStatus } from '@prisma/client'
import { updateAssetTrustScore } from '@/lib/trust-score'

/**
 * Record a new immutable ledger event
 */
export async function recordLedgerEvent(data: LedgerEventData): Promise<LedgerEvent> {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:write')

  // Get the last event for this asset to chain events together
  const lastEvent = await prisma.immutableLedgerEvent.findFirst({
    where: { assetId: data.assetId },
    orderBy: { timestamp: 'desc' },
  })

  const timestamp = new Date()
  const previousEventHash = lastEvent?.eventHash || null

  // Generate cryptographic hash for this event
  const eventHash = generateEventHash(
    timestamp,
    data.eventType,
    data.assetId,
    data.eventData,
    previousEventHash
  )

  // Generate signature
  const signature = generateEventSignature(eventHash, data.actorUserId || context.userId)

  // Create the ledger event
  const event = await prisma.immutableLedgerEvent.create({
    data: {
      eventType: data.eventType,
      assetId: data.assetId,
      eventHash,
      eventData: data.eventData,
      timestamp,
      actorUserId: data.actorUserId || context.userId,
      verificationStatus: LedgerVerificationStatus.Verified,
      previousEventHash,
      signature,
      metadata: data.metadata || {},
    },
  })

  // Trigger trust score recalculation in background
  updateAssetTrustScore(data.assetId).catch(error => {
    console.error(`Failed to update trust score for asset ${data.assetId}:`, error)
  })

  return event
}

/**
 * Get all ledger events for an asset
 */
export async function getAssetLedgerEvents(
  assetId: string,
  options?: {
    limit?: number
    offset?: number
    eventType?: LedgerEventType
    startDate?: Date
    endDate?: Date
  }
): Promise<{ events: LedgerEvent[]; total: number }> {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:read')

  const where: any = { assetId }

  if (options?.eventType) {
    where.eventType = options.eventType
  }

  if (options?.startDate || options?.endDate) {
    where.timestamp = {}
    if (options.startDate) {
      where.timestamp.gte = options.startDate
    }
    if (options.endDate) {
      where.timestamp.lte = options.endDate
    }
  }

  const [events, total] = await Promise.all([
    prisma.immutableLedgerEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.immutableLedgerEvent.count({ where }),
  ])

  return { events, total }
}

/**
 * Get ledger events across all assets in organization
 */
export async function getOrganizationLedgerEvents(
  orgId: string,
  options?: {
    limit?: number
    offset?: number
    eventType?: LedgerEventType
    startDate?: Date
    endDate?: Date
    assetId?: string
  }
): Promise<{ events: LedgerEvent[]; total: number }> {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:read')

  // Get all asset IDs for the organization
  const assets = await prisma.vehicle.findMany({
    where: { orgId },
    select: { id: true },
  })

  const assetIds = assets.map(a => a.id)

  const where: any = {
    assetId: options?.assetId ? options.assetId : { in: assetIds },
  }

  if (options?.eventType) {
    where.eventType = options.eventType
  }

  if (options?.startDate || options?.endDate) {
    where.timestamp = {}
    if (options.startDate) {
      where.timestamp.gte = options.startDate
    }
    if (options.endDate) {
      where.timestamp.lte = options.endDate
    }
  }

  const [events, total] = await Promise.all([
    prisma.immutableLedgerEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.immutableLedgerEvent.count({ where }),
  ])

  return { events, total }
}

/**
 * Get a specific ledger event by ID
 */
export async function getLedgerEventById(eventId: string): Promise<LedgerEvent | null> {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:read')

  const event = await prisma.immutableLedgerEvent.findUnique({
    where: { id: eventId },
  })

  return event
}

/**
 * Get ledger event by hash
 */
export async function getLedgerEventByHash(eventHash: string): Promise<LedgerEvent | null> {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:read')

  const event = await prisma.immutableLedgerEvent.findUnique({
    where: { eventHash },
  })

  return event
}

/**
 * Verify the integrity of an event
 */
export async function verifyLedgerEvent(eventId: string): Promise<{
  isValid: boolean
  event: LedgerEvent | null
  reason?: string
}> {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:read')

  const event = await prisma.immutableLedgerEvent.findUnique({
    where: { id: eventId },
  })

  if (!event) {
    return { isValid: false, event: null, reason: 'Event not found' }
  }

  const isValid = verifyEventHash(event)

  if (!isValid) {
    return { isValid: false, event, reason: 'Event hash verification failed' }
  }

  // Verify chain link if there's a previous event
  if (event.previousEventHash) {
    const previousEvent = await prisma.immutableLedgerEvent.findUnique({
      where: { eventHash: event.previousEventHash },
    })

    if (!previousEvent) {
      return { isValid: false, event, reason: 'Previous event in chain not found' }
    }

    if (previousEvent.eventHash !== event.previousEventHash) {
      return { isValid: false, event, reason: 'Chain link broken' }
    }
  }

  return { isValid: true, event }
}

/**
 * Verify the entire event chain for an asset
 */
export async function verifyAssetEventChain(assetId: string): Promise<{
  isValid: boolean
  totalEvents: number
  brokenLinkIndex?: number
  brokenEvent?: LedgerEvent
}> {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:read')

  const events = await prisma.immutableLedgerEvent.findMany({
    where: { assetId },
    orderBy: { timestamp: 'asc' },
  })

  const verification = verifyEventChain(events)

  let brokenEvent: LedgerEvent | undefined
  if (!verification.isValid && verification.brokenLinkIndex !== undefined) {
    brokenEvent = events[verification.brokenLinkIndex]
  }

  return {
    isValid: verification.isValid,
    totalEvents: events.length,
    brokenLinkIndex: verification.brokenLinkIndex,
    brokenEvent,
  }
}

/**
 * Get ledger statistics for an asset
 */
export async function getAssetLedgerStats(assetId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:read')

  const events = await prisma.immutableLedgerEvent.findMany({
    where: { assetId },
  })

  return calculateChainStats(events)
}

/**
 * Get ledger statistics for entire organization
 */
export async function getOrganizationLedgerStats(orgId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:read')

  // Get all asset IDs for the organization
  const assets = await prisma.vehicle.findMany({
    where: { orgId },
    select: { id: true },
  })

  const assetIds = assets.map(a => a.id)

  const events = await prisma.immutableLedgerEvent.findMany({
    where: { assetId: { in: assetIds } },
  })

  return calculateChainStats(events)
}

/**
 * Search ledger events
 */
export async function searchLedgerEvents(
  orgId: string,
  query: {
    searchTerm?: string
    eventTypes?: LedgerEventType[]
    verificationStatus?: LedgerVerificationStatus
    startDate?: Date
    endDate?: Date
    assetId?: string
    actorUserId?: string
  },
  options?: {
    limit?: number
    offset?: number
  }
): Promise<{ events: LedgerEvent[]; total: number }> {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:read')

  // Get all asset IDs for the organization
  const assets = await prisma.vehicle.findMany({
    where: { orgId },
    select: { id: true },
  })

  const assetIds = assets.map(a => a.id)

  const where: any = {
    assetId: query.assetId ? query.assetId : { in: assetIds },
  }

  if (query.eventTypes && query.eventTypes.length > 0) {
    where.eventType = { in: query.eventTypes }
  }

  if (query.verificationStatus) {
    where.verificationStatus = query.verificationStatus
  }

  if (query.actorUserId) {
    where.actorUserId = query.actorUserId
  }

  if (query.startDate || query.endDate) {
    where.timestamp = {}
    if (query.startDate) {
      where.timestamp.gte = query.startDate
    }
    if (query.endDate) {
      where.timestamp.lte = query.endDate
    }
  }

  const [events, total] = await Promise.all([
    prisma.immutableLedgerEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.immutableLedgerEvent.count({ where }),
  ])

  return { events, total }
}

/**
 * Export ledger events to CSV
 */
export async function exportLedgerEventsToCSV(
  orgId: string,
  filters?: {
    eventType?: LedgerEventType
    startDate?: Date
    endDate?: Date
    assetId?: string
  }
): Promise<string> {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:read')

  const { events } = await getOrganizationLedgerEvents(orgId, {
    ...filters,
    limit: 10000, // Export up to 10k events
  })

  const headers = [
    'Event ID',
    'Timestamp',
    'Event Type',
    'Asset ID',
    'Actor User ID',
    'Event Hash',
    'Previous Hash',
    'Verification Status',
    'Blockchain TX Hash',
  ]

  const rows = events.map(event => [
    event.id,
    event.timestamp.toISOString(),
    event.eventType,
    event.assetId,
    event.actorUserId || 'SYSTEM',
    event.eventHash,
    event.previousEventHash || 'GENESIS',
    event.verificationStatus,
    event.blockchainTxHash || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Get recent ledger activity summary
 */
export async function getRecentLedgerActivity(orgId: string, days: number = 7) {
  const context = await requireAuth()
  requirePermission(context.role, 'ledger:read')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { events } = await getOrganizationLedgerEvents(orgId, {
    startDate,
    limit: 100,
  })

  // Group by day
  const activityByDay: Record<string, number> = {}
  const eventTypeCount: Record<string, number> = {}

  events.forEach(event => {
    const day = event.timestamp.toISOString().split('T')[0]
    activityByDay[day] = (activityByDay[day] || 0) + 1

    eventTypeCount[event.eventType] = (eventTypeCount[event.eventType] || 0) + 1
  })

  return {
    totalEvents: events.length,
    activityByDay,
    eventTypeCount,
    recentEvents: events.slice(0, 10), // Most recent 10 events
  }
}
