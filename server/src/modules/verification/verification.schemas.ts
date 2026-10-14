import { z } from 'zod';

export const reviewDecisionSchema = z
  .object({
    recordId: z.string().min(1, 'Record ID is required'),
    status: z.enum(['VERIFIED', 'NEEDS_CORRECTION', 'REJECTED']),
    notes: z.string().optional()
  })
  .refine(
    (data) => {
      if (['NEEDS_CORRECTION', 'REJECTED'].includes(data.status)) {
        return Boolean(data.notes && data.notes.trim().length >= 5);
      }
      return true;
    },
    {
      message: 'A clear reason / correction note of at least 5 characters is required when requesting corrections or rejecting a record.',
      path: ['notes']
    }
  );

export const reopenRecordSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
  reason: z.string().min(5, 'A clear reason of at least 5 characters is required to reopen a verified or rejected record.')
});
