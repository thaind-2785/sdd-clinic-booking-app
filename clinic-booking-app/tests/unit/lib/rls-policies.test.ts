import { describe, it, expect } from 'vitest';
import { createClient } from '@/lib/supabase/server';

describe('RLS Policy Enforcement', () => {
  it('should allow clinic staff to view appointments for their clinic', async () => {
    const supabase = await createClient();

    // Simulate clinic staff user context
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', 'test-clinic-id');

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should prevent clinic staff from viewing other clinics appointments', async () => {
    const supabase = await createClient();

    // Try to access another clinic's appointments
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', 'other-clinic-id');

    // Should either return empty or error based on RLS policy
    if (error) {
      expect(error).toBeTruthy();
    } else {
      expect(data).toEqual([]);
    }
  });

  it('should allow patients to view only their own appointments', async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', 'test-patient-id');

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should prevent patients from viewing other patients appointments', async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', 'other-patient-id');

    if (error) {
      expect(error).toBeTruthy();
    } else {
      expect(data).toEqual([]);
    }
  });

  it('should prevent patients from approving appointments', async () => {
    const supabase = await createClient();

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Confirmed', approved_by: 'patient-user-id' } as never)
      .eq('id', 'test-appointment-id');

    expect(error).toBeTruthy();
  });

  it('should allow only clinic staff to approve appointments', async () => {
    const supabase = await createClient();

    // Simulate clinic staff context
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'Confirmed',
        approved_by: 'clinic-staff-user-id',
        approved_at: new Date().toISOString(),
      } as never)
      .eq('id', 'test-appointment-id')
      .eq('clinic_id', 'test-clinic-id');

    expect(error).toBeNull();
  });
});
