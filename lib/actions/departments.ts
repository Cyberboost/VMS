'use server'

import prisma from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth-utils'
import { auditCreate, auditUpdate, auditDelete } from '@/lib/audit'
import { UserRole } from '@prisma/client'
import { requirePermission } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

export async function getDepartments(orgId: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'departments:read')

  if (!orgId && !context.orgId) {
    throw new Error('Organization ID is required')
  }

  const departments = await prisma.department.findMany({
    where: {
      orgId: orgId || context.orgId!,
    },
    include: {
      parentDept: true,
      childDepts: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return departments
}

export async function getDepartmentById(id: string) {
  const context = await requireAuth()
  requirePermission(context.role, 'departments:read')

  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      parentDept: true,
      childDepts: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })

  if (!department) {
    throw new Error('Department not found')
  }

  // Verify user has access to this org
  if (context.orgId && department.orgId !== context.orgId) {
    throw new Error('Access denied')
  }

  return department
}

export async function createDepartment(data: {
  name: string
  code?: string
  parentDeptId?: string
  orgId?: string
}) {
  const context = await requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.FLEET_MANAGER])
  requirePermission(context.role, 'departments:manage')

  const orgId = data.orgId || context.orgId
  if (!orgId) {
    throw new Error('Organization ID is required')
  }

  const department = await prisma.department.create({
    data: {
      name: data.name,
      code: data.code,
      parentDeptId: data.parentDeptId,
      orgId,
      createdBy: context.userId,
    },
  })

  await auditCreate('Department', department.id, department, context.userId, orgId)
  revalidatePath('/departments')

  return department
}

export async function updateDepartment(
  id: string,
  data: {
    name?: string
    code?: string
    parentDeptId?: string
  }
) {
  const context = await requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.FLEET_MANAGER])
  requirePermission(context.role, 'departments:manage')

  const existing = await prisma.department.findUnique({ where: { id } })
  if (!existing) {
    throw new Error('Department not found')
  }

  // Verify user has access to this org
  if (context.orgId && existing.orgId !== context.orgId) {
    throw new Error('Access denied')
  }

  const updated = await prisma.department.update({
    where: { id },
    data: {
      ...data,
      updatedBy: context.userId,
    },
  })

  await auditUpdate('Department', id, existing, updated, context.userId, existing.orgId)
  revalidatePath('/departments')
  revalidatePath(`/departments/${id}`)

  return updated
}

export async function deleteDepartment(id: string) {
  const context = await requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN])
  requirePermission(context.role, 'departments:manage')

  const department = await prisma.department.findUnique({ where: { id } })
  if (!department) {
    throw new Error('Department not found')
  }

  // Verify user has access to this org
  if (context.orgId && department.orgId !== context.orgId) {
    throw new Error('Access denied')
  }

  // Check if department has child departments
  const childCount = await prisma.department.count({
    where: { parentDeptId: id },
  })

  if (childCount > 0) {
    throw new Error('Cannot delete department with child departments')
  }

  // Check if department has users
  const userCount = await prisma.user.count({
    where: { departmentId: id },
  })

  if (userCount > 0) {
    throw new Error('Cannot delete department with assigned users')
  }

  await prisma.department.delete({ where: { id } })
  await auditDelete('Department', id, department, context.userId, department.orgId)
  revalidatePath('/departments')

  return { success: true }
}
