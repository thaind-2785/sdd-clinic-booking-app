'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAppointmentSchema } from '@/lib/validations/appointment';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface AppointmentFormProps {
  clinicId: string;
  timeSlotId: string;
}

export default function AppointmentForm({
  clinicId,
  timeSlotId,
}: AppointmentFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    const validation = createAppointmentSchema.safeParse({
      clinic_id: clinicId,
      time_slot_id: timeSlotId,
      reason_for_visit: reason,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create appointment');
      }

      showToast('Đặt lịch thành công! Chờ phòng khám xác nhận.', 'success');
      router.push('/patient-dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="reason"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Lý do khám <span className="text-error">*</span>
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-offset-1 focus:outline-none"
          placeholder="Mô tả triệu chứng hoặc lý do bạn cần khám (tối thiểu 10 ký tự)"
          required
          minLength={10}
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500">{reason.length}/500 ký tự</p>
      </div>

      {error && (
        <div className="bg-error/10 text-error rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button type="submit" loading={loading} fullWidth>
          Đặt lịch khám
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        Sau khi đặt lịch, phòng khám sẽ xem xét và xác nhận. Bạn sẽ nhận được
        thông báo qua email.
      </p>
    </form>
  );
}
