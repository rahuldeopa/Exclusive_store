import { Request, Response, NextFunction } from 'express';
import { createContentSetService } from '../services/content.service';
import { handleResponse } from '../utils/response.util';

export async function createContentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await createContentSetService(req.body);
    handleResponse(res, 201, 'Content created successfully', result);
  } catch (error) {
    next(error);
  }
}
