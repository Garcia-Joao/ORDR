import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this'

type SafeCompany = {
  id: string
  name: string
  isTest: boolean
  role: string
}

type SafeUser = {
  id: string
  username: string
  role: string
  companyId: string
  companies: SafeCompany[]
}

function toSafeUser(user: {
  id: string
  username: string
  role: any
  memberships: Array<{
    role: any
    company: {
      id: string
      name: string
      isTest: boolean
    }
  }>
}, activeCompanyId: string): SafeUser {
  return {
    id: user.id,
    username: user.username,
    role: String(user.role),
    companyId: activeCompanyId,
    companies: user.memberships.map((membership) => ({
      id: membership.company.id,
      name: membership.company.name,
      isTest: membership.company.isTest,
      role: String(membership.role),
    })),
  }
}

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      memberships: {
        include: {
          company: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!user) {
    throw new Error('INVALID_CREDENTIALS')
  }

  const passwordMatches = await bcrypt.compare(password, user.password)

  if (!passwordMatches) {
    throw new Error('INVALID_CREDENTIALS')
  }

  if (user.memberships.length === 0) {
    throw new Error('USER_WITHOUT_COMPANY')
  }

  const activeCompanyId = user.memberships[0].company.id
  const safeUser = toSafeUser(user, activeCompanyId)

  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: String(user.role),
      companyId: activeCompanyId,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  )

  return {
    token,
    user: safeUser,
  }
}

export async function getUserFromToken(token: string) {
  const decoded = jwt.verify(token, JWT_SECRET) as {
    sub: string
    username: string
    role: string
    companyId: string
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.sub,
    },
    include: {
      memberships: {
        include: {
          company: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  const hasAccessToCompany = user.memberships.some(
    (membership) => membership.company.id === decoded.companyId
  )

  if (!hasAccessToCompany) {
    throw new Error('COMPANY_ACCESS_DENIED')
  }

  return toSafeUser(user, decoded.companyId)
}

export async function switchUserCompany(userId: string, companyId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      memberships: {
        include: {
          company: true,
        },
      },
    },
  })

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  const hasAccessToCompany = user.memberships.some(
    (membership) => membership.company.id === companyId
  )

  if (!hasAccessToCompany) {
    throw new Error('COMPANY_ACCESS_DENIED')
  }

  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: String(user.role),
      companyId,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  )

  const safeUser = toSafeUser(user, companyId)

  return {
    token,
    user: safeUser,
  }
}

export async function getCompaniesForUser(userId: string) {
  const memberships = await prisma.userCompany.findMany({
    where: {
      userId,
    },
    include: {
      company: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return memberships.map((membership) => ({
    id: membership.company.id,
    name: membership.company.name,
    isTest: membership.company.isTest,
    role: String(membership.role),
  }))
}