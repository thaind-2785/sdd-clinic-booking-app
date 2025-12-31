import { describe, it, expect } from 'vitest';
import { filterClinics } from '@/lib/utils/filter-clinics';
import type { ClinicWithSpecialties } from '@/lib/types';

describe('filterClinics', () => {
  const mockClinics: ClinicWithSpecialties[] = [
    {
      id: '1',
      name: 'Heart Clinic',
      address: '123 Street',
      city: 'Hanoi',
      phone: '123456789',
      email: 'heart@clinic.com',
      description: null,
      working_hours: {},
      is_active: true,
      created_at: '2024-01-01',
      specialties: [
        {
          id: '1',
          name: 'Cardiology',
          description: null,
          created_at: '2024-01-01',
        },
      ],
    },
    {
      id: '2',
      name: 'Kids Clinic',
      address: '456 Street',
      city: 'HCMC',
      phone: '987654321',
      email: 'kids@clinic.com',
      description: null,
      working_hours: {},
      is_active: true,
      created_at: '2024-01-01',
      specialties: [
        {
          id: '2',
          name: 'Pediatrics',
          description: null,
          created_at: '2024-01-01',
        },
      ],
    },
    {
      id: '3',
      name: 'Family Clinic',
      address: '789 Street',
      city: 'Hanoi',
      phone: '555555555',
      email: 'family@clinic.com',
      description: null,
      working_hours: {},
      is_active: true,
      created_at: '2024-01-01',
      specialties: [
        {
          id: '3',
          name: 'General Practice',
          description: null,
          created_at: '2024-01-01',
        },
        {
          id: '2',
          name: 'Pediatrics',
          description: null,
          created_at: '2024-01-01',
        },
      ],
    },
  ];

  it('should filter by specialty', () => {
    const result = filterClinics(mockClinics, {
      specialty: 'cardiology',
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Heart Clinic');
  });

  it('should filter by city', () => {
    const result = filterClinics(mockClinics, { city: 'Hanoi' });

    expect(result).toHaveLength(2);
    expect(result.every((c) => c.city === 'Hanoi')).toBe(true);
  });

  it('should filter by search term', () => {
    const result = filterClinics(mockClinics, { search: 'family' });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Family Clinic');
  });

  it('should combine multiple filters', () => {
    const result = filterClinics(mockClinics, {
      city: 'Hanoi',
      specialty: 'pediatrics',
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Family Clinic');
  });

  it('should return all clinics when no filters', () => {
    const result = filterClinics(mockClinics, {});

    expect(result).toHaveLength(3);
  });
});
