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
  | 'compliance:read'
  | 'compliance:manage'
  | 'departments:read'
  | 'departments:manage'
  | 'maintenance:read'
  | 'maintenance:manage'

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
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
    'compliance:read',
    'compliance:manage',
    'departments:read',
    'departments:manage',
    'maintenance:read',
    'maintenance:manage',
  ],
  [UserRole.ORG_ADMIN]: [
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
    'compliance:read',
    'compliance:manage',
    'departments:read',
    'departments:manage',
    'maintenance:read',
    'maintenance:manage',
  ],
  [UserRole.FLEET_MANAGER]: [
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
    'compliance:read',
    'compliance:manage',
    'departments:read',
    'maintenance:read',
    'maintenance:manage',
  ],
  [UserRole.DEPT_MANAGER]: [
    'vehicles:read',
    'vehicles:update',
    'drivers:read',
    'incidents:read',
    'incidents:create',
    'incidents:update',
    'surplus:read',
    'surplus:create',
    'reports:read',
    'compliance:read',
    'departments:read',
    'maintenance:read',
  ],
  [UserRole.COMPLIANCE_OFFICER]: [
    'vehicles:read',
    'drivers:read',
    'incidents:read',
    'reports:read',
    'compliance:read',
    'compliance:manage',
    'departments:read',
  ],
  [UserRole.READ_ONLY]: [
    'vehicles:read',
    'drivers:read',
    'incidents:read',
    'surplus:read',
    'reports:read',
    'compliance:read',
    'departments:read',
    'maintenance:read',
  ],
  [UserRole.DRIVER]: [
    'vehicles:read',
    'incidents:read',
    'incidents:create',
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
