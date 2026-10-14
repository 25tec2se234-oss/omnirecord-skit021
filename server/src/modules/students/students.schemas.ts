import { z } from 'zod';

export const createStudentSchema = z.object({
  studentId: z.string().min(2, 'Roll / Student ID is required').max(30),
  name: z.string().min(2, 'Student full name is required').max(100),
  email: z.string().email('Invalid email address'),
  departmentId: z.string().min(1, 'Department ID is required'),
  program: z.string().min(2, 'Academic program is required'),
  year: z.string().min(1, 'Academic year is required'),
  status: z.enum(['Active', 'Graduated', 'Inactive', 'Archived']).default('Active'),
  phone: z.string().optional(),
  cgpa: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal(''))
});

export const updateStudentSchema = createStudentSchema.partial();

export const studentQuerySchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().optional(),
  year: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 50)),
  sortBy: z.enum(['name', 'cgpa', 'studentId', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});
