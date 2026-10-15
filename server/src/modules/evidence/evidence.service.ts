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

// Allowed extensions and corresponding MIME types for academic evidence: PDF, PNG, JPEG, WEBP
export const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);
export const EXTENSION_MIME_MAP: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.webp': ['image/webp']
};

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
    fileSize: env.MAX_FILE_SIZE_BYTES, // e.g. 10MB
    files: 1
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error(`Invalid file format. Disallowed extension: ${ext}. Only PDF, JPG, PNG, and WEBP files are accepted.`));
      return;
    }

    const validMimes = EXTENSION_MIME_MAP[ext] || [];
    if (!validMimes.includes(file.mimetype)) {
      cb(new Error(`Invalid file format. Declared MIME type "${file.mimetype}" does not match file extension "${ext}".`));
      return;
    }

    cb(null, true);
  }
});

/**
 * Inspects binary file signatures (magic bytes) to prevent extension/MIME spoofing.
 */
export function validateFileMagicBytes(buffer: Buffer, declaredMimeType: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  // PDF signature: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  if (declaredMimeType === 'application/pdf') {
    return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  }

  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (declaredMimeType === 'image/png') {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  // JPEG signature: FF D8 FF
  if (declaredMimeType === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // WEBP signature: RIFF at byte 0-3, WEBP at byte 8-11
  if (declaredMimeType === 'image/webp') {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }

  return false;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
