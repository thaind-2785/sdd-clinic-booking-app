'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import Loading from '@/components/ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'patient' | 'clinic_staff';
  redirectTo?: string;
}

/**
 * T099: ProtectedRoute wrapper component
 * Ensures user is authenticated before rendering children
 * Optionally checks for specific role
 */
export default function ProtectedRoute({
  children,
  requireRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Redirect if not authenticated
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Redirect if role doesn't match
      if (requireRole && role !== requireRole) {
        const defaultRedirect =
          role === 'clinic_staff' ? '/clinic-dashboard' : '/patient-dashboard';
        router.push(defaultRedirect);
      }
    }
  }, [user, role, loading, requireRole, router, redirectTo]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Don't render if role doesn't match
  if (requireRole && role !== requireRole) {
    return null;
  }

  return <>{children}</>;
}
