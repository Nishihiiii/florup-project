import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface LeafFeatures {
  yellowRatio: number;
  brownRatio: number;
  whiteRatio: number;
  greenRatio: number;
}