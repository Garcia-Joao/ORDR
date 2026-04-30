import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { getProductCostHistoryController } from '../controllers/product-cost-history.controller'

const router = Router()

router.get('/', requireAuth, getProductCostHistoryController)

export default router
