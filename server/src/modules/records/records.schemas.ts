import { z } from 'zod';

export const createRecordSchema = z.object({
  studentId: z.string().min(1, 'Student selection is required'), // can be DB id or roll number
  activityId: z.string().min(1, 'Activity selection is required'), // can be DB id or code
  participationDate: z.string().or(z.date()).transform((v) => new Date(v)),
  achievementLevel: z.enum([
    'Winner',
    'Runner-up',
    'Finalist',
    'Recognition',
    'Participant',
    'Organizer'
  ]),
  certificateRef: z.string().optional(),
  description: z.string().min(5, 'Participation description must be at least 5 characters'),
  evidenceFilename: z.string().optional(),
  evidenceFileSize: z.string().optional()
});

export const updateRecordSchema = z.object({
  participationDate: z.string().or(z.date()).transform((v) => new Date(v)).optional(),
  achievementLevel: z.enum([
    'Winner',
    'Runner-up',
    'Finalist',
    'Recognition',
    'Participant',
    'Organizer'
  ]).optional(),
  certificateRef: z.string().optional(),
  description: z.string().min(5).optional()
});

export const recordQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  departmentId: z.string().optional(),
  category: z.string().optional(),
  studentId: z.string().optional(),
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 50))
});
