'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { User as AppUser } from '@/lib/types';

/**
 * T098: useAuth hook for client components
 * Provides authentication state and user data
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Fetch app user data if authenticated
      if (user) {
        const { data: appUserData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        setAppUser(appUserData);
      }

      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: appUserData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setAppUser(appUserData);
      } else {
        setAppUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAppUser(null);
  };

  return {
    user,
    appUser,
    loading,
    isAuthenticated: !!user,
    isPatient: appUser?.role === 'patient',
    isClinicStaff: appUser?.role === 'clinic_staff',
    signOut,
  };
}
