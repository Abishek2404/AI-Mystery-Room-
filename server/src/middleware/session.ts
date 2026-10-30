import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware that ensures every request has a session token.
 * Uses a simple cookie-based anonymous session for the MVP.
 */
export function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.sessionToken;
  if (!token) {
    token = uuidv4();
    res.cookie('sessionToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
  (req as any).sessionToken = token;
  next();
}

export function getSessionToken(req: Request): string {
  return (req as any).sessionToken || '';
}
