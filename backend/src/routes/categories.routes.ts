import { Router } from 'express'
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/', requireAuth, getCategories)
router.get('/:id', requireAuth, getCategoryById)
router.post('/', requireAuth, createCategory)
router.put('/:id', requireAuth, updateCategory)
router.delete('/:id', requireAuth, deleteCategory)

export default router