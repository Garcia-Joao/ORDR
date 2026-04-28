import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import {
  getSalesEnvironments,
  createSalesEnvironment,
  deleteSalesEnvironment,
} from '../controllers/sales-environments.controller'

const router = Router()

router.get('/', requireAuth, getSalesEnvironments)
router.post('/', requireAuth, createSalesEnvironment)
router.delete('/:id', requireAuth, deleteSalesEnvironment)

export default router