import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

/**
 * Loading state for clinic listing page
 * Displays while Server Component is fetching clinic data
 * Uses Suspense boundary for better UX
 */
export default function ClinicsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="mb-4 h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-96 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Filter skeleton */}
      <div className="mb-6">
        <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Clinic cards skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Loading size="lg" />
      </div>
    </div>
  );
}
