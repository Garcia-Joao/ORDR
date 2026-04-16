import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this'

type SafeUser = {
  id: string
  username: string
  role: string
  companyId: string
}

function toSafeUser(user: {
  id: string
  username: string
  role: any
  companyId: string
}): SafeUser {
  return {
    id: user.id,
    username: user.username,
    role: String(user.role),
    companyId: user.companyId,
  }
}

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  })

  if (!user) {
    throw new Error('INVALID_CREDENTIALS')
  }

  const passwordMatches = await bcrypt.compare(password, user.password)

  if (!passwordMatches) {
    throw new Error('INVALID_CREDENTIALS')
  }

  const safeUser = toSafeUser(user)

  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: String(user.role),
      companyId: user.companyId,
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
  })

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  return toSafeUser(user)
}