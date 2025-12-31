import { createClient } from '@/lib/supabase/server';
import type { AppointmentWithDetails } from '@/lib/types';
import type { Json } from '@/lib/supabase/database.types';

/**
 * Get appointments for a specific clinic
 */
export async function getClinicAppointments(
  clinicId: string,
  status?: 'Pending' | 'Confirmed' | 'Rejected'
): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from('appointments')
    .select(
      `
      *,
      clinic:clinics!clinic_id (*),
      time_slot:time_slots!time_slot_id (*),
      patient:patients!patient_id (
        *,
        user:users!user_id (*)
      )
    `
    )
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching clinic appointments:', error);
    throw error;
  }

  if (!data) return [];

  interface RawAppointment {
    id: string;
    patient_id: string;
    clinic_id: string;
    time_slot_id: string;
    reason_for_visit: string;
    status: 'Pending' | 'Confirmed' | 'Rejected';
    created_at: string;
    updated_at: string;
    approved_by: string | null;
    approved_at: string | null;
    clinic: {
      id: string;
      name: string;
      address: string;
      city: string;
      phone: string;
      email: string;
      description: string | null;
      working_hours: Json;
      is_active: boolean;
      created_at: string;
    };
    time_slot: {
      id: string;
      clinic_id: string;
      date: string;
      start_time: string;
      end_time: string;
      is_available: boolean;
      created_at: string;
    };
    patient: {
      id: string;
      user_id: string;
      phone: string;
      date_of_birth: string | null;
      medical_notes: string | null;
      notification_preferences: Json;
      created_at: string;
      user: {
        id: string;
        google_id: string;
        email: string;
        name: string;
        avatar_url: string | null;
        role: 'patient' | 'clinic_staff';
        patient_id: string | null;
        clinic_staff_id: string | null;
        created_at: string;
        updated_at: string;
      };
    };
  }

  return (data as RawAppointment[]).map((apt) => ({
    ...apt,
    patient: {
      ...apt.patient,
      user: apt.patient.user,
    },
  })) as AppointmentWithDetails[];
}

/**
 * Get pending appointments count for a clinic
 */
export async function getPendingAppointmentsCount(
  clinicId: string
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('status', 'Pending');

  if (error) {
    console.error('Error counting pending appointments:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Get appointments for today
 */
export async function getTodayAppointments(
  clinicId: string
): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
      *,
      clinic:clinics (*),
      time_slot:time_slots!inner (*),
      patient:patients (
        *,
        user:users (*)
      )
    `
    )
    .eq('clinic_id', clinicId)
    .eq('time_slot.date', today)
    .in('status', ['Pending', 'Confirmed'])
    .order('time_slot.start_time', { ascending: true });

  if (error) {
    console.error('Error fetching today appointments:', error);
    throw error;
  }

  if (!data) return [];

  interface RawAppointment {
    id: string;
    patient_id: string;
    clinic_id: string;
    time_slot_id: string;
    reason_for_visit: string;
    status: 'Pending' | 'Confirmed' | 'Rejected';
    created_at: string;
    updated_at: string;
    approved_by: string | null;
    approved_at: string | null;
    clinic: {
      id: string;
      name: string;
      address: string;
      city: string;
      phone: string;
      email: string;
      description: string | null;
      working_hours: Json;
      is_active: boolean;
      created_at: string;
    };
    time_slot: {
      id: string;
      clinic_id: string;
      date: string;
      start_time: string;
      end_time: string;
      is_available: boolean;
      created_at: string;
    };
    patient: {
      id: string;
      user_id: string;
      phone: string;
      date_of_birth: string | null;
      medical_notes: string | null;
      notification_preferences: Json;
      created_at: string;
      user: {
        id: string;
        google_id: string;
        email: string;
        name: string;
        avatar_url: string | null;
        role: 'patient' | 'clinic_staff';
        patient_id: string | null;
        clinic_staff_id: string | null;
        created_at: string;
        updated_at: string;
      };
    };
  }

  return (data as RawAppointment[]).map((apt) => ({
    ...apt,
    patient: {
      ...apt.patient,
      user: apt.patient.user,
    },
  })) as AppointmentWithDetails[];
}
