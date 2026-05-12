/**
 * Asset Trust Score Calculation Engine
 *
 * Calculates a comprehensive trust score (0-100) for each asset based on:
 * 1. Maintenance Completeness (20%)
 * 2. Inspection History (20%)
 * 3. Compliance Status (20%)
 * 4. Incident History (15%)
 * 5. Verified Ledger Events (15%)
 * 6. Parts Provenance (5%)
 * 7. Downtime Risk (5%)
 */

import prisma from '@/lib/prisma'
import { VehicleStatus, WorkOrderStatus, IncidentSeverity } from '@prisma/client'

export interface TrustScoreBreakdown {
  totalScore: number
  maintenanceScore: number
  inspectionScore: number
  complianceScore: number
  incidentScore: number
  ledgerScore: number
  partsScore: number
  downtimeScore: number
  calculatedAt: Date
}

export interface TrustScoreCalculationOptions {
  assetId: string
  assetType: 'VEHICLE' | 'EQUIPMENT'
  lookbackDays?: number
}

/**
 * Calculate the overall trust score for an asset
 */
export async function calculateAssetTrustScore(
  options: TrustScoreCalculationOptions
): Promise<TrustScoreBreakdown> {
  const { assetId, assetType, lookbackDays = 365 } = options

  const lookbackDate = new Date()
  lookbackDate.setDate(lookbackDate.getDate() - lookbackDays)

  // Calculate all components in parallel
  const [
    maintenanceScore,
    inspectionScore,
    complianceScore,
    incidentScore,
    ledgerScore,
    partsScore,
    downtimeScore,
  ] = await Promise.all([
    calculateMaintenanceScore(assetId, lookbackDate),
    calculateInspectionScore(assetId, lookbackDate),
    calculateComplianceScore(assetId),
    calculateIncidentScore(assetId, lookbackDate),
    calculateLedgerScore(assetId, lookbackDate),
    calculatePartsScore(assetId),
    calculateDowntimeScore(assetId, lookbackDate),
  ])

  // Weight the scores according to the algorithm
  const totalScore = Math.round(
    maintenanceScore * 0.20 +
    inspectionScore * 0.20 +
    complianceScore * 0.20 +
    incidentScore * 0.15 +
    ledgerScore * 0.15 +
    partsScore * 0.05 +
    downtimeScore * 0.05
  )

  return {
    totalScore: Math.max(0, Math.min(100, totalScore)),
    maintenanceScore,
    inspectionScore,
    complianceScore,
    incidentScore,
    ledgerScore,
    partsScore,
    downtimeScore,
    calculatedAt: new Date(),
  }
}

/**
 * 1. Maintenance Completeness Score (20%)
 * Based on work order completion rates, overdue maintenance, and service interval adherence
 */
async function calculateMaintenanceScore(assetId: string, lookbackDate: Date): Promise<number> {
  const workOrders = await prisma.workOrder.findMany({
    where: {
      vehicleId: assetId,
      createdAt: { gte: lookbackDate },
    },
  })

  if (workOrders.length === 0) {
    // No maintenance records - neutral score
    return 70
  }

  const completed = workOrders.filter(wo => wo.status === WorkOrderStatus.COMPLETED).length
  const total = workOrders.length
  const completionRate = (completed / total) * 100

  // Check for overdue work orders
  const now = new Date()
  const overdue = workOrders.filter(
    wo => wo.status !== WorkOrderStatus.COMPLETED &&
         wo.status !== WorkOrderStatus.CANCELLED &&
         wo.completedAt === null
  ).length

  // Calculate score
  let score = completionRate * 0.7 // 70% weight on completion rate

  // Penalty for overdue work orders
  const overduePenalty = Math.min(30, overdue * 10)
  score = Math.max(0, score - overduePenalty)

  return Math.round(score)
}

/**
 * 2. Inspection History Score (20%)
 * Based on pass/fail rate, critical defect resolution, and inspection frequency
 */
async function calculateInspectionScore(assetId: string, lookbackDate: Date): Promise<number> {
  const inspections = await prisma.inspection.findMany({
    where: {
      vehicleId: assetId,
      inspectionDate: { gte: lookbackDate },
    },
    include: {
      items: true,
    },
  })

  if (inspections.length === 0) {
    // No inspection records - penalty for lack of inspections
    return 50
  }

  // Calculate pass rate
  const passed = inspections.filter(i => i.status === 'Passed').length
  const passRate = (passed / inspections.length) * 100

  // Check for failed inspections
  const failed = inspections.filter(i => i.status === 'Failed').length

  // Inspection frequency (should have at least one inspection per quarter)
  const daysSinceStart = Math.floor((new Date().getTime() - lookbackDate.getTime()) / (1000 * 60 * 60 * 24))
  const expectedInspections = Math.ceil(daysSinceStart / 90)
  const frequencyScore = Math.min(100, (inspections.length / expectedInspections) * 100)

  // Calculate score
  let score = passRate * 0.6 + frequencyScore * 0.4

  // Penalty for failed inspections
  const failPenalty = Math.min(40, failed * 10)
  score = Math.max(0, score - failPenalty)

  return Math.round(score)
}

/**
 * 3. Compliance Status Score (20%)
 * Based on current compliance standing, document expiration, and violations
 */
async function calculateComplianceScore(assetId: string): Promise<number> {
  const [complianceEvents, documents] = await Promise.all([
    prisma.complianceEvent.findMany({
      where: {
        entityType: 'VEHICLE',
        entityId: assetId
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.complianceDocument.findMany({
      where: {
        entityType: 'Vehicle',
        entityId: assetId,
      },
    }),
  ])

  let score = 100

  // Check for overdue and critical violations
  const criticalEvents = complianceEvents.filter(e => e.status === 'CRITICAL' || e.status === 'OVERDUE').length
  score -= criticalEvents * 15

  // Check for expired or expiring documents
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const expiredDocs = documents.filter(d => d.expirationDate && d.expirationDate < now).length
  const expiringSoon = documents.filter(
    d => d.expirationDate && d.expirationDate >= now && d.expirationDate <= thirtyDaysFromNow
  ).length

  score -= expiredDocs * 20
  score -= expiringSoon * 5

  return Math.max(0, Math.round(score))
}

/**
 * 4. Incident History Score (15%)
 * Based on frequency, severity weighting, and at-fault determination
 */
async function calculateIncidentScore(assetId: string, lookbackDate: Date): Promise<number> {
  const incidents = await prisma.incident.findMany({
    where: {
      vehicleId: assetId,
      incidentDate: { gte: lookbackDate },
    },
  })

  if (incidents.length === 0) {
    // No incidents - perfect score
    return 100
  }

  // Severity weights
  const severityWeights = {
    [IncidentSeverity.Low]: 5,
    [IncidentSeverity.Medium]: 15,
    [IncidentSeverity.High]: 30,
    [IncidentSeverity.Critical]: 50,
  }

  // Calculate total penalty
  let penalty = 0
  incidents.forEach(incident => {
    const baseWeight = severityWeights[incident.severity] || 10
    // Double penalty for at-fault incidents
    const multiplier = incident.atFault ? 2 : 1
    penalty += baseWeight * multiplier
  })

  const score = Math.max(0, 100 - penalty)
  return Math.round(score)
}

/**
 * 5. Verified Ledger Events Score (15%)
 * Based on immutable event count, verification status, and completeness
 */
async function calculateLedgerScore(assetId: string, lookbackDate: Date): Promise<number> {
  const ledgerEvents = await prisma.immutableLedgerEvent.findMany({
    where: {
      assetId: assetId,
      timestamp: { gte: lookbackDate },
    },
  })

  if (ledgerEvents.length === 0) {
    // No ledger events - low score (not using the trust system)
    return 30
  }

  // Calculate verification rate
  const verified = ledgerEvents.filter(e => e.verificationStatus === 'VERIFIED').length
  const verificationRate = (verified / ledgerEvents.length) * 100

  // Event count score (more events = better documentation)
  // Expect at least 1 event per month
  const daysSinceStart = Math.floor((new Date().getTime() - lookbackDate.getTime()) / (1000 * 60 * 60 * 24))
  const expectedEvents = Math.ceil(daysSinceStart / 30)
  const countScore = Math.min(100, (ledgerEvents.length / expectedEvents) * 100)

  // Combine scores
  const score = verificationRate * 0.7 + countScore * 0.3

  return Math.round(score)
}

/**
 * 6. Parts Provenance Score (5%)
 * Based on OEM vs aftermarket percentage and traceability
 */
async function calculatePartsScore(assetId: string): Promise<number> {
  const installations = await prisma.partInstallation.findMany({
    where: { vehicleId: assetId },
    include: { part: true },
  })

  if (installations.length === 0) {
    // No parts data - neutral score
    return 70
  }

  // Calculate percentage of parts with manufacturer info (proxy for quality/traceability)
  const partsWithManufacturer = installations.filter(i => i.part.manufacturer).length
  const traceabilityPercentage = (partsWithManufacturer / installations.length) * 100

  // Parts with manufacturer info get higher scores
  const score = 50 + (traceabilityPercentage * 0.5)

  return Math.round(score)
}

/**
 * 7. Downtime Risk Score (5%)
 * Based on historical uptime and critical component status
 */
async function calculateDowntimeScore(assetId: string, lookbackDate: Date): Promise<number> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: assetId },
    include: {
      workOrders: {
        where: { createdAt: { gte: lookbackDate } },
      },
    },
  })

  if (!vehicle) {
    return 50
  }

  // Check current status
  if (vehicle.status === VehicleStatus.OutOfService || vehicle.status === VehicleStatus.Decommissioned) {
    return 0
  }

  if (vehicle.status === VehicleStatus.InRepair) {
    return 40
  }

  // Calculate downtime from work orders
  const totalDowntimeDays = vehicle.workOrders.reduce((total, wo) => {
    if (wo.completedAt && wo.createdAt) {
      const days = Math.floor((wo.completedAt.getTime() - wo.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      return total + days
    }
    return total
  }, 0)

  const daysInPeriod = Math.floor((new Date().getTime() - lookbackDate.getTime()) / (1000 * 60 * 60 * 24))
  const uptimePercentage = ((daysInPeriod - totalDowntimeDays) / daysInPeriod) * 100

  return Math.round(Math.max(0, Math.min(100, uptimePercentage)))
}

/**
 * Recalculate and store trust score for an asset
 */
export async function updateAssetTrustScore(assetId: string): Promise<void> {
  const breakdown = await calculateAssetTrustScore({
    assetId,
    assetType: 'VEHICLE',
  })

  // Store or update the trust score
  await prisma.assetTrustScore.upsert({
    where: { assetId },
    create: {
      assetId,
      overallScore: breakdown.totalScore,
      maintenanceScore: breakdown.maintenanceScore,
      inspectionScore: breakdown.inspectionScore,
      complianceScore: breakdown.complianceScore,
      incidentScore: breakdown.incidentScore,
      verificationScore: breakdown.ledgerScore,
      lastCalculated: breakdown.calculatedAt,
      metadata: breakdown as any,
    },
    update: {
      overallScore: breakdown.totalScore,
      maintenanceScore: breakdown.maintenanceScore,
      inspectionScore: breakdown.inspectionScore,
      complianceScore: breakdown.complianceScore,
      incidentScore: breakdown.incidentScore,
      verificationScore: breakdown.ledgerScore,
      lastCalculated: breakdown.calculatedAt,
      metadata: breakdown as any,
    },
  })
}

/**
 * Batch recalculate trust scores for all assets in an organization
 */
export async function recalculateAllTrustScores(orgId: string): Promise<number> {
  const vehicles = await prisma.vehicle.findMany({
    where: { orgId },
    select: { id: true },
  })

  let successCount = 0

  for (const vehicle of vehicles) {
    try {
      await updateAssetTrustScore(vehicle.id)
      successCount++
    } catch (error) {
      console.error(`Failed to calculate trust score for vehicle ${vehicle.id}:`, error)
    }
  }

  return successCount
}

/**
 * Get trust score for an asset (from cache or calculate if missing)
 */
export async function getAssetTrustScore(assetId: string): Promise<TrustScoreBreakdown | null> {
  const cached = await prisma.assetTrustScore.findUnique({
    where: { assetId },
  })

  if (cached) {
    // Check if cache is stale (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    if (cached.lastCalculated < oneHourAgo) {
      // Recalculate in background
      updateAssetTrustScore(assetId).catch(console.error)
    }

    return {
      totalScore: cached.overallScore,
      maintenanceScore: cached.maintenanceScore || 0,
      inspectionScore: cached.inspectionScore || 0,
      complianceScore: cached.complianceScore || 0,
      incidentScore: cached.incidentScore || 0,
      ledgerScore: cached.verificationScore || 0,
      partsScore: 0, // Not stored separately
      downtimeScore: 0, // Not stored separately
      calculatedAt: cached.lastCalculated,
    }
  }

  // Calculate fresh if not cached
  const breakdown = await calculateAssetTrustScore({
    assetId,
    assetType: 'VEHICLE',
  })

  // Store it
  await updateAssetTrustScore(assetId)

  return breakdown
}
