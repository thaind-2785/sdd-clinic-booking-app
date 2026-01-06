'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

/**
 * T096: Sign-in page with Email/Password authentication
 * Allows users to authenticate using email and password
 */
function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<'patient' | 'clinic_staff'>(
    'patient'
  );
  const [selectedClinic, setSelectedClinic] = useState('');
  const [clinics, setClinics] = useState<Array<{ id: string; name: string }>>(
    []
  );

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth_failed') {
      setError('Xác thực không thành công. Vui lòng thử lại.');
    }
  }, [searchParams]);

  // Fetch clinics when switching to clinic_staff signup
  useEffect(() => {
    if (isSignUp && accountType === 'clinic_staff') {
      fetchClinics();
    }
  }, [isSignUp, accountType]);

  const fetchClinics = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('clinics')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setClinics(data);
      if (data.length > 0) {
        setSelectedClinic(data[0].id);
      }
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (isSignUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: accountType, // Pass role to trigger
              ...(accountType === 'clinic_staff' && selectedClinic
                ? { clinic_id: selectedClinic }
                : {}),
            },
            // No emailRedirectTo - we handle redirect immediately after signup
          },
        });

        if (error) throw error;

        // Create user record in public.users table
        if (data.user) {
          const { error: userError } = await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email!,
            name: name,
            role: accountType,
            google_id: null,
            avatar_url: null,
          });

          if (userError) {
            console.error('Error creating user record:', userError);
            throw new Error('Không thể tạo hồ sơ người dùng');
          }

          // For clinic_staff, manually create clinic_staff record
          // (Trigger won't work because it can't access auth metadata reliably)
          if (accountType === 'clinic_staff' && selectedClinic) {
            const { error: staffError } = await supabase
              .from('clinic_staff')
              .insert({
                user_id: data.user.id,
                clinic_id: selectedClinic,
                role: 'receptionist',
              });

            if (staffError) {
              console.error('Error creating clinic_staff record:', staffError);
              // Don't throw - user is created, we can fix this later
            }
          }

          // Redirect after successful signup
          const redirectUrl =
            accountType === 'clinic_staff'
              ? '/clinic-dashboard'
              : '/patient-dashboard';
          router.push(redirectUrl);
        }
      } else {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const redirectUrl =
            accountType === 'clinic_staff'
              ? '/clinic-dashboard'
              : '/patient-dashboard';
          router.push(redirectUrl);
        }
      }
    } catch (err: unknown) {
      console.error('Error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="space-y-6 p-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {isSignUp ? 'Đăng ký' : 'Đăng nhập'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp
                ? 'Tạo tài khoản mới để đặt lịch khám'
                : 'Đăng nhập để đặt lịch khám hoặc quản lý phòng khám'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            {isSignUp && (
              <>
                {/* Account Type Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Loại tài khoản
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAccountType('patient')}
                      className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                        accountType === 'patient'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>Bệnh nhân</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('clinic_staff')}
                      className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                        accountType === 'clinic_staff'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span>Phòng khám</span>
                      </div>
                    </button>
                  </div>
                </div>

                <Input
                  type="text"
                  label="Họ tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />

                {/* Clinic Selector - only show for clinic_staff */}
                {accountType === 'clinic_staff' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Chọn phòng khám
                    </label>
                    <select
                      value={selectedClinic}
                      onChange={(e) => setSelectedClinic(e.target.value)}
                      className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:outline-none"
                      required
                    >
                      {clinics.length === 0 ? (
                        <option value="">Đang tải phòng khám...</option>
                      ) : (
                        clinics.map((clinic) => (
                          <option key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-xs text-gray-500">
                      Chọn phòng khám bạn làm việc
                    </p>
                  </div>
                )}
              </>
            )}

            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Input
              type="password"
              label="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />

            <Button type="submit" disabled={loading} fullWidth>
              {loading ? (
                <>
                  <svg
                    className="mr-2 h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isSignUp ? 'Đang đăng ký...' : 'Đang đăng nhập...'}
                </>
              ) : (
                <>{isSignUp ? 'Đăng ký' : 'Đăng nhập'}</>
              )}
            </Button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-primary text-sm hover:underline"
            >
              {isSignUp
                ? 'Đã có tài khoản? Đăng nhập'
                : 'Chưa có tài khoản? Đăng ký'}
            </button>
          </div>

          {/* Demo Info */}
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium">💡 Demo Mode</p>
            <p className="mt-2">
              <strong>Đăng ký mới:</strong> Chọn loại tài khoản (Bệnh nhân hoặc
              Phòng khám) và tạo tài khoản với email bất kỳ.
            </p>
            <p className="mt-2 text-xs">
              <strong>Hoặc dùng tài khoản demo:</strong>
              <br />
              Patient: demo@example.com / demo123
              <br />
              Clinic: staff@clinic.com / staff123
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
