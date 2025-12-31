import { NextRequest, NextResponse } from 'next/server';
import { getClinics } from '@/lib/supabase/queries/clinics';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const specialty = searchParams.get('specialty') || undefined;
    const city = searchParams.get('city') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (isNaN(limit) || isNaN(offset)) {
      return NextResponse.json(
        { error: 'Invalid limit or offset parameter' },
        { status: 400 }
      );
    }

    const { data: clinics, total } = await getClinics({
      specialty,
      city,
      search,
      limit,
      offset,
    });

    return NextResponse.json({
      data: clinics,
      total,
      limit,
      offset,
      hasMore: offset + clinics.length < total,
    });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    );
  }
}
