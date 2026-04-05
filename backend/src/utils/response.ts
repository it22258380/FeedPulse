import { Response } from 'express';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

export const sendSuccess = <T>(
  res: Response, data: T, message?: string, statusCode = 200,
  pagination?: ApiResponse['pagination']
): void => {
  const response: ApiResponse<T> = { success: true, data, message };
  if (pagination) response.pagination = pagination;
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: string, statusCode = 500, message?: string): void => {
  // Ensure message is always present for client expectations (and tests).
  const responseMessage = message || error;
  res.status(statusCode).json({ success: false, error, message: responseMessage });
};
