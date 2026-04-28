import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRouter from './routes/auth.routes'
import productsRouter from './routes/products.routes'
import categoriesRouter from './routes/categories.routes'
import ordersRouter from './routes/orders.routes'
import companiesRouter from './routes/companies.routes'
import { internalCustomersRoutes } from './routes/internal-customers.routes'
import salesEnvironmentsRouter from './routes/sales-environments.routes'
import stockRouter from './routes/stock.routes'
import printersRouter from './routes/printers.routes'
import { peopleRoutes } from './routes/people.routes'
import eventsRoutes from './routes/events.routes'
import customersRoutes from './routes/customers.routes'
import staffEvaluationsRoutes from './routes/staff-evaluations.routes'
import buysRoutes from './routes/buys.routes'
import reportsRoutes from './routes/reports.routes'

import { prisma } from './lib/prisma'

const app = express()

app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
)

app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/auth', authRouter)
app.use('/products', productsRouter)
app.use('/categories', categoriesRouter)
app.use('/orders', ordersRouter)
app.use('/companies', companiesRouter)
app.use('/internal-customers', internalCustomersRoutes)
app.use('/sales-environments', salesEnvironmentsRouter)
app.use('/stock', stockRouter)
app.use('/printers', printersRouter)
app.use('/people', peopleRoutes)
app.use('/events', eventsRoutes)
app.use('/customers', customersRoutes)
app.use('/staff-evaluations', staffEvaluationsRoutes)
app.use('/buys', buysRoutes)
app.use('/reports', reportsRoutes)


app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    return res.json({
      ok: true,
      db: 'connected',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      db: 'disconnected',
    })
  }
})

export default app