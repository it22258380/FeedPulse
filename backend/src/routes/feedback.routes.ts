import { Router } from 'express';
import {
  submitFeedback, getAllFeedback, getFeedbackById,
  updateFeedbackStatus, deleteFeedback, getAISummary,
  getFeedbackStats, reanalyzeFeedback,
} from '../controllers/feedback.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  validateFeedbackSubmission, validateStatusUpdate,
  validateMongoId, validateFeedbackQuery,
} from '../middleware/validation.middleware';
import { feedbackRateLimit } from '../middleware/rateLimiter.middleware';

const router = Router();

// Public
router.post('/', feedbackRateLimit, validateFeedbackSubmission, submitFeedback);

// Admin
router.get('/stats', authenticate, requireAdmin, getFeedbackStats);
router.get('/summary', authenticate, requireAdmin, getAISummary);
router.get('/', authenticate, requireAdmin, validateFeedbackQuery, getAllFeedback);
router.get('/:id', authenticate, requireAdmin, validateMongoId, getFeedbackById);
router.patch('/:id', authenticate, requireAdmin, validateStatusUpdate, updateFeedbackStatus);
router.post('/:id/reanalyze', authenticate, requireAdmin, validateMongoId, reanalyzeFeedback);
router.delete('/:id', authenticate, requireAdmin, validateMongoId, deleteFeedback);

export default router;
