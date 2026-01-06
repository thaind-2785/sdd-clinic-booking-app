import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

/**
 * Skeleton component for loading states
 * Provides visual placeholder while content is loading
 * Improves perceived performance and user experience
 */
export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
    card: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: i === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

/**
 * Pre-built skeleton for clinic card
 */
export function ClinicCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <Skeleton variant="rectangular" height={24} className="mb-4" />
      <Skeleton variant="text" lines={3} className="mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={80} height={24} />
        <Skeleton variant="rectangular" width={100} height={24} />
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for appointment card
 */
export function AppointmentCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-start justify-between">
        <Skeleton variant="rectangular" width={150} height={20} />
        <Skeleton variant="rectangular" width={80} height={24} />
      </div>
      <Skeleton variant="text" lines={2} className="mb-3" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={100} height={32} />
        <Skeleton variant="rectangular" width={100} height={32} />
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for user profile
 */
export function UserProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton
          variant="rectangular"
          width={120}
          height={16}
          className="mb-2"
        />
        <Skeleton variant="rectangular" width={180} height={14} />
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for table rows
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="rectangular" height={16} />
        </td>
      ))}
    </tr>
  );
}

/**
 * Pre-built skeleton for full page loading
 */
export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton
        variant="rectangular"
        width={300}
        height={32}
        className="mb-6"
      />
      <Skeleton variant="text" lines={2} className="mb-8 max-w-2xl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ClinicCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
