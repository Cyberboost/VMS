import prisma from './prisma'
import { AuditAction } from '@prisma/client'

export interface CreateAuditLogParams {
  orgId?: string | null
  entityType: string
  entityId: string
  action: AuditAction
  changedFields?: Record<string, any>
  beforeSnapshot?: Record<string, any>
  afterSnapshot?: Record<string, any>
  actorUserId?: string
  ipAddress?: string
}

/**
 * Helper to insert audit log entries on create/update/delete operations
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        orgId: params.orgId || null,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        changedFields: params.changedFields || undefined,
        beforeSnapshot: params.beforeSnapshot || undefined,
        afterSnapshot: params.afterSnapshot || undefined,
        actorUserId: params.actorUserId || null,
        ipAddress: params.ipAddress || null,
      },
    })
  } catch (error) {
    // Log error but don't fail the main operation
    console.error('Failed to create audit log:', error)
    return null
  }
}

/**
 * Create audit log for entity creation
 */
export async function auditCreate(
  entityType: string,
  entityId: string,
  data: Record<string, any>,
  actorUserId: string,
  orgId?: string | null
) {
  return createAuditLog({
    orgId,
    entityType,
    entityId,
    action: AuditAction.CREATE,
    afterSnapshot: data,
    actorUserId,
  })
}

/**
 * Create audit log for entity update
 */
export async function auditUpdate(
  entityType: string,
  entityId: string,
  before: Record<string, any>,
  after: Record<string, any>,
  actorUserId: string,
  orgId?: string | null
) {
  // Calculate changed fields
  const changedFields: Record<string, any> = {}
  for (const key in after) {
    if (after[key] !== before[key]) {
      changedFields[key] = { from: before[key], to: after[key] }
    }
  }

  return createAuditLog({
    orgId,
    entityType,
    entityId,
    action: AuditAction.UPDATE,
    changedFields,
    beforeSnapshot: before,
    afterSnapshot: after,
    actorUserId,
  })
}

/**
 * Create audit log for entity deletion
 */
export async function auditDelete(
  entityType: string,
  entityId: string,
  data: Record<string, any>,
  actorUserId: string,
  orgId?: string | null
) {
  return createAuditLog({
    orgId,
    entityType,
    entityId,
    action: AuditAction.DELETE,
    beforeSnapshot: data,
    actorUserId,
  })
}
