import { Router } from 'express'
import {
  getReportsDashboardController,
  getReportsFiltersController,
} from '../controllers/reports.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/filters', requireAuth, getReportsFiltersController)
router.get('/dashboard', requireAuth, getReportsDashboardController)

export default router
