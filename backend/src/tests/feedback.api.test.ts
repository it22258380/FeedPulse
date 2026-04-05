import request from 'supertest';
import app from '../app';
import Feedback from '../models/feedback.model';
import { analyzeFeedback } from '../services/gemini.service';
import jwt from 'jsonwebtoken';

jest.mock('../models/feedback.model', () => {
  const mockMongooseModel = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(true),
    _id: 'mock-id'
  }));
  (mockMongooseModel as any).findByIdAndUpdate = jest.fn();
  (mockMongooseModel as any).findById = jest.fn();
  (mockMongooseModel as any).find = jest.fn();
  (mockMongooseModel as any).countDocuments = jest.fn();
  (mockMongooseModel as any).aggregate = jest.fn();
  return {
    __esModule: true,
    default: mockMongooseModel
  };
});

jest.mock('../services/gemini.service', () => ({
  analyzeFeedback: jest.fn().mockResolvedValue({
    category: 'Bug',
    sentiment: 'Negative',
    priority_score: 8,
    summary: 'Mock summary',
    tags: ['bug']
  })
}));

describe('Feedback API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/feedback', () => {
    it('valid submission saves to DB and triggers AI', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .send({
          title: 'Valid feedback title',
          description: 'This is a description that is at least 20 chars long.',
          category: 'Bug'
        });
      
      expect(res.status).toBe(201);
      expect(Feedback).toHaveBeenCalled(); // constructor was called indicating a new model intance

      // Give event loop time to trigger background promise
      await new Promise(r => setTimeout(r, 50));
      expect(analyzeFeedback).toHaveBeenCalledWith('Valid feedback title', 'This is a description that is at least 20 chars long.');
    });

    it('rejects empty title (validation test)', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .send({
          title: '', // empty title
          description: 'This is a description that is at least 20 chars',
          category: 'Bug'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Title is required');
      expect(Feedback).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/feedback/:id', () => {
    it('status update works correctly', async () => {
      // Create admin token
      const token = jwt.sign({ id: '1', email: 'admin@demo.com', role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret');
      
      // Setup mock
      (Feedback.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: '60c72b2f9b1d8b001c8e4c1d',
        title: 'Title',
        status: 'In Review'
      });

      const res = await request(app)
        .patch('/api/feedback/60c72b2f9b1d8b001c8e4c1d') // Valid mongo ID format
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'In Review'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('In Review');
      expect(Feedback.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('Auth middleware on protected routes', () => {
    it('protected routes reject unauthenticated requests', async () => {
      const res = await request(app)
        .get('/api/feedback') // A protected route requiring admin
        .send(); // no token provided
      
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Authentication required');
    });
  });
});
