'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'
import { surplusRequestSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'
import { SurplusStatus } from '@prisma/client'
import { auditCreate, auditUpdate, auditDelete } from '@/lib/audit'

export async function createSurplusRequest(data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'surplus:create')

  const orgId = session.user.orgId

  const validatedData = surplusRequestSchema.parse(data)

  const request = await prisma.surplusRequest.create({
    data: {
      ...validatedData,
      orgId,
    },
  })

  await auditCreate('SurplusRequest', request.id, validatedData, session.user.id, orgId)

  revalidatePath('/surplus')
  revalidatePath(`/vehicles/${validatedData.vehicleId}`)
  return request
}

export async function approveSurplusRequest(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'surplus:approve')

  const before = await prisma.surplusRequest.findUnique({ where: { id } })
  if (!before) {
    throw new Error('Surplus request not found')
  }

  const request = await prisma.surplusRequest.update({
    where: { id },
    data: {
      status: SurplusStatus.Approved,
      approvedBy: session.user.id,
      approvedAt: new Date(),
    },
  })

  await auditUpdate('SurplusRequest', request.id, before, { status: 'Approved' }, session.user.id, before.orgId)

  revalidatePath('/surplus')
  return request
}

export async function rejectSurplusRequest(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'surplus:approve')

  const before = await prisma.surplusRequest.findUnique({ where: { id } })
  if (!before) {
    throw new Error('Surplus request not found')
  }

  const request = await prisma.surplusRequest.update({
    where: { id },
    data: {
      status: SurplusStatus.Closed,
      approvedBy: session.user.id,
      approvedAt: new Date(),
    },
  })

  await auditUpdate('SurplusRequest', request.id, before, { status: 'Closed' }, session.user.id, before.orgId)

  revalidatePath('/surplus')
  return request
}

export async function updateSurplusRequestStatus(id: string, status: SurplusStatus) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'surplus:update')

  const before = await prisma.surplusRequest.findUnique({ where: { id } })
  if (!before) {
    throw new Error('Surplus request not found')
  }

  const request = await prisma.surplusRequest.update({
    where: { id },
    data: { status },
  })

  await auditUpdate('SurplusRequest', request.id, before, { status }, session.user.id, before.orgId)

  revalidatePath('/surplus')
  return request
}

export async function getSurplusRequests(filters?: { status?: SurplusStatus; vehicleId?: string }) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'surplus:read')

  const where: any = {}

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.vehicleId) {
    where.vehicleId = filters.vehicleId
  }

  return await prisma.surplusRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      vehicle: true,
      requester: true,
      approver: true,
    },
  })
}

export async function getSurplusRequestById(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  requirePermission(session.user.role, 'surplus:read')

  return await prisma.surplusRequest.findUnique({
    where: { id },
    include: {
      vehicle: true,
      requester: true,
      approver: true,
    },
  })
}
