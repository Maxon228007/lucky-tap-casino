import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: number;
  telegramId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const telegramId = req.headers['x-telegram-id'] as string;

  if (!telegramId) {
    res.status(401).json({ error: 'Unauthorized: missing telegram id' });
    return;
  }

  req.telegramId = telegramId;
  next();
}
