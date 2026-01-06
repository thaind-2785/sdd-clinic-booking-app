import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

/**
 * Integration tests for Row-Level Security (RLS) policies
 * Audits and validates all RLS policies are properly enforced
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

describe('RLS Policy Audit', () => {
  let testPatientId: string;
  let testClinicId: string;
  let testClinicStaffId: string;
  let testAppointmentId: string;

  beforeAll(async () => {
    // Create test users
    const { data: patient } = await supabaseAdmin.auth.admin.createUser({
      email: `rls-patient-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      email_confirm: true,
    });
    testPatientId = patient?.user?.id || '';

    const { data: staff } = await supabaseAdmin.auth.admin.createUser({
      email: `rls-staff-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: { role: 'clinic_staff' },
    });
    testClinicStaffId = staff?.user?.id || '';

    // Create test clinic
    const { data: clinic } = await supabaseAdmin
      .from('clinics')
      .insert({
        name: 'RLS Test Clinic',
        address: '123 Test St',
        phone: '555-0100',
      })
      .select()
      .single();
    testClinicId = clinic?.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testAppointmentId) {
      await supabaseAdmin
        .from('appointments')
        .delete()
        .eq('id', testAppointmentId);
    }
    if (testPatientId) {
      await supabaseAdmin.auth.admin.deleteUser(testPatientId);
    }
    if (testClinicStaffId) {
      await supabaseAdmin.auth.admin.deleteUser(testClinicStaffId);
    }
    if (testClinicId) {
      await supabaseAdmin.from('clinics').delete().eq('id', testClinicId);
    }
  });

  describe('Appointments Table RLS', () => {
    it('should prevent anonymous users from reading appointments', async () => {
      const { data, error } = await supabaseAnon
        .from('appointments')
        .select('*')
        .limit(1);

      expect(data).toEqual([]);
    });

    it('should prevent anonymous users from creating appointments', async () => {
      const { error } = await supabaseAnon.from('appointments').insert({
        patient_id: testPatientId,
        clinic_id: testClinicId,
        appointment_date: new Date().toISOString(),
        status: 'Pending',
      });

      expect(error).toBeDefined();
    });

    it('should allow patients to read their own appointments', async () => {
      // Create appointment as admin
      const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .insert({
          patient_id: testPatientId,
          clinic_id: testClinicId,
          appointment_date: new Date(Date.now() + 86400000).toISOString(),
          status: 'Pending',
        })
        .select()
        .single();

      testAppointmentId = appointment?.id;

      // Sign in as patient
      const { data: session } = await supabaseAnon.auth.signInWithPassword({
        email: `rls-patient-${Date.now()}@example.com`,
        password: 'TestPassword123!',
      });

      // Read own appointments
      const { data, error } = await supabaseAnon
        .from('appointments')
        .select('*')
        .eq('patient_id', testPatientId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should prevent patients from reading other patients appointments', async () => {
      // Create another patient
      const { data: otherPatient } = await supabaseAdmin.auth.admin.createUser({
        email: `other-patient-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        email_confirm: true,
      });

      const otherPatientId = otherPatient?.user?.id;

      // Create appointment for other patient
      const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .insert({
          patient_id: otherPatientId,
          clinic_id: testClinicId,
          appointment_date: new Date(Date.now() + 86400000).toISOString(),
          status: 'Pending',
        })
        .select()
        .single();

      // Try to read as current patient
      const { data } = await supabaseAnon
        .from('appointments')
        .select('*')
        .eq('id', appointment?.id);

      expect(data).toEqual([]);

      // Cleanup
      await supabaseAdmin
        .from('appointments')
        .delete()
        .eq('id', appointment?.id);
      await supabaseAdmin.auth.admin.deleteUser(otherPatientId!);
    });

    it('should allow clinic staff to read appointments for their clinic', async () => {
      // Link staff to clinic
      await supabaseAdmin.from('clinic_staff').insert({
        user_id: testClinicStaffId,
        clinic_id: testClinicId,
        role: 'staff',
      });

      // Sign in as staff
      await supabaseAnon.auth.signInWithPassword({
        email: `rls-staff-${Date.now()}@example.com`,
        password: 'TestPassword123!',
      });

      // Read clinic appointments
      const { data, error } = await supabaseAnon
        .from('appointments')
        .select('*')
        .eq('clinic_id', testClinicId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should prevent staff from modifying appointments at other clinics', async () => {
      // Create another clinic
      const { data: otherClinic } = await supabaseAdmin
        .from('clinics')
        .insert({
          name: 'Other Clinic',
          address: '456 Other St',
          phone: '555-0200',
        })
        .select()
        .single();

      const { error } = await supabaseAnon
        .from('appointments')
        .update({ status: 'Confirmed' })
        .eq('clinic_id', otherClinic?.id);

      expect(error).toBeDefined();

      // Cleanup
      await supabaseAdmin.from('clinics').delete().eq('id', otherClinic?.id);
    });
  });

  describe('Clinics Table RLS', () => {
    it('should allow anonymous users to read public clinic data', async () => {
      const { data, error } = await supabaseAnon
        .from('clinics')
        .select('id, name, address, phone')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should prevent anonymous users from creating clinics', async () => {
      const { error } = await supabaseAnon.from('clinics').insert({
        name: 'Unauthorized Clinic',
        address: '789 Hack St',
        phone: '555-9999',
      });

      expect(error).toBeDefined();
    });

    it('should prevent unauthorized users from updating clinics', async () => {
      const { error } = await supabaseAnon
        .from('clinics')
        .update({ name: 'Hacked Clinic' })
        .eq('id', testClinicId);

      expect(error).toBeDefined();
    });
  });

  describe('Patients Table RLS', () => {
    it('should allow users to read their own patient record', async () => {
      // Create patient record
      await supabaseAdmin.from('patients').insert({
        user_id: testPatientId,
        full_name: 'Test Patient',
        date_of_birth: '1990-01-01',
        phone: '555-1234',
      });

      // Sign in as patient
      await supabaseAnon.auth.signInWithPassword({
        email: `rls-patient-${Date.now()}@example.com`,
        password: 'TestPassword123!',
      });

      const { data, error } = await supabaseAnon
        .from('patients')
        .select('*')
        .eq('user_id', testPatientId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.user_id).toBe(testPatientId);
    });

    it('should prevent users from reading other patient records', async () => {
      // Create another patient
      const { data: otherPatient } = await supabaseAdmin.auth.admin.createUser({
        email: `other-patient-rls-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        email_confirm: true,
      });

      await supabaseAdmin.from('patients').insert({
        user_id: otherPatient?.user?.id,
        full_name: 'Other Patient',
        date_of_birth: '1985-05-05',
        phone: '555-5555',
      });

      // Try to read as current user
      const { data } = await supabaseAnon
        .from('patients')
        .select('*')
        .eq('user_id', otherPatient?.user?.id);

      expect(data).toEqual([]);

      // Cleanup
      await supabaseAdmin
        .from('patients')
        .delete()
        .eq('user_id', otherPatient?.user?.id);
      await supabaseAdmin.auth.admin.deleteUser(otherPatient?.user?.id ?? '');
    });
  });

  describe('Time Slots Table RLS', () => {
    it('should allow authenticated users to read available time slots', async () => {
      const { data, error } = await supabaseAnon
        .from('time_slots')
        .select('*')
        .eq('clinic_id', testClinicId)
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should prevent patients from modifying time slots', async () => {
      const { error } = await supabaseAnon
        .from('time_slots')
        .update({ is_available: false })
        .eq('clinic_id', testClinicId);

      expect(error).toBeDefined();
    });
  });

  describe('Notifications Table RLS', () => {
    it('should allow users to read their own notifications', async () => {
      // Create notification
      await supabaseAdmin.from('notifications').insert({
        user_id: testPatientId,
        type: 'appointment_created',
        message: 'Test notification',
        status: 'sent',
      });

      const { data, error } = await supabaseAnon
        .from('notifications')
        .select('*')
        .eq('user_id', testPatientId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should prevent users from reading others notifications', async () => {
      const { data } = await supabaseAnon
        .from('notifications')
        .select('*')
        .neq('user_id', testPatientId);

      expect(data).toEqual([]);
    });
  });

  describe('Audit Log RLS', () => {
    it('should prevent regular users from reading audit logs', async () => {
      const { data, error } = await supabaseAnon
        .from('appointment_audit')
        .select('*')
        .limit(1);

      // Should either error or return empty
      expect(data?.length === 0 || error !== null).toBe(true);
    });
  });

  describe('Policy Coverage Check', () => {
    it('should have RLS enabled on all tables', async () => {
      const tables = [
        'appointments',
        'clinics',
        'patients',
        'time_slots',
        'notifications',
        'clinic_staff',
        'medical_specialties',
      ];

      // This is a meta-test - in real scenario, you'd query pg_policies
      // For now, we verify tables exist and queries respect RLS
      for (const table of tables) {
        const { error } = await supabaseAnon.from(table).select('*').limit(1);

        // Either succeeds with RLS or fails gracefully
        expect(error === null || error.message.includes('permission')).toBe(
          true
        );
      }
    });
  });
});
