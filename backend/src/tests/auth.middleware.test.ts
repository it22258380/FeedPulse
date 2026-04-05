import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('authenticate rejects unauthenticated requests missing header', () => {
    authenticate(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it('authenticate rejects invalid token', () => {
    mockReq.headers = { authorization: 'Bearer invalidtoken' };
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid'); });
    
    authenticate(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it('authenticate calls next() and sets req.user with valid token', () => {
    mockReq.headers = { authorization: 'Bearer validtoken' };
    const mockUser = { id: '1', email: 'a@a.com', role: 'admin' };
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);
    
    authenticate(mockReq as Request, mockRes as Response, mockNext);
    expect(mockReq.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
  });

  it('requireAdmin allows admin users', () => {
    mockReq.user = { id: '1', email: 'a@a.com', role: 'admin' };
    requireAdmin(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('requireAdmin rejects non-admin users', () => {
    mockReq.user = { id: '1', email: 'u@u.com', role: 'user' };
    requireAdmin(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });
});
