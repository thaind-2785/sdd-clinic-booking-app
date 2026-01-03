// T103: Supabase Edge Function for email sending
// Deploy with: supabase functions deploy send-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEB_DOMAIN = Deno.env.get('WEB_DOMAIN')!;

interface EmailPayload {
  appointmentId: string;
  notificationType:
    | 'appointment_created'
    | 'appointment_confirmed'
    | 'appointment_rejected';
}

// Email templates stored as constants (inline to avoid file loading issues in Deno)
const EMAIL_TEMPLATES: Record<string, string> = {
  'appointment-created': `<!doctype html><html lang="vi"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Yêu cầu đặt lịch đã được tạo</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.container{background-color:#f9fafb;border-radius:8px;padding:30px}.header{text-align:center;margin-bottom:30px}.header h1{color:#0066cc;margin:0}.content{background-color:white;border-radius:8px;padding:20px;margin-bottom:20px}.detail-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb}.detail-label{font-weight:600;color:#6b7280}.detail-value{color:#111827}.status-badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:14px;font-weight:600;background-color:#fef3c7;color:#92400e}.footer{text-align:center;font-size:14px;color:#6b7280;margin-top:20px}.button{display:inline-block;padding:12px 24px;background-color:#0066cc;color:white;text-decoration:none;border-radius:6px;margin:20px 0}</style></head><body><div class="container"><div class="header"><h1>✅ Yêu cầu đặt lịch đã được tạo</h1></div><div class="content"><p>Xin chào <strong>{{patientName}}</strong>,</p><p>Yêu cầu đặt lịch khám của bạn đã được gửi thành công. Dưới đây là thông tin chi tiết:</p><div class="detail-row"><span class="detail-label">Mã đặt lịch:</span><span class="detail-value">{{appointmentId}}</span></div><div class="detail-row"><span class="detail-label">Phòng khám:</span><span class="detail-value">{{clinicName}}</span></div><div class="detail-row"><span class="detail-label">Địa chỉ:</span><span class="detail-value">{{clinicAddress}}</span></div><div class="detail-row"><span class="detail-label">Ngày khám:</span><span class="detail-value">{{appointmentDate}}</span></div><div class="detail-row"><span class="detail-label">Giờ khám:</span><span class="detail-value">{{appointmentTime}}</span></div><div class="detail-row"><span class="detail-label">Lý do khám:</span><span class="detail-value">{{reasonForVisit}}</span></div><div class="detail-row"><span class="detail-label">Trạng thái:</span><span class="status-badge">Chờ xác nhận</span></div><p style="margin-top:20px">Phòng khám sẽ xem xét và phản hồi yêu cầu của bạn trong thời gian sớm nhất. Bạn sẽ nhận được email thông báo khi yêu cầu được xác nhận hoặc từ chối.</p><center><a href="{{dashboardUrl}}" class="button">Xem chi tiết đặt lịch</a></center></div><div class="footer"><p>Email này được gửi tự động. Vui lòng không trả lời email này.</p><p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ: {{clinicPhone}}</p></div></div></body></html>`,

  'appointment-confirmed': `<!doctype html><html lang="vi"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Lịch khám đã được xác nhận</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.container{background-color:#f9fafb;border-radius:8px;padding:30px}.header{text-align:center;margin-bottom:30px}.header h1{color:#059669;margin:0}.success-icon{font-size:48px;margin-bottom:10px}.content{background-color:white;border-radius:8px;padding:20px;margin-bottom:20px}.detail-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb}.detail-label{font-weight:600;color:#6b7280}.detail-value{color:#111827}.status-badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:14px;font-weight:600;background-color:#d1fae5;color:#065f46}.highlight-box{background-color:#ecfdf5;border-left:4px solid #059669;padding:15px;margin:20px 0;border-radius:4px}.footer{text-align:center;font-size:14px;color:#6b7280;margin-top:20px}.button{display:inline-block;padding:12px 24px;background-color:#059669;color:white;text-decoration:none;border-radius:6px;margin:20px 0}</style></head><body><div class="container"><div class="header"><div class="success-icon">✅</div><h1>Lịch khám đã được xác nhận</h1></div><div class="content"><p>Xin chào <strong>{{patientName}}</strong>,</p><p><strong>Chúc mừng!</strong> Lịch khám của bạn đã được phòng khám xác nhận.</p><div class="highlight-box"><p style="margin:0;font-weight:600;color:#059669">Vui lòng đến đúng giờ và mang theo giấy tờ tùy thân.</p></div><div class="detail-row"><span class="detail-label">Mã đặt lịch:</span><span class="detail-value">{{appointmentId}}</span></div><div class="detail-row"><span class="detail-label">Phòng khám:</span><span class="detail-value">{{clinicName}}</span></div><div class="detail-row"><span class="detail-label">Địa chỉ:</span><span class="detail-value">{{clinicAddress}}</span></div><div class="detail-row"><span class="detail-label">Ngày khám:</span><span class="detail-value">{{appointmentDate}}</span></div><div class="detail-row"><span class="detail-label">Giờ khám:</span><span class="detail-value">{{appointmentTime}}</span></div><div class="detail-row"><span class="detail-label">Lý do khám:</span><span class="detail-value">{{reasonForVisit}}</span></div><div class="detail-row"><span class="detail-label">Trạng thái:</span><span class="status-badge">Đã xác nhận</span></div><p style="margin-top:20px"><strong>Lưu ý quan trọng:</strong></p><ul><li>Vui lòng đến trước giờ hẹn 15 phút</li><li>Mang theo CMND/CCCD và sổ khám bệnh (nếu có)</li><li>Nếu cần hủy lịch, vui lòng liên hệ phòng khám trước 24 giờ</li></ul><center><a href="{{dashboardUrl}}" class="button">Xem chi tiết đặt lịch</a></center></div><div class="footer"><p>Email này được gửi tự động. Vui lòng không trả lời email này.</p><p>Liên hệ phòng khám: {{clinicPhone}} | {{clinicEmail}}</p></div></div></body></html>`,

  'appointment-rejected': `<!doctype html><html lang="vi"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Lịch khám đã bị từ chối</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.container{background-color:#f9fafb;border-radius:8px;padding:30px}.header{text-align:center;margin-bottom:30px}.header h1{color:#dc2626;margin:0}.warning-icon{font-size:48px;margin-bottom:10px}.content{background-color:white;border-radius:8px;padding:20px;margin-bottom:20px}.detail-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb}.detail-label{font-weight:600;color:#6b7280}.detail-value{color:#111827}.status-badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:14px;font-weight:600;background-color:#fee2e2;color:#991b1b}.reason-box{background-color:#fef2f2;border-left:4px solid #dc2626;padding:15px;margin:20px 0;border-radius:4px}.footer{text-align:center;font-size:14px;color:#6b7280;margin-top:20px}.button{display:inline-block;padding:12px 24px;background-color:#0066cc;color:white;text-decoration:none;border-radius:6px;margin:20px 0}</style></head><body><div class="container"><div class="header"><div class="warning-icon">❌</div><h1>Lịch khám đã bị từ chối</h1></div><div class="content"><p>Xin chào <strong>{{patientName}}</strong>,</p><p>Rất tiếc, yêu cầu đặt lịch khám của bạn đã không được chấp nhận.</p><div class="detail-row"><span class="detail-label">Mã đặt lịch:</span><span class="detail-value">{{appointmentId}}</span></div><div class="detail-row"><span class="detail-label">Phòng khám:</span><span class="detail-value">{{clinicName}}</span></div><div class="detail-row"><span class="detail-label">Ngày khám (đã yêu cầu):</span><span class="detail-value">{{appointmentDate}}</span></div><div class="detail-row"><span class="detail-label">Giờ khám (đã yêu cầu):</span><span class="detail-value">{{appointmentTime}}</span></div><div class="detail-row"><span class="detail-label">Trạng thái:</span><span class="status-badge">Đã từ chối</span></div><div class="reason-box"><p style="margin:0 0 10px 0;font-weight:600;color:#dc2626">Lý do từ chối:</p><p style="margin:0">{{rejectionReason}}</p></div><p><strong>Bạn có thể thực hiện các hành động sau:</strong></p><ul><li>Đặt lịch khám vào thời gian khác</li><li>Liên hệ trực tiếp với phòng khám để được tư vấn</li><li>Tìm kiếm phòng khám khác phù hợp hơn</li></ul><center><a href="{{clinicsUrl}}" class="button">Tìm kiếm phòng khám khác</a></center></div><div class="footer"><p>Email này được gửi tự động. Vui lòng không trả lời email này.</p><p>Liên hệ phòng khám: {{clinicPhone}} | {{clinicEmail}}</p><p style="margin-top:10px;font-size:12px">Chúng tôi rất tiếc về sự bất tiện này. Cảm ơn bạn đã sử dụng dịch vụ.</p></div></div></body></html>`,
};

// Get template by name
function getTemplate(templateName: string): string {
  const template = EMAIL_TEMPLATES[templateName];
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }
  return template;
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
    const template = getTemplate(templateName);
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

    console.log('[Email] Sending email to:', recipients);
    // Send email via Resend (send to multiple recipients)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Clinic Booking <noreply@${WEB_DOMAIN}>`,
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
