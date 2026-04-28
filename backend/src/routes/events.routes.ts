import { Router } from 'express'
import {
  cancelEventDateController,
  createEventDateController,
  createEventTemplateController,
  deleteEventDateController,
  deleteEventTemplateController,
  getEventDateController,
  getEventTemplateController,
  listCurrentEventDatesController,
  listEventDatesController,
  listEventPeopleController,
  listEventTemplatesController,
  updateEventDateController,
  updateEventDatePersonStatusController,
  updateEventTemplateController,
} from '../controllers/events.controller'

const router = Router()

router.get('/people', listEventPeopleController)

router.get('/templates', listEventTemplatesController)
router.get('/templates/:id', getEventTemplateController)
router.post('/templates', createEventTemplateController)
router.patch('/templates/:id', updateEventTemplateController)
router.delete('/templates/:id', deleteEventTemplateController)

router.get('/dates', listEventDatesController)
router.get('/dates/current', listCurrentEventDatesController)
router.get('/dates/:id', getEventDateController)
router.post('/dates', createEventDateController)
router.patch('/dates/:id', updateEventDateController)
router.patch('/dates/:id/cancel', cancelEventDateController)
router.delete('/dates/:id', deleteEventDateController)

router.patch(
  '/dates/:id/people/:personId/status',
  updateEventDatePersonStatusController
)

export default router
