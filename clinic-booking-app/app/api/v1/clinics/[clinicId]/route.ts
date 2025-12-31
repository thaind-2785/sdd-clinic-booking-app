import { NextRequest, NextResponse } from 'next/server';
import { getClinicById } from '@/lib/supabase/queries/clinics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    const { clinicId } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(clinicId)) {
      return NextResponse.json(
        { error: 'Invalid clinic ID format' },
        { status: 400 }
      );
    }

    const clinic = await getClinicById(clinicId);

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    return NextResponse.json({ data: clinic });
  } catch (error) {
    console.error('Error fetching clinic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinic details' },
      { status: 500 }
    );
  }
}
