import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { sendSuccess, sendError } from '../utils/response';

// Generate JWT token
const generateToken = (id: string, email: string, role: string): string =>
  jwt.sign({ id, email, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  } as jwt.SignOptions);

  //login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      sendError(res, 'Invalid email or password', 401, 'Authentication failed');
      return;
    }
    const token = generateToken(user._id.toString(), user.email, user.role);
    sendSuccess(res, { token, user: { id: user._id, email: user.email, role: user.role } }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed. Please try again.', 500);
  }
};
//get user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Not authenticated', 401); return; }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) { sendError(res, 'User not found', 404); return; }
    sendSuccess(res, user, 'Profile retrieved');
  } catch {
    sendError(res, 'Failed to retrieve profile', 500);
  }
};
