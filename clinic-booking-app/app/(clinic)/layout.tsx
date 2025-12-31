import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireRole="clinic_staff">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý phòng khám
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý lịch hẹn và thông tin phòng khám của bạn
          </p>
        </div>
        {children}
      </div>
    </ProtectedRoute>
  );
}
