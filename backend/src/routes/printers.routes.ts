import { Router } from 'express'
import {
  getSystemPrinters,
  getPrinterSettings,
  savePrinterSettings,
  testPrinter,
} from '../controllers/printers.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/system', requireAuth, getSystemPrinters)
router.get('/settings', requireAuth, getPrinterSettings)
router.put('/settings', requireAuth, savePrinterSettings)
router.post('/test', requireAuth, testPrinter)

export default router