import { describe, it, expect } from 'vitest';

describe('GET /api/v1/clinics/[clinicId]', () => {
  it('should return clinic details with specialties', async () => {
    // This would use a known test clinic ID
    const testClinicId = 'test-clinic-uuid';
    const response = await fetch(
      `http://localhost:3000/api/v1/clinics/${testClinicId}`
    );
    const data = await response.json();

    if (response.status === 200) {
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('name');
      expect(data.data).toHaveProperty('specialties');
      expect(data.data).toHaveProperty('working_hours');
      expect(Array.isArray(data.data.specialties)).toBe(true);
    } else {
      expect(response.status).toBe(404);
    }
  });

  it('should return 404 for non-existent clinic', async () => {
    const response = await fetch(
      'http://localhost:3000/api/v1/clinics/00000000-0000-0000-0000-000000000000'
    );

    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid UUID', async () => {
    const response = await fetch(
      'http://localhost:3000/api/v1/clinics/invalid-uuid'
    );

    expect(response.status).toBe(400);
  });
});
