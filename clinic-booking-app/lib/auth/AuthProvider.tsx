'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { Database } from '../supabase/database.types';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedUserIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Listen for auth changes - this will fire immediately with current session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthProvider] onAuthStateChange event:', _event);
      console.log('session?.user', session?.user);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        if (fetchedUserIdRef.current !== session.user.id) {
          fetchedUserIdRef.current = session.user.id;
          fetchUserRole(session.user.id);
        } else {
          setLoading(false);
        }
      } else {
        fetchedUserIdRef.current = null;
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle<{ role: UserRole }>();

      if (data) {
        setRole(data.role);
      } else if (error) {
        console.error('[AuthProvider] Error fetching role:', error);
        setRole(null);
      } else {
        // No data found, set null
        setRole(null);
      }
    } catch (error) {
      console.error('[AuthProvider] Exception fetching user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  }

  const value = {
    user,
    session,
    role,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
