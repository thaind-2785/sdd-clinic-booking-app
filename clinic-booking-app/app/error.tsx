'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

/**
 * Global error boundary for the application
 * Catches and displays errors that occur during rendering
 * Provides user-friendly error messages and recovery options
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
            <p className="font-mono text-sm break-all text-red-800">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-red-600">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full"
            variant="primary"
            size="lg"
          >
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            className="w-full"
            variant="outline"
            size="lg"
          >
            Go to Homepage
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
