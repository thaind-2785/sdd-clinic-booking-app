import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AppointmentWithDetails } from '@/lib/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const supabase = await createClient();
    const { appointmentId } = await context.params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch appointment with all related data
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        clinic:clinics(*),
        time_slot:time_slots(*),
        patient:patients(
          *,
          user:users(*)
        )
      `
      )
      .eq('id', appointmentId)
      .single();

    if (error) {
      console.error('Error fetching appointment:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointment' },
        { status: 500 }
      );
    }

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: appointment as AppointmentWithDetails,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/appointments/[appointmentId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
