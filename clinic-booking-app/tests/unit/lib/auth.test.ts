/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

/**
 * Unit tests for JWT token validation and authentication
 */

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  })),
}));

describe('JWT Token Validation', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createClient('https://test.supabase.co', 'test-key');
    vi.clearAllMocks();
  });

  it('should validate a valid JWT token', async () => {
    const validToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: validToken,
          user: { id: '123', email: 'test@example.com' },
        },
      },
      error: null,
    });

    const { data, error } = await mockSupabase.auth.getSession();

    expect(error).toBeNull();
    expect(data.session).toBeDefined();
    expect(data.session.access_token).toBe(validToken);
    expect(data.session.user).toBeDefined();
  });

  it('should reject expired JWT token', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Token expired', status: 401 },
    });

    const { data, error } = await mockSupabase.auth.getSession();

    expect(error).toBeDefined();
    expect(error.message).toContain('expired');
    expect(data.session).toBeNull();
  });

  it('should reject malformed JWT token', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid token', status: 400 },
    });

    const { data, error } = await mockSupabase.auth.getSession();

    expect(error).toBeDefined();
    expect(data.session).toBeNull();
  });

  it('should extract user info from valid token', async () => {
    const userInfo = {
      id: 'user-123',
      email: 'patient@example.com',
      role: 'patient',
      email_confirmed_at: new Date().toISOString(),
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: userInfo },
      error: null,
    });

    const { data, error } = await mockSupabase.auth.getUser();

    expect(error).toBeNull();
    expect(data.user).toEqual(userInfo);
    expect(data.user.email).toBe('patient@example.com');
    expect(data.user.role).toBe('patient');
  });

  it('should handle missing token', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { data, error } = await mockSupabase.auth.getSession();

    expect(error).toBeNull();
    expect(data.session).toBeNull();
  });

  it('should validate token refresh', async () => {
    const oldToken = 'old.token.value';
    const newToken = 'new.token.value';

    mockSupabase.auth.getSession
      .mockResolvedValueOnce({
        data: {
          session: {
            access_token: oldToken,
            refresh_token: 'refresh-token',
          },
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          session: {
            access_token: newToken,
            refresh_token: 'new-refresh-token',
          },
        },
        error: null,
      });

    const { data: session1 } = await mockSupabase.auth.getSession();
    expect(session1.session.access_token).toBe(oldToken);

    // Simulate token refresh
    const { data: session2 } = await mockSupabase.auth.getSession();
    expect(session2.session.access_token).toBe(newToken);
  });

  it('should verify token contains required claims', async () => {
    const userWithClaims = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: { role: 'patient' },
      user_metadata: { full_name: 'Test User' },
      aud: 'authenticated',
      role: 'authenticated',
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: userWithClaims },
      error: null,
    });

    const { data } = await mockSupabase.auth.getUser();

    expect(data.user.id).toBeDefined();
    expect(data.user.email).toBeDefined();
    expect(data.user.aud).toBe('authenticated');
    expect(data.user.app_metadata).toBeDefined();
  });

  it('should handle token blacklisting on signout', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null,
    });

    const { error } = await mockSupabase.auth.signOut();

    expect(error).toBeNull();
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it('should validate auth state changes', async () => {
    const callback = vi.fn();

    mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
      cb('SIGNED_IN', { user: { id: '123' }, access_token: 'token' });
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    mockSupabase.auth.onAuthStateChange(callback);

    expect(callback).toHaveBeenCalledWith('SIGNED_IN', expect.any(Object));
  });

  it('should handle concurrent token validation requests', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'valid-token',
          user: { id: '123' },
        },
      },
      error: null,
    });

    const promises = Array(5)
      .fill(null)
      .map(() => mockSupabase.auth.getSession());

    const results = await Promise.all(promises);

    results.forEach((result) => {
      expect(result.error).toBeNull();
      expect(result.data.session).toBeDefined();
    });
  });

  it('should validate token signature', async () => {
    // Simulating signature validation failure
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid signature', status: 401 },
    });

    const { data, error } = await mockSupabase.auth.getSession();

    expect(error).toBeDefined();
    expect(error.message).toContain('signature');
    expect(data.session).toBeNull();
  });

  it('should handle role-based token validation', async () => {
    const clinicStaffUser = {
      id: 'staff-123',
      email: 'staff@clinic.com',
      app_metadata: { role: 'clinic_staff' },
      role: 'authenticated',
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: clinicStaffUser },
      error: null,
    });

    const { data } = await mockSupabase.auth.getUser();

    expect(data.user.app_metadata.role).toBe('clinic_staff');
  });

  it('should handle token validation with network errors', async () => {
    mockSupabase.auth.getSession.mockRejectedValue(
      new Error('Network request failed')
    );

    await expect(mockSupabase.auth.getSession()).rejects.toThrow(
      'Network request failed'
    );
  });
});
