import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkDoubleBooking } from '@/lib/utils/double-booking';
import { NotificationService } from '@/lib/services/notification-service';

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
        { error: 'Only clinic staff can approve appointments' },
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
        { error: 'You can only approve appointments for your clinic' },
        { status: 403 }
      );
    }

    // Check for double booking
    const bookingCheck = await checkDoubleBooking(appointment.time_slot_id);
    if (
      !bookingCheck.isAvailable &&
      bookingCheck.existingAppointmentId !== appointmentId
    ) {
      return NextResponse.json(
        { error: 'Time slot is already booked by another appointment' },
        { status: 409 }
      );
    }

    // Approve appointment
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'Confirmed',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      } as unknown as never)
      .eq('id', appointmentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error approving appointment:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve appointment' },
        { status: 500 }
      );
    }

    // Mark time slot as unavailable
    await supabase
      .from('time_slots')
      .update({ is_available: false } as unknown as never)
      .eq('id', appointment.time_slot_id);

    // T107: Send email notification for approval
    try {
      await NotificationService.sendEmail(
        appointmentId,
        'appointment_confirmed'
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ data: updatedAppointment });
  } catch (error) {
    console.error('Error in approve endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
