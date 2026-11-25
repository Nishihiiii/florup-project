import crypto from 'node:crypto';
import type { JwtPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'florup-dev-secret-change-in-env';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored?: string | null): boolean {
  if (!stored || !stored.includes(':')) return false;
  const [salt, originalHex] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, 'hex');
  if (candidate.length !== original.length) return false;
  return crypto.timingSafeEqual(candidate, original);
}

export function hashResetCode(code: string): string {
  return crypto.createHash('sha256').update(`${code}:${JWT_SECRET}`).digest('hex');
}

const b64url = (input: string): string => Buffer.from(input).toString('base64url');

export function signToken(
  payload: Omit<JwtPayload, 'exp'>,
  expiresInSeconds = 60 * 60 * 24 * 7,
): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds }),
  );
  const sig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token?: string): JwtPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as JwtPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}