import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { createTestCompany } from '../controllers/companies.controller'

const router = Router()

router.post('/create-test-company', requireAuth, createTestCompany)

export default router