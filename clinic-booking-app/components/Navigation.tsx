'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import Button from './ui/Button';

export default function Navigation() {
  const pathname = usePathname();
  const { user, role, loading, signOut } = useAuth();

  const isActive = (path: string) => pathname === path;

  if (loading) {
    return (
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-primary hover:text-primary-dark flex items-center gap-2 text-xl font-bold focus:outline-none"
          >
            <svg
              className="h-8 w-8"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <span>Clinic Booking</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link
                  href="/clinics"
                  className={`focus:ring-primary rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                    isActive('/clinics')
                      ? 'text-primary bg-gray-100'
                      : 'text-gray-700'
                  }`}
                >
                  Tìm phòng khám
                </Link>
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {role === 'patient' && (
                  <>
                    <Link
                      href="/clinics"
                      className={`focus:ring-primary rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                        isActive('/clinics')
                          ? 'text-primary bg-gray-100'
                          : 'text-gray-700'
                      }`}
                    >
                      Tìm phòng khám
                    </Link>
                    <Link
                      href="/patient-dashboard"
                      className={`focus:ring-primary rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                        isActive('/patient-dashboard')
                          ? 'text-primary bg-gray-100'
                          : 'text-gray-700'
                      }`}
                    >
                      Lịch hẹn của tôi
                    </Link>
                  </>
                )}

                {role === 'clinic_staff' && (
                  <Link
                    href="/clinic-dashboard"
                    className={`focus:ring-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                      isActive('/clinic-dashboard')
                        ? 'text-primary bg-primary/10 border-primary/20 border'
                        : 'text-gray-700'
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    Dashboard
                  </Link>
                )}

                <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                  {user.user_metadata?.avatar_url && (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.name || 'User avatar'}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.user_metadata?.name || user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    Đăng xuất
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
