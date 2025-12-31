import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * T097: Sign-out functionality
 * Clears the user session and redirects to home page
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', request.url));
}
