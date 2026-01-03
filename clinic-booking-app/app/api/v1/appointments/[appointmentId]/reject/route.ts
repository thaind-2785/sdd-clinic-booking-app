import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { NotificationService } from '@/lib/services/notification-service';

const rejectSchema = z.object({
  rejection_reason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const supabase = await createClient();
    const { appointmentId } = await params;

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const validation = rejectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verify user is clinic staff
    const { data: userData } = (await supabase
      .from('users')
      .select('role, clinic_staff_id')
      .eq('id', user.id)
      .single()) as {
      data: { role: string; clinic_staff_id: string | null } | null;
    };

    if (!userData || userData.role !== 'clinic_staff') {
      return NextResponse.json(
        { error: 'Only clinic staff can reject appointments' },
        { status: 403 }
      );
    }

    // Get appointment details
    const { data: appointment, error: fetchError } = (await supabase
      .from('appointments')
      .select('*, time_slot_id, clinic_id')
      .eq('id', appointmentId)
      .single()) as {
      data: {
        id: string;
        time_slot_id: string;
        clinic_id: string;
        status: string;
      } | null;
      error: unknown;
    };

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify clinic staff belongs to the clinic
    if (!userData.clinic_staff_id) {
      return NextResponse.json(
        { error: 'Clinic staff ID not found' },
        { status: 403 }
      );
    }

    const { data: staffData } = (await supabase
      .from('clinic_staff')
      .select('clinic_id')
      .eq('id', userData.clinic_staff_id)
      .single()) as { data: { clinic_id: string } | null };

    if (!staffData || staffData.clinic_id !== appointment.clinic_id) {
      return NextResponse.json(
        { error: 'You can only reject appointments for your clinic' },
        { status: 403 }
      );
    }

    // Reject appointment
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'Rejected',
      } as unknown as never)
      .eq('id', appointmentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error rejecting appointment:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject appointment' },
        { status: 500 }
      );
    }

    // Release time slot
    await supabase
      .from('time_slots')
      .update({ is_available: true } as unknown as never)
      .eq('id', appointment.time_slot_id);

    // Email will be sent automatically via database webhook (T104)
    // No need to call NotificationService here

    return NextResponse.json({ data: updatedAppointment });
  } catch (error) {
    console.error('Error in reject endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
