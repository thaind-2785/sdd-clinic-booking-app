import { createClient } from '@/lib/supabase/server';

export type NotificationType =
  | 'appointment_created'
  | 'appointment_confirmed'
  | 'appointment_rejected'
  | 'appointment_reminder';

export type DeliveryStatus = 'pending' | 'sent' | 'failed';

/**
 * T105: Email delivery status tracking
 * Service to manage email notifications
 */
export class NotificationService {
  /**
   * Send email notification via Edge Function
   */
  static async sendEmail(
    appointmentId: string,
    notificationType: NotificationType
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get Supabase Functions URL from environment
      const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
        '.supabase.co',
        '.functions.supabase.co'
      );

      if (!functionsUrl) {
        throw new Error('Supabase Functions URL not configured');
      }

      // Use service role key for server-to-server communication
      const authKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      // Call Edge Function
      const response = await fetch(`${functionsUrl}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authKey}`,
        },
        body: JSON.stringify({
          appointmentId,
          notificationType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get notification history for an appointment
   */
  static async getNotifications(appointmentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update notification delivery status
   */
  static async updateDeliveryStatus(
    notificationId: string,
    status: DeliveryStatus,
    errorMessage?: string
  ) {
    const supabase = await createClient();

    const { error } = await supabase
      .from('notifications')
      .update({
        delivery_status: status,
        error_message: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error updating notification status:', error);
      throw error;
    }
  }

  /**
   * Get pending notifications (for retry logic)
   */
  static async getPendingNotifications() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('delivery_status', 'pending')
      .order('sent_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching pending notifications:', error);
      throw error;
    }

    return data;
  }
}
