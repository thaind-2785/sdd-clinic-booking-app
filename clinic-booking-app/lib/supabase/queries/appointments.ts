import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../client';
import {
  Appointment,
  AppointmentWithDetails,
  Clinic,
  TimeSlot,
  Patient,
  User,
} from '@/lib/types';

interface AppointmentRawData {
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
  clinic: Clinic;
  time_slot: TimeSlot;
  patient: Patient & { user: User };
}

interface CreateAppointmentParams {
  patient_id: string;
  clinic_id: string;
  time_slot_id: string;
  reason_for_visit: string;
}

interface AppointmentInsert {
  patient_id: string;
  clinic_id: string;
  time_slot_id: string;
  reason_for_visit: string;
  status: 'Pending' | 'Confirmed' | 'Rejected';
}

export async function createAppointment(
  params: CreateAppointmentParams,
  supabase: SupabaseClient
): Promise<Appointment> {
  const appointmentData: AppointmentInsert = {
    patient_id: params.patient_id,
    clinic_id: params.clinic_id,
    time_slot_id: params.time_slot_id,
    reason_for_visit: params.reason_for_visit,
    status: 'Pending',
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData as unknown as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }

  return data;
}

export async function getAppointmentsByPatient(
  patientId: string,
  status?: 'Pending' | 'Confirmed' | 'Rejected',
  supabaseClient?: SupabaseClient
): Promise<AppointmentWithDetails[]> {
  const supabase = supabaseClient || createClient();

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
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  console.log('getAppointmentsByPatient data', data);
  if (error) {
    throw error;
  }

  if (!data) return [];

  return (data as AppointmentRawData[]).map((apt) => ({
    ...apt,
    patient: {
      ...apt.patient,
      user: apt.patient.user,
    },
  }));
}

export async function getAppointmentById(
  appointmentId: string,
  supabaseClient?: SupabaseClient
): Promise<AppointmentWithDetails | null> {
  const supabase = supabaseClient || createClient();

  const { data, error } = await supabase
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
    .eq('id', appointmentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching appointment:', error);
    throw error;
  }

  if (!data) return null;

  const rawData = data as AppointmentRawData;

  return {
    ...rawData,
    patient: {
      ...rawData.patient,
      user: rawData.patient.user,
    },
  };
}
