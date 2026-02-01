import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export const authenticateAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
     res.status(401).json({ message: 'No token provided' });
     return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET || 'secret') as {
      id: number;
      username: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
     res.status(401).json({ message: 'Invalid token' });
     return;
  }
};
