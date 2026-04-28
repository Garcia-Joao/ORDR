import { prisma } from '../lib/prisma'

type AuditLogInput = {
  companyId: string
  userId?: string | null
  entityType: string
  entityId: string
  action: string
  description?: string | null
  oldValues?: unknown
  newValues?: unknown
  metadata?: unknown
}

export async function createAuditLog(tx: any, input: AuditLogInput) {
  await tx.auditLog.create({
    data: {
      companyId: input.companyId,
      userId: input.userId ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      description: input.description ?? null,
      oldValues: input.oldValues ?? undefined,
      newValues: input.newValues ?? undefined,
      metadata: input.metadata ?? undefined,
    },
  })
}

export async function createAuditLogDirect(input: AuditLogInput) {
  await prisma.auditLog.create({
    data: {
      companyId: input.companyId,
      userId: input.userId ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      description: input.description ?? null,
      oldValues: input.oldValues ?? undefined,
      newValues: input.newValues ?? undefined,
      metadata: input.metadata ?? undefined,
    },
  })
}