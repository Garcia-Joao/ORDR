import { Router } from 'express'
import {
  cancelBuyRequestController,
  clearBuyCartController,
  confirmBuyCartController,
  createBuyRequestController,
  getBuyCartController,
  getBuyRequestController,
  listBuyRequestsController,
  printBuyRequestShoppingListController,
  receiveBuyRequestController,
  removeBuyCartItemController,
  updateBuyCartController,
  upsertBuyCartItemController,
} from '../controllers/buys.controller'

const router = Router()

router.get('/cart', getBuyCartController)
router.patch('/cart', updateBuyCartController)
router.put('/cart/items', upsertBuyCartItemController)
router.delete('/cart/items/:productId', removeBuyCartItemController)
router.delete('/cart', clearBuyCartController)
router.post('/cart/confirm', confirmBuyCartController)

router.get('/', listBuyRequestsController)
router.post('/', createBuyRequestController)
router.get('/:id', getBuyRequestController)
router.post('/:id/print-shopping-list', printBuyRequestShoppingListController)
router.patch('/:id/receive', receiveBuyRequestController)
router.patch('/:id/cancel', cancelBuyRequestController)

export default router
