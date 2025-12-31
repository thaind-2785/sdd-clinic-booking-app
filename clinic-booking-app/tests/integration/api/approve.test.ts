import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@/lib/supabase/server';

describe('POST /api/v1/appointments/[id]/approve', () => {
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

  it('should approve appointment and update status', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/appointments/${appointmentId}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-clinic-staff-token',
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data.status).toBe('Confirmed');
    expect(data.data.approved_at).toBeTruthy();
    expect(data.data.approved_by).toBeTruthy();
  });

  it('should return 404 for non-existent appointment', async () => {
    const response = await fetch(
      'http://localhost:3000/api/v1/appointments/00000000-0000-0000-0000-000000000000/approve',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-clinic-staff-token',
        },
      }
    );

    expect(response.status).toBe(404);
  });

  it('should return 401 for unauthorized user', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/appointments/${appointmentId}/approve`,
      {
        method: 'POST',
      }
    );

    expect(response.status).toBe(401);
  });

  it('should return 403 for non-clinic-staff users', async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/appointments/${appointmentId}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-patient-token',
        },
      }
    );

    expect(response.status).toBe(403);
  });

  it('should return 409 if time slot is already booked', async () => {
    // First approval succeeds
    await fetch(
      `http://localhost:3000/api/v1/appointments/${appointmentId}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-clinic-staff-token',
        },
      }
    );

    // Second approval with same time slot should fail
    const response = await fetch(
      `http://localhost:3000/api/v1/appointments/${appointmentId}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-clinic-staff-token',
        },
      }
    );

    expect(response.status).toBe(409);
  });
});
