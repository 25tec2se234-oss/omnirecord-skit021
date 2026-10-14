import { z } from 'zod';

export const updatePortfolioSettingsSchema = z.object({
  template: z.enum(['CLEAN_MINIMAL', 'TECH_DEV_CARD', 'ACADEMIC_PROFESSIONAL'], {
    errorMap: () => ({ message: 'Template must be CLEAN_MINIMAL, TECH_DEV_CARD, or ACADEMIC_PROFESSIONAL' })
  }),
  visibility: z.enum(['PRIVATE', 'PUBLIC'], {
    errorMap: () => ({ message: 'Visibility must be PRIVATE or PUBLIC' })
  }),
  headline: z.string().max(200, 'Headline must not exceed 200 characters').nullable().optional(),
  bio: z.string().max(1000, 'Bio must not exceed 1000 characters').nullable().optional(),
  customSlug: z
    .string()
    .min(3, 'Custom slug must be at least 3 characters')
    .max(50, 'Custom slug must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Custom slug may only contain letters, numbers, underscores, and hyphens')
    .nullable()
    .optional()
});

export const updatePortfolioCredentialsSchema = z.object({
  credentialIds: z.array(z.string().min(1, 'Record ID cannot be empty'))
});

export type UpdatePortfolioSettingsInput = z.infer<typeof updatePortfolioSettingsSchema>;
export type UpdatePortfolioCredentialsInput = z.infer<typeof updatePortfolioCredentialsSchema>;
