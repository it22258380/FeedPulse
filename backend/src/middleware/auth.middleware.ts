import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

interface JwtPayload { id: string; email: string; role: string; }

declare global {
  namespace Express {
    interface Request { user?: JwtPayload; }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. Please provide a valid Bearer token.', 401);
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) sendError(res, 'Token has expired. Please log in again.', 401);
    else sendError(res, 'Invalid token. Please log in again.', 401);
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    sendError(res, 'Admin access required.', 403);
    return;
  }
  next();
};
