'use server'

import { auth } from './auth'
import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'

export interface SessionOrgContext {
  userId: string
  orgId: string | null
  role: UserRole
  departmentId: string | null
}

/**
 * Server-side helper that gets the session or throws/redirects
 */
export async function requireAuth(): Promise<SessionOrgContext> {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return {
    userId: session.user.id,
    orgId: session.user.orgId,
    role: session.user.role,
    departmentId: session.user.departmentId,
  }
}

/**
 * Checks if the user has one of the allowed roles
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<SessionOrgContext> {
  const context = await requireAuth()
  
  if (!allowedRoles.includes(context.role)) {
    throw new Error('Insufficient permissions')
  }

  return context
}

/**
 * Gets the session org context without redirecting
 */
export async function getSessionOrgContext(): Promise<SessionOrgContext | null> {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  return {
    userId: session.user.id,
    orgId: session.user.orgId,
    role: session.user.role,
    departmentId: session.user.departmentId,
  }
}

/**
 * Returns a Prisma where clause that scopes queries by org and optionally by department
 */
export function scopedWhere(
  orgId: string | null,
  userRole: UserRole,
  departmentId: string | null
): { orgId?: string; department?: string } {
  const where: { orgId?: string; department?: string } = {}

  // Multi-tenancy: scope by org
  if (orgId) {
    where.orgId = orgId
  }

  // Department scoping for DEPT_MANAGER
  if (userRole === UserRole.DEPT_MANAGER && departmentId) {
    // Note: This is a simplified version. In a real implementation,
    // you'd need to fetch the department record to get the department name/code
    // where.department = departmentCode
  }

  return where
}
