import { describe, it, expect } from 'vitest';
import { validateTimeSlot } from '@/lib/utils/validate-timeslot';
import { createAppointmentSchema } from '@/lib/validations/appointment';

describe('Appointment validation', () => {
  describe('validateTimeSlot', () => {
    it('should validate future time slots', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = validateTimeSlot(
        futureDate.toISOString().split('T')[0],
        '09:00',
        '10:00'
      );

      expect(result.valid).toBe(true);
    });

    it('should reject past time slots', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      const result = validateTimeSlot(
        pastDate.toISOString().split('T')[0],
        '09:00',
        '10:00'
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('quá khứ');
    });

    it('should reject invalid time ranges', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = validateTimeSlot(
        futureDate.toISOString().split('T')[0],
        '10:00',
        '09:00'
      );

      expect(result.valid).toBe(false);
    });
  });

  describe('createAppointmentSchema', () => {
    it('should validate correct appointment data', () => {
      const validData = {
        clinic_id: '123e4567-e89b-12d3-a456-426614174000',
        time_slot_id: '123e4567-e89b-12d3-a456-426614174001',
        reason_for_visit:
          'I have been experiencing chest pain for the past week',
      };

      const result = createAppointmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short reason', () => {
      const invalidData = {
        clinic_id: '123e4567-e89b-12d3-a456-426614174000',
        time_slot_id: '123e4567-e89b-12d3-a456-426614174001',
        reason_for_visit: 'Pain',
      };

      const result = createAppointmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUIDs', () => {
      const invalidData = {
        clinic_id: 'not-a-uuid',
        time_slot_id: '123e4567-e89b-12d3-a456-426614174001',
        reason_for_visit: 'Valid reason for the visit',
      };

      const result = createAppointmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
