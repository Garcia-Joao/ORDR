import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import authRouter from './routes/auth.routes'
import productsRouter from './routes/products.routes'
import categoriesRouter from './routes/categories.routes'
import { prisma } from './lib/prisma'

const app = express()

app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
)

app.use(cookieParser())
app.use(express.json())

app.use('/auth', authRouter)
app.use('/products', productsRouter)
app.use('/categories', categoriesRouter)

app.get('/seed-user', async (_req, res) => {
  try {
    let company = await prisma.company.findFirst({
      where: { name: 'Minha Empresa' },
    })

    if (!company) {
      company = await prisma.company.create({
        data: { name: 'Minha Empresa' },
      })
    }

    const existingUser = await prisma.user.findFirst({
      where: { username: 'admin' },
    })

    if (existingUser) {
      return res.json({
        ok: true,
        message: 'Usuário já existe',
        user: {
          id: existingUser.id,
          username: existingUser.username,
        },
        company,
      })
    }

    const hashedPassword = await bcrypt.hash('123456', 10)

    const user = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        companyId: company.id,
      },
    })

    return res.json({
      ok: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        username: user.username,
      },
      company,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar seed user' })
  }
})

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return res.json({ ok: true, db: 'connected' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ ok: false, db: 'disconnected' })
  }
})

export default app