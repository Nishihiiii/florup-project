import type { NextFunction, Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthRequest } from '../types/index.js';
import { verifyToken } from '../utils/auth.js';

export function extractToken(req: AuthRequest): string {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const payload = verifyToken(extractToken(req));
  if (!payload) {
    res.status(401).json({ error: 'Требуется авторизация' });
    return;
  }
  req.user = payload;
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.sub) {
      res.status(401).json({ error: 'Требуется авторизация' });
      return;
    }
    const profile = await prisma.profiles.findUnique({
      where: { id: req.user.sub },
      include: { roles: { select: { name: true } } },
    });
    const roleName = profile?.roles?.name || 'user';
    if (!allowedRoles.includes(roleName)) {
      res.status(403).json({ error: 'Недостаточно прав для выполнения этого действия' });
      return;
    }
    next();
  };
}