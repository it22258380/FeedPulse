import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';

export const feedbackRateLimit = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, 'Too many submissions from this IP. Please try again in an hour.', 429),
  keyGenerator: (req) => req.ip || 'unknown',
});

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, 'Too many requests. Please slow down.', 429),
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (_req, res) => sendError(res, 'Too many login attempts. Try again in 15 minutes.', 429),
});
