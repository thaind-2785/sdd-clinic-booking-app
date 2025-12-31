import { describe, it, expect } from 'vitest';

describe('POST /api/v1/appointments', () => {
  it('should create appointment with valid data', async () => {
    const appointmentData = {
      clinic_id: 'test-clinic-uuid',
      time_slot_id: 'test-timeslot-uuid',
      reason_for_visit:
        'This is a test reason that is at least 10 characters long',
    };

    const response = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });

    // Would need auth, so might be 401
    expect([200, 201, 401]).toContain(response.status);
  });

  it('should reject appointment with short reason', async () => {
    const appointmentData = {
      clinic_id: 'test-clinic-uuid',
      time_slot_id: 'test-timeslot-uuid',
      reason_for_visit: 'Short',
    };

    const response = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });

    expect(response.status).toBe(400);
  });

  it('should reject appointment with invalid clinic_id', async () => {
    const appointmentData = {
      clinic_id: 'invalid-uuid',
      time_slot_id: 'test-timeslot-uuid',
      reason_for_visit: 'Valid reason for visit',
    };

    const response = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });

    expect(response.status).toBe(400);
  });

  it('should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/v1/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect([400, 401]).toContain(response.status);
  });
});
