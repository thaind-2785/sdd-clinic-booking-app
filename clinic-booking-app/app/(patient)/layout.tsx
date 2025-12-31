import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireRole="patient">
      <div className="mx-auto max-w-7xl">{children}</div>
    </ProtectedRoute>
  );
}
