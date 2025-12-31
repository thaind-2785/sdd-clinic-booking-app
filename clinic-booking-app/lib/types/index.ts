import { Database } from '../supabase/database.types';

// Type aliases for easier imports
export type User = Database['public']['Tables']['users']['Row'];
export type Patient = Database['public']['Tables']['patients']['Row'];
export type Clinic = Database['public']['Tables']['clinics']['Row'];
export type MedicalSpecialty =
  Database['public']['Tables']['specialties']['Row'];
export type ClinicSpecialty =
  Database['public']['Tables']['clinic_specialties']['Row'];
export type ClinicStaff = Database['public']['Tables']['clinic_staff']['Row'];
export type TimeSlot = Database['public']['Tables']['time_slots']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type AppointmentAudit =
  Database['public']['Tables']['appointment_audit']['Row'];

// Composite types for common joins
export type ClinicWithSpecialties = Clinic & {
  specialties: MedicalSpecialty[];
};

export type AppointmentWithDetails = Appointment & {
  patient: Patient & { user: User };
  clinic: Clinic;
  time_slot: TimeSlot;
};

export type TimeSlotWithClinic = TimeSlot & {
  clinic: Clinic;
};

// Frontend-specific types
export interface AppointmentFormData {
  clinic_id: string;
  time_slot_id: string;
  reason_for_visit: string;
}

export interface ClinicFilterParams {
  specialty?: string;
  city?: string;
  search?: string;
}

export interface TimeSlotFilterParams {
  clinic_id: string;
  date?: string;
  start_time?: string;
  end_time?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// User role type guard
export function isPatient(user: User): boolean {
  return user.role === 'patient';
}

export function isClinicStaff(user: User): boolean {
  return user.role === 'clinic_staff';
}

// Appointment status helpers
export type AppointmentStatus = Appointment['status'];

export function canApproveAppointment(
  appointment: Appointment,
  userId: string,
  userClinics: string[]
): boolean {
  return (
    appointment.status === 'Pending' &&
    userClinics.includes(appointment.clinic_id)
  );
}

export function canCancelAppointment(
  appointment: Appointment,
  userId: string
): boolean {
  return appointment.patient_id === userId && appointment.status !== 'Rejected';
}
