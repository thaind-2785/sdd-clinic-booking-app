import { ClinicWithSpecialties } from '@/lib/types';

export interface FilterOptions {
  specialty?: string;
  city?: string;
  search?: string;
}

/**
 * Filter clinics based on specialty, city, and search term
 * This is a client-side utility for additional filtering
 */
export function filterClinics(
  clinics: ClinicWithSpecialties[],
  options: FilterOptions
): ClinicWithSpecialties[] {
  let filtered = [...clinics];

  // Filter by specialty
  if (options.specialty) {
    filtered = filtered.filter((clinic) =>
      clinic.specialties?.some((s) => s.id === options.specialty)
    );
  }

  // Filter by city
  if (options.city) {
    filtered = filtered.filter(
      (clinic) => clinic.city.toLowerCase() === options.city?.toLowerCase()
    );
  }

  // Filter by search term (name, address, description)
  if (options.search && options.search.trim()) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter(
      (clinic) =>
        clinic.name.toLowerCase().includes(searchLower) ||
        clinic.address?.toLowerCase().includes(searchLower) ||
        clinic.description?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * Sort clinics by name alphabetically
 */
export function sortClinicsByName(
  clinics: ClinicWithSpecialties[],
  order: 'asc' | 'desc' = 'asc'
): ClinicWithSpecialties[] {
  return [...clinics].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, 'vi-VN');
    return order === 'asc' ? comparison : -comparison;
  });
}
