// T103: Supabase Edge Function for email sending
// Deploy with: supabase functions deploy send-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface EmailPayload {
  appointmentId: string;
  notificationType:
    | 'appointment_created'
    | 'appointment_confirmed'
    | 'appointment_rejected';
}

// Load email templates
async function loadTemplate(templateName: string): Promise<string> {
  const response = await fetch(
    new URL(`./templates/${templateName}.html`, import.meta.url)
  );
  return await response.text();
}

// Replace template variables
function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

serve(async (req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();

    // Support both webhook payload and direct call
    let appointmentId: string;
    let notificationType: EmailPayload['notificationType'];

    // Check if it's a webhook payload (has 'record' or 'old_record')
    if (body.record) {
      // Webhook payload
      appointmentId = body.record.id;

      // Determine notification type based on event
      if (body.type === 'INSERT') {
        notificationType = 'appointment_created';
      } else if (body.type === 'UPDATE') {
        const oldStatus = body.old_record?.status;
        const newStatus = body.record.status;

        if (oldStatus !== 'Confirmed' && newStatus === 'Confirmed') {
          notificationType = 'appointment_confirmed';
        } else if (oldStatus !== 'Rejected' && newStatus === 'Rejected') {
          notificationType = 'appointment_rejected';
        } else {
          // No notification for other status changes
          return new Response(
            JSON.stringify({
              success: true,
              message: 'No notification needed',
            }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      } else {
        throw new Error('Unsupported webhook event type');
      }
    } else {
      // Direct call payload
      appointmentId = body.appointmentId;
      notificationType = body.notificationType;
    }

    console.log('[Email] Processing:', { appointmentId, notificationType });

    // Query database for appointment details
    console.log('[Email] Fetching appointment details from database');

    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .select(
        `
        *,
        patient:patients!patient_id (
          user:users!user_id (
            email,
            name
          )
        ),
        clinic:clinics!clinic_id (
          name,
          address,
          city,
          phone,
          email
        ),
        time_slot:time_slots!time_slot_id (
          date,
          start_time,
          end_time
        )
      `
      )
      .eq('id', appointmentId)
      .single();

    if (appointmentError) {
      console.error('[Email] Error fetching appointment:', appointmentError);
      throw new Error(`Appointment not found: ${appointmentError.message}`);
    }

    if (!appointmentData) {
      console.error('[Email] No appointment data returned');
      throw new Error('Appointment not found');
    }

    console.log('[Email] Appointment data fetched successfully');
    const appointment = appointmentData;

    // Fetch clinic staff
    const { data: staffData, error: staffError } = await supabase
      .from('clinic_staff')
      .select(
        `
        user_id,
        user:users!user_id (
          email,
          name
        )
      `
      )
      .eq('clinic_id', appointment.clinic_id);

    if (staffError) {
      console.error('[Email] Error fetching clinic staff:', staffError);
    }

    const clinicStaff = staffError ? [] : staffData || [];

    // Determine template and subject
    let templateName: string;
    let subject: string;

    switch (notificationType) {
      case 'appointment_created':
        templateName = 'appointment-created';
        subject = 'Yêu cầu đặt lịch đã được tạo';
        break;
      case 'appointment_confirmed':
        templateName = 'appointment-confirmed';
        subject = 'Lịch khám đã được xác nhận';
        break;
      case 'appointment_rejected':
        templateName = 'appointment-rejected';
        subject = 'Lịch khám đã bị từ chối';
        break;
      default:
        throw new Error('Invalid notification type');
    }

    // Load and prepare template
    const template = await loadTemplate(templateName);
    const variables = {
      patientName: appointment.patient.user.name,
      appointmentId: appointment.id.substring(0, 8),
      clinicName: appointment.clinic.name,
      clinicAddress: `${appointment.clinic.address}, ${appointment.clinic.city}`,
      clinicPhone: appointment.clinic.phone,
      clinicEmail: appointment.clinic.email,
      appointmentDate: new Date(appointment.time_slot.date).toLocaleDateString(
        'vi-VN'
      ),
      appointmentTime: `${appointment.time_slot.start_time} - ${appointment.time_slot.end_time}`,
      reasonForVisit: appointment.reason_for_visit,
      dashboardUrl: `${Deno.env.get('APP_URL')}/patient-dashboard`,
      clinicsUrl: `${Deno.env.get('APP_URL')}/clinics`,
      rejectionReason: appointment.rejection_reason || 'Không có lý do cụ thể',
      approvedBy: appointment.approved_by || 'N/A',
    };

    const htmlContent = replaceVariables(template, variables);

    // Determine recipients based on notification type
    const recipients: string[] = [];

    if (notificationType === 'appointment_created') {
      // New appointment: Notify patient + clinic staff
      recipients.push(appointment.patient.user.email);
      if (clinicStaff && clinicStaff.length > 0) {
        clinicStaff.forEach((staff) => {
          if (staff.user?.email) {
            recipients.push(staff.user.email);
          }
        });
      }
    } else {
      // Confirmed/Rejected: Only notify patient
      recipients.push(appointment.patient.user.email);
    }

    // Send email via Resend (send to multiple recipients)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Clinic Booking <noreply@clinic-booking.com>',
        to: recipients,
        subject,
        html: htmlContent,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(`Email sending failed: ${JSON.stringify(emailResult)}`);
    }

    // Log notification
    await supabase.from('notifications').insert({
      recipient_email: appointment.patient.user.email,
      notification_type: notificationType,
      appointment_id: appointmentId,
      delivery_status: 'sent',
    });

    // Log notifications for clinic staff if notified
    if (
      notificationType === 'appointment_created' &&
      clinicStaff &&
      clinicStaff.length > 0
    ) {
      const staffNotifications = clinicStaff
        .filter((staff) => staff.user?.email)
        .map((staff) => ({
          recipient_email: staff.user.email,
          notification_type: notificationType,
          appointment_id: appointmentId,
          delivery_status: 'sent',
        }));

      if (staffNotifications.length > 0) {
        await supabase.from('notifications').insert(staffNotifications);
      }
    }

    return new Response(
      JSON.stringify({ success: true, messageId: emailResult.id }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
