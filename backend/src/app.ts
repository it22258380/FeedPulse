import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { generalRateLimit } from './middleware/rateLimiter.middleware';
import feedbackRoutes from './routes/feedback.routes';
import authRoutes from './routes/auth.routes';
import { sendError } from './utils/response';

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use('/api', generalRateLimit);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'FeedPulse API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use((req: Request, res: Response) => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  sendError(res, err.message || 'Internal server error', 500);
});

export default app;
