import { createClient } from '../client';
import { TimeSlot } from '@/lib/types';

export interface GetTimeSlotsParams {
  clinic_id: string;
  date?: string;
  start_time?: string;
  end_time?: string;
}

export async function getAvailableTimeSlots({
  clinic_id,
  date,
  start_time,
  end_time,
}: GetTimeSlotsParams): Promise<TimeSlot[]> {
  const supabase = createClient();

  let query = supabase
    .from('time_slots')
    .select('*')
    .eq('clinic_id', clinic_id)
    .eq('is_available', true)
    .gte('date', new Date().toISOString().split('T')[0]); // Only future dates

  if (date) {
    query = query.eq('date', date);
  }

  if (start_time) {
    query = query.gte('start_time', start_time);
  }

  if (end_time) {
    query = query.lte('end_time', end_time);
  }

  query = query.order('date').order('start_time');

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching time slots:', error);
    throw error;
  }

  return data || [];
}

export async function getTimeSlotById(
  timeSlotId: string
): Promise<TimeSlot | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .eq('id', timeSlotId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching time slot:', error);
    throw error;
  }

  return data;
}
