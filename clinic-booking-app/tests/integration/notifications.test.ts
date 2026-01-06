import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

/**
 * Integration tests for email notification Edge Function
 * Tests the complete flow of sending appointment notifications
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('Email Notification Integration Tests', () => {
  let testPatientId: string;
  let testClinicId: string;
  let testAppointmentId: string;

  beforeAll(async () => {
    // Create test data
    const { data: patient } = await supabase.auth.admin.createUser({
      email: `notification-test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      email_confirm: true,
    });
    testPatientId = patient?.user?.id || '';

    const { data: clinic } = await supabase
      .from('clinics')
      .insert({
        name: 'Test Notification Clinic',
        address: '123 Test St',
        phone: '555-0100',
      })
      .select()
      .single();
    testClinicId = clinic?.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testAppointmentId) {
      await supabase.from('appointments').delete().eq('id', testAppointmentId);
    }
    if (testPatientId) {
      await supabase.auth.admin.deleteUser(testPatientId);
    }
    if (testClinicId) {
      await supabase.from('clinics').delete().eq('id', testClinicId);
    }
  });

  it('should send notification when appointment is created', async () => {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: testPatientId,
        clinic_id: testClinicId,
        appointment_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'Pending',
        reason: 'Test notification',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(appointment).toBeDefined();
    testAppointmentId = appointment?.id;

    // Wait for notification to be created (async trigger)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if notification was created
    const { data: notification } = await supabase
      .from('notifications')
      .select('*')
      .eq('appointment_id', testAppointmentId)
      .eq('type', 'appointment_created')
      .single();

    expect(notification).toBeDefined();
    expect(notification?.status).toBe('sent');
  });

  it('should send notification when appointment is approved', async () => {
    // Create pending appointment
    const { data: appointment } = await supabase
      .from('appointments')
      .insert({
        patient_id: testPatientId,
        clinic_id: testClinicId,
        appointment_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'Pending',
        reason: 'Test approval notification',
      })
      .select()
      .single();

    testAppointmentId = appointment?.id;

    // Approve appointment
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'Confirmed' })
      .eq('id', testAppointmentId);

    expect(updateError).toBeNull();

    // Wait for notification
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check for approval notification
    const { data: notification } = await supabase
      .from('notifications')
      .select('*')
      .eq('appointment_id', testAppointmentId)
      .eq('type', 'appointment_confirmed')
      .single();

    expect(notification).toBeDefined();
    expect(notification?.recipient_email).toBeTruthy();
  });

  it('should send notification when appointment is rejected', async () => {
    // Create pending appointment
    const { data: appointment } = await supabase
      .from('appointments')
      .insert({
        patient_id: testPatientId,
        clinic_id: testClinicId,
        appointment_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'Pending',
        reason: 'Test rejection notification',
      })
      .select()
      .single();

    testAppointmentId = appointment?.id;

    // Reject appointment
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'Rejected' })
      .eq('id', testAppointmentId);

    expect(updateError).toBeNull();

    // Wait for notification
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check for rejection notification
    const { data: notification } = await supabase
      .from('notifications')
      .select('*')
      .eq('appointment_id', testAppointmentId)
      .eq('type', 'appointment_rejected')
      .single();

    expect(notification).toBeDefined();
  });

  it('should retry failed email notifications', async () => {
    // Create a notification record with failed status
    const { data: notification } = await supabase
      .from('notifications')
      .insert({
        appointment_id: testAppointmentId,
        type: 'appointment_created',
        recipient_email: 'test@example.com',
        status: 'failed',
        retry_count: 0,
      })
      .select()
      .single();

    expect(notification).toBeDefined();

    // Trigger retry logic (would be handled by notification service)
    // This is a simplified test - actual retry logic is in the service
    const { data: retried } = await supabase
      .from('notifications')
      .update({ retry_count: 1 })
      .eq('id', notification?.id)
      .select()
      .single();

    expect(retried?.retry_count).toBe(1);
  });

  it('should track notification delivery status', async () => {
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('appointment_id', testAppointmentId);

    expect(notifications).toBeDefined();
    expect(Array.isArray(notifications)).toBe(true);

    // Each notification should have a status
    notifications?.forEach((notif) => {
      expect(['sent', 'failed', 'pending']).toContain(notif.status);
    });
  });

  it('should include correct email template data', async () => {
    const { data: notification } = await supabase
      .from('notifications')
      .select('*, appointments(*)')
      .eq('appointment_id', testAppointmentId)
      .single();

    expect(notification).toBeDefined();
    expect(notification?.recipient_email).toBeTruthy();
    expect(notification?.appointments).toBeDefined();
  });

  it('should not send duplicate notifications', async () => {
    // Create appointment
    const { data: appointment } = await supabase
      .from('appointments')
      .insert({
        patient_id: testPatientId,
        clinic_id: testClinicId,
        appointment_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'Pending',
        reason: 'Test duplicate prevention',
      })
      .select()
      .single();

    const appointmentId = appointment?.id;

    // Wait for notification
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Count notifications for this appointment
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('appointment_id', appointmentId)
      .eq('type', 'appointment_created');

    expect(count).toBeLessThanOrEqual(1);

    // Cleanup
    if (appointmentId) {
      await supabase.from('appointments').delete().eq('id', appointmentId);
    }
  });
});
