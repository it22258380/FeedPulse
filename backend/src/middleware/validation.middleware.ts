import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    // Surface the first validation message in `message` for client-friendly feedback
    sendError(res, messages.join(', '), 400, messages[0]);
    return;
  }
  next();
};

export const validateFeedbackSubmission = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters').escape(),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('category').trim().notEmpty().withMessage('Category is required').isIn(['Bug', 'Feature Request', 'Improvement', 'Other']).withMessage('Invalid category'),
  body('submitterName').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }).escape(),
  body('submitterEmail').optional({ nullable: true, checkFalsy: true }).trim().isEmail().withMessage('Invalid email').normalizeEmail(),
  validate,
];

export const validateStatusUpdate = [
  param('id').isMongoId().withMessage('Invalid feedback ID'),
  body('status').notEmpty().withMessage('Status is required').isIn(['New', 'In Review', 'Resolved']).withMessage('Status must be: New, In Review, or Resolved'),
  validate,
];

export const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];

export const validateLogin = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

export const validateFeedbackQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['Bug', 'Feature Request', 'Improvement', 'Other', '']),
  query('status').optional().isIn(['New', 'In Review', 'Resolved', '']),
  validate,
];
