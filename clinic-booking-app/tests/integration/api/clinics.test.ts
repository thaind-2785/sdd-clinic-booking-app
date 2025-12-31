import { describe, it, expect, beforeAll } from 'vitest';
import type { ClinicWithSpecialties } from '@/lib/types';

describe('GET /api/v1/clinics', () => {
  beforeAll(async () => {
    // Setup test data if needed
  });

  it('should return list of active clinics', async () => {
    const response = await fetch('http://localhost:3000/api/v1/clinics');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should filter clinics by specialty', async () => {
    const response = await fetch(
      'http://localhost:3000/api/v1/clinics?specialty=cardiology'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    const clinics = data.data as ClinicWithSpecialties[];
    expect(
      clinics.every((clinic) =>
        clinic.specialties?.some((s) => s.name === 'cardiology')
      )
    ).toBe(true);
  });

  it('should filter clinics by city', async () => {
    const city = 'Hanoi';
    const response = await fetch(
      `http://localhost:3000/api/v1/clinics?city=${city}`
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    const clinics = data.data as ClinicWithSpecialties[];
    expect(clinics.every((clinic) => clinic.city === city)).toBe(true);
  });

  it('should search clinics by name', async () => {
    const search = 'clinic';
    const response = await fetch(
      `http://localhost:3000/api/v1/clinics?search=${search}`
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    const clinics = data.data as ClinicWithSpecialties[];
    expect(
      clinics.every((clinic) =>
        clinic.name.toLowerCase().includes(search.toLowerCase())
      )
    ).toBe(true);
  });

  it('should return 400 for invalid query params', async () => {
    const response = await fetch(
      'http://localhost:3000/api/v1/clinics?limit=invalid'
    );

    expect(response.status).toBe(400);
  });
});
