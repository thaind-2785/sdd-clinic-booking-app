import { z } from 'zod';

export const createPatientProfileSchema = z.object({
  phone: z
    .string()
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      {
        message: 'Please enter a valid phone number',
      }
    ),
  date_of_birth: z.string().date().optional(),
  medical_notes: z.string().max(1000).optional(),
  notification_preferences: z
    .object({
      email: z.boolean().default(true),
      sms: z.boolean().default(false),
    })
    .optional(),
});

export const updateUserProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
});

export type CreatePatientProfileInput = z.infer<
  typeof createPatientProfileSchema
>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
