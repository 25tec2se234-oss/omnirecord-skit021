import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  institutionCode: z.string().optional()
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  institutionCode: z.string().min(2, 'Valid institution code is required'),
  role: z.enum(['STUDENT', 'FACULTY_COORDINATOR']).default('STUDENT'),
  departmentCode: z.string().optional(),
  studentId: z.string().optional(),
  invitationToken: z.string().optional()
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address format')
});

export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});
