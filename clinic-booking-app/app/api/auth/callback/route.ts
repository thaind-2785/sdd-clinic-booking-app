import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * T095: Google OAuth callback handler
 * Handles the OAuth callback from Supabase Auth
 * Exchange code for session and redirect to appropriate page
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = await createClient();

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        new URL('/login?error=auth_failed', requestUrl.origin)
      );
    }

    // Get user data to determine role and redirect
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if user exists in our database
      const { data: existingUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      // If new user from OAuth, create user record
      // Note: Email/password signups are handled in the login page directly
      if (!existingUser && user.app_metadata.provider === 'google') {
        const { error: insertError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata.full_name || user.email!.split('@')[0],
          avatar_url: user.user_metadata.avatar_url,
          role: 'patient', // Default role is patient for OAuth users
          google_id: user.user_metadata.sub || null,
        });

        if (insertError) {
          console.error('Error creating user:', insertError);
        }

        // Patient profile will be created automatically by database trigger
        // (See migration: 20251231000004_auto_create_patient_trigger.sql)
      }

      // Redirect based on role
      const role = existingUser?.role || 'patient';
      const redirectUrl =
        role === 'clinic_staff' ? '/clinic-dashboard' : '/patient-dashboard';

      return NextResponse.redirect(
        new URL(next || redirectUrl, requestUrl.origin)
      );
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
