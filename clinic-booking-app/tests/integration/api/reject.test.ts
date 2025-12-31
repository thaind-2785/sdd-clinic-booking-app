import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@/lib/supabase/server';

describe('POST /api/v1/appointments/[id]/reject', () => {
  let appointmentId: string;

  beforeAll(async () => {
    // Create a test appointment in Pending status
    const supabase = await createClient();
    const { data } = (await supabase
      .from('appointments')
      .insert({
        patient_id: 'test-patient-id',
        clinic_id: 'test-clinic-id',
        time_slot_id: 'test-slot-id',
        reason_for_visit: 'Test appointment',
        status: 'Pending',
      } as never)
      .select()
      .single()) as { data: { id: string } | null };

    appointmentId = data?.id || '';
  });

  it('should reject appointment and update status', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/appointments/${appointmentId}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-clinic-staff-token',
        },
        body: JSON.stringify({
          rejection_reason: 'Time slot no longer available',
        }),
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data.status).toBe('Rejected');
  });

  it('should release time slot when rejecting', async () => {
    const supabase = await createClient();

    const response = await fetch(
      `http://localhost:3000/api/v1/appointments/${appointmentId}/reject`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-clinic-staff-token',
        },
        body: JSON.stringify({
          rejection_reason: 'Clinic closed',
        }),
      }
    );

    expect(response.status).toBe(200);

    // Verify time slot is available again
    const { data: appointment } = (await supabase
      .from('appointments')
      .select('time_slot_id')
      .eq('id', appointmentId)
      .single()) as { data: { time_slot_id: string } | null };

    if (appointment) {
      const { data: timeSlot } = (await supabase
        .from('time_slots')
        .select('is_available')
        .eq('id', appointment.time_slot_id)
        .single()) as { data: { is_available: boolean } | null };

      expect(timeSlot?.is_available).toBe(true);
    }
  });

  it('should return 404 for non-existent appointment', async () => {
    const response = await fetch(
      'http://localhost:3000/api/v1/appointments/00000000-0000-0000-0000-000000000000/reject',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-clinic-staff-token',
        },
        body: JSON.stringify({
          rejection_reason: 'Test',
        }),
      }
    );

    expect(response.status).toBe(404);
  });

  it('should return 401 for unauthorized user', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/appointments/${appointmentId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({
          rejection_reason: 'Test',
        }),
      }
    );

    expect(response.status).toBe(401);
  });

  it('should require rejection reason', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/appointments/${appointmentId}/reject`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-clinic-staff-token',
        },
        body: JSON.stringify({}),
      }
    );

    expect(response.status).toBe(400);
  });
});
