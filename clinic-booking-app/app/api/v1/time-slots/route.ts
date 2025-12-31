import { NextRequest, NextResponse } from 'next/server';
import { getAvailableTimeSlots } from '@/lib/supabase/queries/time-slots';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinic_id = searchParams.get('clinic_id');
    const date = searchParams.get('date');
    const start_time = searchParams.get('start_time');
    const end_time = searchParams.get('end_time');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    const filters: Record<string, string> = { clinic_id };
    if (date) filters.date = date;
    if (start_time) filters.start_time = start_time;
    if (end_time) filters.end_time = end_time;

    const timeSlots = await getAvailableTimeSlots(filters);

    return NextResponse.json({ data: timeSlots });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
