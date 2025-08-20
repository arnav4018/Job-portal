import { prisma } from './prisma'

interface AuditLogData {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  oldData?: string
  newData?: string
  metadata?: string
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.audit.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        oldData: data.oldData,
        newData: data.newData,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export async function getAuditLogs({
  userId,
  resource,
  action,
  page = 1,
  limit = 50,
}: {
  userId?: string
  resource?: string
  action?: string
  page?: number
  limit?: number
}) {
  const where: any = {}
  
  if (userId) where.userId = userId
  if (resource) where.resource = resource
  if (action) where.action = action

  const skip = (page - 1) * limit

  const [logs, total] = await Promise.all([
    prisma.audit.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.audit.count({ where }),
  ])

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}