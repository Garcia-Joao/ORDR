import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products.controller'

const router = Router()

router.get('/', requireAuth, getProducts)
router.get('/:id', requireAuth, getProductById)
router.post('/', requireAuth, createProduct)
router.patch('/:id', requireAuth, updateProduct)
router.delete('/:id', requireAuth, deleteProduct)

export default router