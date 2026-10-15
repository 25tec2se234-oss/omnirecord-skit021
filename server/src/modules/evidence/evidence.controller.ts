import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../../db/client.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { formatFileSize, validateFileMagicBytes } from './evidence.service.js';

export async function uploadEvidenceFile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded.' });
      return;
    }

    const recordId = req.body.recordId as string;
    if (!recordId) {
      // Remove uploaded file to prevent orphan files
      fs.unlinkSync(req.file.path);
      res.status(400).json({ success: false, error: 'Target recordId is required.' });
      return;
    }

    const institutionId = req.user!.institutionId;

    // Verify record exists and belongs to the same institution
    const record = await prisma.participationRecord.findFirst({
      where: {
        id: recordId,
        institutionId
      },
      include: {
        studentProfile: true
      }
    });

    if (!record) {
      fs.unlinkSync(req.file.path);
      res.status(404).json({
        success: false,
        error: 'Target record not found in your institution.'
      });
      return;
    }

    // Role check: If student, verify they own the record
    if (req.user!.role === 'STUDENT') {
      const isOwner =
        (record.studentProfile.userId && record.studentProfile.userId === req.user!.userId) ||
        (record.studentProfile.email && record.studentProfile.email.toLowerCase() === req.user!.email.toLowerCase());
      if (!isOwner) {
        fs.unlinkSync(req.file.path);
        res.status(403).json({
          success: false,
          error: 'Access denied: You can only upload evidence documents for your own participation records.'
        });
        return;
      }
    }

    // Inspect file content / magic bytes to prevent spoofing
    const fileBuffer = fs.readFileSync(req.file.path);
    const isValidMagic = validateFileMagicBytes(fileBuffer, req.file.mimetype);
    if (!isValidMagic) {
      fs.unlinkSync(req.file.path);
      res.status(400).json({
        success: false,
        error: 'Invalid file content: The binary file signature does not match the declared MIME type. Upload rejected.'
      });
      return;
    }

    // Compute file hash
    const sha256Checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const evidenceFile = await prisma.evidenceFile.create({
      data: {
        institutionId,
        recordId: record.id,
        originalFilename: req.file.originalname,
        storedFilename: req.file.filename,
        storagePath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        fileDisplaySize: formatFileSize(req.file.size),
        uploadedByUserId: req.user!.userId,
        sha256Checksum
      }
    });

    await prisma.auditLog.create({
      data: {
        institutionId,
        actorUserId: req.user!.userId,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'EVIDENCE_FILE_UPLOADED',
        resourceType: 'EvidenceFile',
        resourceId: evidenceFile.id,
        afterState: {
          originalFilename: req.file.originalname,
          size: req.file.size,
          sha256: sha256Checksum
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: evidenceFile.id,
        recordId: evidenceFile.recordId,
        originalFilename: evidenceFile.originalFilename,
        fileDisplaySize: evidenceFile.fileDisplaySize,
        mimeType: evidenceFile.mimeType,
        uploadedAt: evidenceFile.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadEvidenceFile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const fileId = req.params.id as string;
    const institutionId = req.user!.institutionId;

    const evidence = await prisma.evidenceFile.findFirst({
      where: { id: fileId },
      include: {
        record: {
          include: {
            studentProfile: true
          }
        }
      }
    });

    if (!evidence) {
      res.status(404).json({ success: false, error: 'Evidence file not found.' });
      return;
    }

    // Strict Tenant Isolation: verify file belongs to authenticated institution
    if (!req.user!.isPlatformAdmin && evidence.institutionId !== institutionId) {
      res.status(403).json({
        success: false,
        error: 'Access denied: You cannot access files belonging to another institution.'
      });
      return;
    }

    // Role check: If student, verify they own the record
    if (req.user!.role === 'STUDENT') {
      const isOwner =
        (evidence.record.studentProfile.userId && evidence.record.studentProfile.userId === req.user!.userId) ||
        (evidence.record.studentProfile.email && evidence.record.studentProfile.email.toLowerCase() === req.user!.email.toLowerCase());
      if (!isOwner) {
        res.status(403).json({
          success: false,
          error: 'Access denied: You can only access your own evidence documents.'
        });
        return;
      }
    }

    const filePath = path.resolve(evidence.storagePath);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: 'Underlying file was not found on storage disk.' });
      return;
    }

    // Security Headers on File Download
    res.setHeader('Content-Type', evidence.mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(evidence.originalFilename)}"`
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}
