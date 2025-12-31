import { createClient } from '../client';
import { MedicalSpecialty } from '@/lib/types';

export async function getSpecialties(): Promise<MedicalSpecialty[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('specialties')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching specialties:', error);
    throw error;
  }

  return data || [];
}
