import { Router } from 'express'
import {
  createOrder,
  getOrders,
  cancelOrder,
  downloadOrdersReportPdf,
  getOrdersReportSummary,
} from '../controllers/orders.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/', requireAuth, getOrders)
router.post('/', requireAuth, createOrder)
router.patch('/:id/cancel', requireAuth, cancelOrder)
router.get('/report/pdf', requireAuth, downloadOrdersReportPdf)
router.get('/report/summary', requireAuth, getOrdersReportSummary)

export default router