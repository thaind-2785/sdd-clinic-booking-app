import { z } from 'zod';

export const createAppointmentSchema = z.object({
  clinic_id: z.string().uuid('Invalid clinic ID'),
  time_slot_id: z.string().uuid('Invalid time slot ID'),
  reason_for_visit: z
    .string()
    .min(10, 'Please provide at least 10 characters describing your visit')
    .max(500, 'Reason must be less than 500 characters'),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['Confirmed', 'Rejected'], {
    message: 'Status must be either Confirmed or Rejected',
  }),
  approved_by: z.string().uuid('Invalid approver ID').optional(),
});

export const appointmentFilterSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Rejected']).optional(),
  clinic_id: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;
export type AppointmentFilterInput = z.infer<typeof appointmentFilterSchema>;
