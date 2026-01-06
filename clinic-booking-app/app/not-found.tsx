import Link from 'next/link';
import Button from '@/components/ui/Button';

/**
 * Custom 404 Not Found page
 * Displayed when users navigate to non-existent routes
 * Provides helpful navigation options to get back on track
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mb-4 text-9xl font-bold text-blue-600">404</div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Page Not Found
          </h1>
          <p className="text-gray-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved or doesn&apos;t exist.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full" variant="primary" size="lg">
              Go to Homepage
            </Button>
          </Link>
          <Link href="/clinics" className="block">
            <Button className="w-full" variant="outline" size="lg">
              Browse Clinics
            </Button>
          </Link>
          <Link href="/patient-dashboard" className="block">
            <Button className="w-full" variant="outline" size="lg">
              My Appointments
            </Button>
          </Link>
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-gray-700">
            <strong>Quick Links:</strong>
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>
              <Link href="/clinics" className="underline hover:text-blue-600">
                Find a Clinic
              </Link>
            </li>
            <li>
              <Link href="/login" className="underline hover:text-blue-600">
                Sign In
              </Link>
            </li>
            <li>
              <Link
                href="/clinic-dashboard"
                className="underline hover:text-blue-600"
              >
                Clinic Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
