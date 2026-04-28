import { Router } from 'express'
import {
  createStaffEvaluationCriterionController,
  getPeopleEvaluationRatingsController,
  getPersonEvaluationSummaryController,
  listEventStaffForReviewController,
  listStaffEvaluationCriteriaController,
  saveStaffEvaluationController,
} from '../controllers/staff-evaluations.controller'

const router = Router()

router.get('/criteria', listStaffEvaluationCriteriaController)
router.post('/criteria', createStaffEvaluationCriterionController)

router.get('/events/:eventDateId/staff', listEventStaffForReviewController)
router.post('/events/:eventDateId/staff/evaluations', saveStaffEvaluationController)

router.get('/people/ratings', getPeopleEvaluationRatingsController)
router.get('/people/:personId/summary', getPersonEvaluationSummaryController)

export default router
