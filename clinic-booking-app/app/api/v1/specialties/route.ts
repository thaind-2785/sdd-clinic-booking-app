import { NextResponse } from 'next/server';
import { getSpecialties } from '@/lib/supabase/queries/specialties';

export async function GET() {
  try {
    const specialties = await getSpecialties();

    return NextResponse.json({
      data: specialties,
    });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
}
