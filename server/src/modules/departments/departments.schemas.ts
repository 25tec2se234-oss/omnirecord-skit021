import { z } from 'zod';

export const createDepartmentSchema = z.object({
  code: z.string().min(2).max(10).transform((v) => v.trim().toUpperCase()),
  name: z.string().min(2).max(100),
  coordinatorName: z.string().optional(),
  coordinatorEmail: z.string().email().optional(),
  description: z.string().optional()
});

export const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  status: z.enum(['Active', 'Inactive']).optional()
});
