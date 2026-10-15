import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,https://pehchaan-skit021.onrender.com'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/pehchaan?schema=public'),
  SESSION_SECRET: z.string().default('pehchaan_default_secure_session_secret_key_32bytes!'),
  JWT_SECRET: z.string().default('pehchaan_default_secure_jwt_secret_key_32bytes!'),
  COOKIE_NAME: z.string().default('pehchaan_session'),
  COOKIE_SECURE: z.string().default(process.env.NODE_ENV === 'production' ? 'true' : 'false').transform((v) => v === 'true'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  SESSION_MAX_AGE_MS: z.string().default('86400000').transform((v) => parseInt(v, 10)),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('./uploads/evidence'),
  MAX_FILE_SIZE_BYTES: z.string().default('10485760').transform((v) => parseInt(v, 10)),
  // Initial Admin Defaults
  INITIAL_ADMIN_EMAIL: z.string().default('studentaffairs@skit.ac.in'),
  INITIAL_ADMIN_PASSWORD: z.string().default('ChangeMeOnFirstLogin2024!'),
  INITIAL_INSTITUTION_CODE: z.string().default('SKIT-021'),
  INITIAL_INSTITUTION_NAME: z.string().default('Swami Keshvanand Institute of Technology, Management & Gramothan'),
  INITIAL_PORTAL_ID: z.string().default('SKIT021-EDU-CLOUD')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:', parsedEnv.error.format());
  throw new Error('Environment configuration error');
}

export const env = parsedEnv.data;
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL;
}
export const isProd = env.NODE_ENV === 'production';
export const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

// Production Security Check: Ensure real secrets are provided in production
if (isProd) {
  if (env.JWT_SECRET === 'pehchaan_default_secure_jwt_secret_key_32bytes!' || env.JWT_SECRET.length < 32) {
    console.warn('⚠️ WARNING: Using fallback or short JWT_SECRET in production. Configure a cryptographically secure 256-bit JWT_SECRET in server environment variables.');
  }
  if (env.SESSION_SECRET === 'pehchaan_default_secure_session_secret_key_32bytes!' || env.SESSION_SECRET.length < 32) {
    console.warn('⚠️ WARNING: Using fallback or short SESSION_SECRET in production. Configure a secure SESSION_SECRET in server environment variables.');
  }
}
