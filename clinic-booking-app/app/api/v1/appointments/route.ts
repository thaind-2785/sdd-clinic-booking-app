import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAppointmentSchema } from '@/lib/validations/appointment';
import {
  createAppointment,
  getAppointmentsByPatient,
} from '@/lib/supabase/queries/appointments';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createAppointmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const appointment = await createAppointment(
      {
        patient_id: user.id,
        ...validation.data,
      },
      supabase
    );

    console.log('[Appointment Created]', {
      appointmentId: appointment.id,
      patientId: user.id,
      clinicId: validation.data.clinic_id,
    });

    // Email will be sent automatically via Database Webhook

    return NextResponse.json({ data: appointment }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);

    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('Time slot is no longer available')) {
      return NextResponse.json(
        { error: 'Time slot is no longer available' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create appointment', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as
      | 'Pending'
      | 'Confirmed'
      | 'Rejected'
      | undefined;

    const appointments = await getAppointmentsByPatient(
      user.id,
      status,
      supabase
    );

    return NextResponse.json({ data: appointments });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch appointments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
