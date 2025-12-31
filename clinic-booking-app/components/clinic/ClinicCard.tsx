import Link from 'next/link';
import Card from '@/components/ui/Card';
import { ClinicWithSpecialties } from '@/lib/types';

interface ClinicCardProps {
  clinic: ClinicWithSpecialties;
}

export default function ClinicCard({ clinic }: ClinicCardProps) {
  return (
    <Link href={`/clinics/${clinic.id}`}>
      <Card hover className="h-full">
        <div className="space-y-3">
          {/* Clinic Name */}
          <h3 className="text-lg font-semibold text-gray-900">{clinic.name}</h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>
              {clinic.city} • {clinic.address}
            </span>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>{clinic.phone}</span>
          </div>

          {/* Specialties */}
          {clinic.specialties && clinic.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {clinic.specialties.slice(0, 3).map((specialty) => (
                <span
                  key={specialty.id}
                  className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
                >
                  {specialty.name}
                </span>
              ))}
              {clinic.specialties.length > 3 && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  +{clinic.specialties.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {clinic.description && (
            <p className="line-clamp-2 text-sm text-gray-600">
              {clinic.description}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
