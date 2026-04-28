import { Router } from 'express'
import {
  createCustomerController,
  deleteCustomerController,
  getCustomerController,
  listCustomersController,
  lookupCustomerByEventComandaController,
  removeEventCustomerComandaController,
  updateCustomerController,
  upsertEventCustomerComandaController,
} from '../controllers/customers.controller'

const router = Router()

router.get('/', listCustomersController)
router.get('/lookup-by-comanda', lookupCustomerByEventComandaController)
router.post('/', createCustomerController)
router.post('/event-comanda', upsertEventCustomerComandaController)
router.delete(
  '/event-comanda/:eventDateId/:customerId',
  removeEventCustomerComandaController
)
router.get('/:id', getCustomerController)
router.patch('/:id', updateCustomerController)
router.delete('/:id', deleteCustomerController)

export default router
