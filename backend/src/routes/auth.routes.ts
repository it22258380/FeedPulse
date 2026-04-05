import { Router } from 'express';
import { login, getProfile } from '../controllers/auth.controller';
import { validateLogin } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimit } from '../middleware/rateLimiter.middleware';

const router = Router();
router.post('/login', authRateLimit, validateLogin, login);
router.get('/profile', authenticate, getProfile);
export default router;
