import { createClient } from '@/lib/supabase/server';

export interface DoubleBookingCheck {
  isAvailable: boolean;
  existingAppointmentId?: string;
}

/**
 * Check if a time slot has an active (Pending or Confirmed) appointment
 */
export async function checkDoubleBooking(
  timeSlotId: string
): Promise<DoubleBookingCheck> {
  const supabase = await createClient();

  const { data: existingAppointments, error } = (await supabase
    .from('appointments')
    .select('id, status')
    .eq('time_slot_id', timeSlotId)
    .in('status', ['Pending', 'Confirmed'])) as {
    data: Array<{ id: string; status: string }> | null;
    error: unknown;
  };

  if (error) {
    console.error('Error checking double booking:', error);
    throw error;
  }

  if (existingAppointments && existingAppointments.length > 0) {
    return {
      isAvailable: false,
      existingAppointmentId: existingAppointments[0].id,
    };
  }

  return {
    isAvailable: true,
  };
}

/**
 * Check if a time slot can be booked (no conflicts)
 */
export async function canBookTimeSlot(timeSlotId: string): Promise<boolean> {
  const result = await checkDoubleBooking(timeSlotId);
  return result.isAvailable;
}
