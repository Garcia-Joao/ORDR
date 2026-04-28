import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import {
  getStockProducts,
  createStockMovement,
  getProductStockMovements,
  getRecipeAnalysis,
  calculateRecipeProduction,
} from '../controllers/stock.controller'

const router = Router()

router.get('/', requireAuth, getStockProducts)
router.post('/movements', requireAuth, createStockMovement)
router.get('/:productId/movements', requireAuth, getProductStockMovements)
router.get('/:productId/recipe-analysis', requireAuth, getRecipeAnalysis)
router.get('/:productId/calculator', requireAuth, calculateRecipeProduction)

export default router