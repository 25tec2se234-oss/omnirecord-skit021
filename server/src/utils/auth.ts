import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env, isProd } from '../config/env.js';
import { AuthUserPayload } from '../types/index.js';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '24h'
  });
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE || isProd,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: env.SESSION_MAX_AGE_MS,
    path: '/'
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE || isProd,
    sameSite: env.COOKIE_SAME_SITE,
    path: '/'
  });
}
