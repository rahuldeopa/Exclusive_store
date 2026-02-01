import { Response } from 'express';

export function handleResponse<T>(res: Response, status: number, message: string, data?: T) {
  res.status(status).json({
    success: status < 400,
    message,
    data,
  });
}

export function handleError(res: Response, error: any) {
  console.error(error);
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  res.status(status).json({
    success: false,
    message,
  });
}
