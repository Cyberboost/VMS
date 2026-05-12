/**
 * Immutable Ledger Utilities
 *
 * Provides cryptographic hashing and verification for the immutable ledger system.
 * Events are chained together using SHA-256 hashes to ensure tamper-proof audit trails.
 */

import crypto from 'crypto'
import { LedgerEventType, LedgerVerificationStatus } from '@prisma/client'

export interface LedgerEventData {
  eventType: LedgerEventType
  assetId: string
  eventData: Record<string, any>
  actorUserId?: string
  metadata?: Record<string, any>
}

export interface LedgerEvent {
  id: string
  eventType: LedgerEventType
  assetId: string
  eventHash: string
  eventData: Record<string, any>
  timestamp: Date
  actorUserId?: string | null
  verificationStatus: LedgerVerificationStatus
  blockchainTxHash?: string | null
  previousEventHash?: string | null
  signature?: string | null
  metadata?: Record<string, any> | null
}

/**
 * Generate SHA-256 hash for an event
 * The hash includes: timestamp, eventType, assetId, eventData, and previousEventHash
 */
export function generateEventHash(
  timestamp: Date,
  eventType: LedgerEventType,
  assetId: string,
  eventData: Record<string, any>,
  previousEventHash?: string | null
): string {
  const hashInput = {
    timestamp: timestamp.toISOString(),
    eventType,
    assetId,
    eventData,
    previousEventHash: previousEventHash || 'GENESIS',
  }

  const hashString = JSON.stringify(hashInput, Object.keys(hashInput).sort())
  return crypto.createHash('sha256').update(hashString).digest('hex')
}

/**
 * Verify that an event's hash is valid
 */
export function verifyEventHash(event: LedgerEvent): boolean {
  const calculatedHash = generateEventHash(
    event.timestamp,
    event.eventType,
    event.assetId,
    event.eventData,
    event.previousEventHash
  )

  return calculatedHash === event.eventHash
}

/**
 * Generate a digital signature for an event (simplified version)
 * In production, this should use proper key management and signing
 */
export function generateEventSignature(eventHash: string, actorUserId?: string): string {
  const signatureInput = `${eventHash}:${actorUserId || 'SYSTEM'}`
  return crypto.createHash('sha256').update(signatureInput).digest('hex')
}

/**
 * Verify the chain integrity between two consecutive events
 */
export function verifyChainLink(previousEvent: LedgerEvent, currentEvent: LedgerEvent): boolean {
  // Check if the current event's previousEventHash matches the previous event's hash
  if (currentEvent.previousEventHash !== previousEvent.eventHash) {
    return false
  }

  // Verify both events' individual hashes
  return verifyEventHash(previousEvent) && verifyEventHash(currentEvent)
}

/**
 * Verify the integrity of an entire event chain
 * Returns the first broken link index, or -1 if chain is valid
 */
export function verifyEventChain(events: LedgerEvent[]): { isValid: boolean; brokenLinkIndex?: number } {
  if (events.length === 0) {
    return { isValid: true }
  }

  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  // Verify first event (should have no previous hash or GENESIS)
  if (!verifyEventHash(sortedEvents[0])) {
    return { isValid: false, brokenLinkIndex: 0 }
  }

  // Verify each subsequent event
  for (let i = 1; i < sortedEvents.length; i++) {
    if (!verifyChainLink(sortedEvents[i - 1], sortedEvents[i])) {
      return { isValid: false, brokenLinkIndex: i }
    }
  }

  return { isValid: true }
}

/**
 * Create event data structure for specific event types
 */
export const EventDataBuilders = {
  workOrderCompletion: (workOrderId: string, details: Record<string, any>) => ({
    workOrderId,
    ...details,
  }),

  inspectionCompletion: (inspectionId: string, result: 'Passed' | 'Failed', details: Record<string, any>) => ({
    inspectionId,
    result,
    ...details,
  }),

  partInstallation: (partId: string, installationId: string, details: Record<string, any>) => ({
    partId,
    installationId,
    ...details,
  }),

  complianceDocumentUpload: (documentId: string, documentType: string, details: Record<string, any>) => ({
    documentId,
    documentType,
    ...details,
  }),

  assetStatusChange: (previousStatus: string, newStatus: string, reason?: string) => ({
    previousStatus,
    newStatus,
    reason,
  }),

  certificationRenewal: (certificationType: string, certificationId: string, expiryDate: string) => ({
    certificationType,
    certificationId,
    expiryDate,
  }),

  incidentReport: (incidentId: string, severity: string, details: Record<string, any>) => ({
    incidentId,
    severity,
    ...details,
  }),

  assetTransfer: (fromDepartmentId: string, toDepartmentId: string, details: Record<string, any>) => ({
    fromDepartmentId,
    toDepartmentId,
    ...details,
  }),

  assetDecommission: (reason: string, details: Record<string, any>) => ({
    reason,
    ...details,
  }),

  complianceViolation: (violationType: string, violationId: string, details: Record<string, any>) => ({
    violationType,
    violationId,
    ...details,
  }),

  assetRegistration: (registrationDetails: Record<string, any>) => ({
    ...registrationDetails,
  }),

  assetAcquisition: (acquisitionDetails: Record<string, any>) => ({
    ...acquisitionDetails,
  }),

  driverAssignment: (driverId: string, assignmentDetails: Record<string, any>) => ({
    driverId,
    ...assignmentDetails,
  }),
}

/**
 * Format event hash for display (show first 8 and last 8 characters)
 */
export function formatEventHash(hash: string): string {
  if (hash.length <= 16) return hash
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
}

/**
 * Get event type display name
 */
export function getEventTypeDisplayName(eventType: LedgerEventType): string {
  const displayNames: Record<LedgerEventType, string> = {
    [LedgerEventType.WorkOrderCompletion]: 'Work Order Completion',
    [LedgerEventType.InspectionCompletion]: 'Inspection Completion',
    [LedgerEventType.PartInstallation]: 'Part Installation',
    [LedgerEventType.ComplianceDocumentUpload]: 'Compliance Document Upload',
    [LedgerEventType.AssetStatusChange]: 'Asset Status Change',
    [LedgerEventType.CertificationRenewal]: 'Certification Renewal',
    [LedgerEventType.IncidentReport]: 'Incident Report',
    [LedgerEventType.AssetTransfer]: 'Asset Transfer',
    [LedgerEventType.AssetDecommission]: 'Asset Decommission',
    [LedgerEventType.ComplianceViolation]: 'Compliance Violation',
    [LedgerEventType.AssetRegistration]: 'Asset Registration',
    [LedgerEventType.AssetAcquisition]: 'Asset Acquisition',
    [LedgerEventType.DriverAssignment]: 'Driver Assignment',
  }

  return displayNames[eventType] || eventType
}

/**
 * Get verification status display info
 */
export function getVerificationStatusInfo(status: LedgerVerificationStatus): {
  label: string
  color: 'green' | 'yellow' | 'red' | 'gray'
  icon: string
} {
  const statusInfo = {
    [LedgerVerificationStatus.Verified]: {
      label: 'Verified',
      color: 'green' as const,
      icon: '✓',
    },
    [LedgerVerificationStatus.Pending]: {
      label: 'Pending',
      color: 'yellow' as const,
      icon: '⏱',
    },
    [LedgerVerificationStatus.Failed]: {
      label: 'Failed',
      color: 'red' as const,
      icon: '✗',
    },
    [LedgerVerificationStatus.Unverified]: {
      label: 'Unverified',
      color: 'gray' as const,
      icon: '○',
    },
  }

  return statusInfo[status] || statusInfo[LedgerVerificationStatus.Unverified]
}

/**
 * Export event chain to audit-ready format
 */
export function exportEventChainToAuditFormat(events: LedgerEvent[]): string {
  const sortedEvents = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  const lines = [
    'IMMUTABLE LEDGER EVENT CHAIN - AUDIT REPORT',
    `Generated: ${new Date().toISOString()}`,
    `Total Events: ${events.length}`,
    '='.repeat(80),
    '',
  ]

  sortedEvents.forEach((event, index) => {
    lines.push(`Event #${index + 1}`)
    lines.push(`  ID: ${event.id}`)
    lines.push(`  Type: ${getEventTypeDisplayName(event.eventType)}`)
    lines.push(`  Asset ID: ${event.assetId}`)
    lines.push(`  Timestamp: ${event.timestamp.toISOString()}`)
    lines.push(`  Event Hash: ${event.eventHash}`)
    lines.push(`  Previous Hash: ${event.previousEventHash || 'GENESIS'}`)
    lines.push(`  Verification: ${getVerificationStatusInfo(event.verificationStatus).label}`)
    lines.push(`  Actor: ${event.actorUserId || 'SYSTEM'}`)

    if (event.blockchainTxHash) {
      lines.push(`  Blockchain TX: ${event.blockchainTxHash}`)
    }

    lines.push(`  Data: ${JSON.stringify(event.eventData, null, 2)}`)
    lines.push('')
  })

  // Chain verification
  const verification = verifyEventChain(sortedEvents)
  lines.push('='.repeat(80))
  lines.push('CHAIN VERIFICATION')
  lines.push(`Status: ${verification.isValid ? 'VALID ✓' : 'INVALID ✗'}`)
  if (!verification.isValid && verification.brokenLinkIndex !== undefined) {
    lines.push(`Broken Link at Event #${verification.brokenLinkIndex + 1}`)
  }
  lines.push('='.repeat(80))

  return lines.join('\n')
}

/**
 * Calculate chain statistics
 */
export function calculateChainStats(events: LedgerEvent[]): {
  totalEvents: number
  verifiedEvents: number
  pendingEvents: number
  failedEvents: number
  eventTypes: Record<string, number>
  oldestEvent?: Date
  newestEvent?: Date
} {
  const stats = {
    totalEvents: events.length,
    verifiedEvents: 0,
    pendingEvents: 0,
    failedEvents: 0,
    eventTypes: {} as Record<string, number>,
    oldestEvent: undefined as Date | undefined,
    newestEvent: undefined as Date | undefined,
  }

  if (events.length === 0) {
    return stats
  }

  const sortedEvents = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  stats.oldestEvent = sortedEvents[0].timestamp
  stats.newestEvent = sortedEvents[sortedEvents.length - 1].timestamp

  events.forEach(event => {
    // Count by verification status
    if (event.verificationStatus === LedgerVerificationStatus.Verified) {
      stats.verifiedEvents++
    } else if (event.verificationStatus === LedgerVerificationStatus.Pending) {
      stats.pendingEvents++
    } else if (event.verificationStatus === LedgerVerificationStatus.Failed) {
      stats.failedEvents++
    }

    // Count by event type
    const typeName = getEventTypeDisplayName(event.eventType)
    stats.eventTypes[typeName] = (stats.eventTypes[typeName] || 0) + 1
  })

  return stats
}
