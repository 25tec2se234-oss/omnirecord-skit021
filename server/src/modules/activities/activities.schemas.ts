import { z } from 'zod';

export const createActivitySchema = z
  .object({
    name: z.string().min(2, 'Activity name is required').max(150),
    category: z.string().min(2, 'Category is required'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    departmentId: z.string().min(1, 'Department is required'),
    startDate: z.string().or(z.date()).transform((v) => new Date(v)),
    endDate: z.string().or(z.date()).transform((v) => new Date(v)),
    venue: z.string().min(2, 'Venue is required'),
    mode: z.enum(['In-Person', 'Hybrid', 'Virtual']).default('In-Person'),
    coordinator: z.string().min(2, 'Coordinator name is required'),
    status: z.enum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled']).default('Upcoming'),
    maxParticipants: z.number().int().positive().default(100)
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date cannot be earlier than start date',
    path: ['endDate']
  });

export const updateActivitySchema = z
  .object({
    name: z.string().min(2).max(150).optional(),
    category: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    departmentId: z.string().min(1).optional(),
    startDate: z.string().or(z.date()).transform((v) => new Date(v)).optional(),
    endDate: z.string().or(z.date()).transform((v) => new Date(v)).optional(),
    venue: z.string().min(2).optional(),
    mode: z.enum(['In-Person', 'Hybrid', 'Virtual']).optional(),
    coordinator: z.string().min(2).optional(),
    status: z.enum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled']).optional(),
    maxParticipants: z.number().int().positive().optional(),
    isArchived: z.boolean().optional()
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'End date cannot be earlier than start date',
      path: ['endDate']
    }
  );

export const activityQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 50))
});
