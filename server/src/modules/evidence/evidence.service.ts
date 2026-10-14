import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../../config/env.js';

// Ensure upload directory exists
const uploadDir = path.resolve(env.STORAGE_LOCAL_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types for academic evidence: PDF, PNG, JPEG, WEBP
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = `${crypto.randomUUID()}${ext}`;
    cb(null, randomName);
  }
});

export const uploadEvidenceMiddleware = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_BYTES // e.g. 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, JPG, PNG, and WEBP files are accepted.'));
    }
  }
});

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
