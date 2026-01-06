import { AppointmentStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<AppointmentStatus, string> = {
    Pending: 'bg-warning/10 text-warning',
    Confirmed: 'bg-success/10 text-success',
    Rejected: 'bg-error/10 text-error',
  };

  const labels: Record<AppointmentStatus, string> = {
    Pending: 'Chờ xác nhận',
    Confirmed: 'Đã xác nhận',
    Rejected: 'Đã từ chối',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
