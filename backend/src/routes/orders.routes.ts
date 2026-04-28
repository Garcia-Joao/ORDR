import { Router } from 'express'
import {
  createOrder,
  getOrders,
  cancelOrder,
  downloadOrdersReportPdf,
  getOrdersReportSummary,
  getInternalCustomerTodayOrders,
  payInternalCustomerTodayOrders,
  paySelectedInternalCustomerOrders,
  getInternalCustomerPendingOrders,
} from '../controllers/orders.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/', requireAuth, getOrders)
router.post('/', requireAuth, createOrder)
router.patch('/:id/cancel', requireAuth, cancelOrder)

router.get(
  '/internal-customer/:internalCustomerId/today',
  requireAuth,
  getInternalCustomerTodayOrders
)

router.post(
  '/internal-customer/:internalCustomerId/pay-today',
  requireAuth,
  payInternalCustomerTodayOrders
)

router.post(
  '/internal-customer/:internalCustomerId/pay-selected',
  requireAuth,
  paySelectedInternalCustomerOrders
)

router.get(
  '/internal-customer/:internalCustomerId/pending',
  requireAuth,
  getInternalCustomerPendingOrders
)

router.get('/report/pdf', requireAuth, downloadOrdersReportPdf)
router.get('/report/summary', requireAuth, getOrdersReportSummary)

export default router