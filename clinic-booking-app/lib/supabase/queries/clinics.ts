import { createClient } from '../client';
import { ClinicWithSpecialties, MedicalSpecialty } from '@/lib/types';

// Type for clinic data with specialties join
// interface ClinicData {
//   id: string;
//   name: string;
//   address: string;
//   city: string;
//   phone: string;
//   email: string;
//   description: string | null;
//   working_hours: Json;
//   is_active: boolean | null;
//   created_at: string | null;
//   clinic_specialties?: Array<{
//     specialty_id: string;
//     specialties: MedicalSpecialty;
//   }>;
// }

interface GetClinicsParams {
  specialty?: string;
  city?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getClinics({
  specialty,
  city,
  search,
  limit = 20,
  offset = 0,
}: GetClinicsParams = {}): Promise<{
  data: ClinicWithSpecialties[];
  total: number;
}> {
  const supabase = createClient();

  let query = supabase
    .from('clinics')
    .select(
      `
      *,
      clinic_specialties!inner (
        specialty_id,
        specialties (
          id,
          name,
          description
        )
      )
    `,
      { count: 'exact' }
    )
    .eq('is_active', true);

  // Filter by city
  if (city) {
    query = query.eq('city', city);
  }

  // Filter by specialty - use inner join to filter
  if (specialty) {
    query = query.eq('clinic_specialties.specialty_id', specialty);
  }

  // Search by name or description
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Pagination
  query = query.range(offset, offset + limit - 1).order('name');

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching clinics:', error);
    throw error;
  }

  // Transform the data to match ClinicWithSpecialties type
  const transformedData: ClinicWithSpecialties[] = (data || []).map(
    (clinic) => ({
      ...clinic,
      specialties:
        clinic.clinic_specialties?.map(
          (cs) => cs.specialties as MedicalSpecialty
        ) || [],
    })
  );

  return {
    data: transformedData,
    total: count || 0,
  };
}

export async function getClinicById(
  clinicId: string
): Promise<ClinicWithSpecialties | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('clinics')
    .select(
      `
      *,
      clinic_specialties (
        specialties (
          id,
          name,
          description
        )
      )
    `
    )
    .eq('id', clinicId)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching clinic:', error);
    throw error;
  }

  if (!data) return null;

  // Transform the data
  return {
    ...data,
    specialties:
      data.clinic_specialties?.map(
        (cs) => cs.specialties as MedicalSpecialty
      ) || [],
  };
}
