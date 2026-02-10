import { UserRole } from '@prisma/client'

export type Permission =
  | 'vehicles:read'
  | 'vehicles:create'
  | 'vehicles:update'
  | 'vehicles:delete'
  | 'drivers:read'
  | 'drivers:create'
  | 'drivers:update'
  | 'drivers:delete'
  | 'incidents:read'
  | 'incidents:create'
  | 'incidents:update'
  | 'incidents:delete'
  | 'surplus:read'
  | 'surplus:create'
  | 'surplus:approve'
  | 'surplus:update'
  | 'surplus:delete'
  | 'reports:read'
  | 'reports:export'
  | 'admin:access'

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.Admin]: [
    'vehicles:read',
    'vehicles:create',
    'vehicles:update',
    'vehicles:delete',
    'drivers:read',
    'drivers:create',
    'drivers:update',
    'drivers:delete',
    'incidents:read',
    'incidents:create',
    'incidents:update',
    'incidents:delete',
    'surplus:read',
    'surplus:create',
    'surplus:approve',
    'surplus:update',
    'surplus:delete',
    'reports:read',
    'reports:export',
    'admin:access',
  ],
  [UserRole.FleetManager]: [
    'vehicles:read',
    'vehicles:create',
    'vehicles:update',
    'vehicles:delete',
    'drivers:read',
    'drivers:create',
    'drivers:update',
    'drivers:delete',
    'incidents:read',
    'incidents:create',
    'incidents:update',
    'incidents:delete',
    'surplus:read',
    'surplus:create',
    'surplus:update',
    'surplus:delete',
    'reports:read',
    'reports:export',
  ],
  [UserRole.Supervisor]: [
    'vehicles:read',
    'vehicles:update',
    'drivers:read',
    'incidents:read',
    'surplus:read',
    'surplus:approve',
    'reports:read',
  ],
  [UserRole.Driver]: ['vehicles:read', 'incidents:read', 'incidents:create'],
  [UserRole.Viewer]: [
    'vehicles:read',
    'drivers:read',
    'incidents:read',
    'surplus:read',
    'reports:read',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error('Insufficient permissions')
  }
}
