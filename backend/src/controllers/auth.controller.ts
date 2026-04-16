import { Request, Response } from 'express'
import * as authService from '../services/auth.service'

type AuthRequest = Request & {
  user?: {
    id: string
    username: string
    role: string
    companyId: string
  }
}

const COOKIE_NAME = 'auth'

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body as {
      username?: string
      password?: string
    }

    if (!username || !password) {
      return res.status(400).json({
        error: 'username and password are required',
      })
    }

    const result = await authService.loginUser(username, password)

    res.cookie(COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    return res.json({
      user: result.user,
    })
  } catch (error: any) {
    if (error?.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    console.error(error)
    return res.status(500).json({ error: 'Failed to login' })
  }
}

export async function logout(_req: Request, res: Response) {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    })

    return res.json({ ok: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to logout' })
  }
}

export async function me(req: AuthRequest, res: Response) {
  return res.json({
    user: req.user,
  })
}