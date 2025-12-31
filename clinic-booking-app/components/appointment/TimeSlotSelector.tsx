'use client';

import { useEffect, useState } from 'react';
import { TimeSlot } from '@/lib/types';
import Loading from '@/components/ui/Loading';

interface TimeSlotSelectorProps {
  clinicId: string;
  selectedSlot: string | null;
  onSelect: (timeSlotId: string) => void;
}

export default function TimeSlotSelector({
  clinicId,
  selectedSlot,
  onSelect,
}: TimeSlotSelectorProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    async function fetchTimeSlots() {
      try {
        const response = await fetch(
          `/api/v1/time-slots?clinic_id=${clinicId}`
        );
        const data = await response.json();
        setTimeSlots(data.data || []);
      } catch (error) {
        console.error('Error fetching time slots:', error);
      } finally {
        setLoading(false);
      }
    }

    if (clinicId) {
      fetchTimeSlots();
    }
  }, [clinicId]);

  // Group slots by date
  const slotsByDate = timeSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    },
    {} as Record<string, TimeSlot[]>
  );

  const dates = Object.keys(slotsByDate).sort();

  if (loading) {
    return <Loading text="Đang tải lịch trống..." />;
  }

  if (timeSlots.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-600">
          Hiện tại không có lịch trống. Vui lòng quay lại sau.
        </p>
      </div>
    );
  }

  const displayDate = selectedDate || dates[0];
  const displaySlots = slotsByDate[displayDate] || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Chọn ngày khám
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => {
            const dateObj = new Date(date);
            const isSelected = date === displayDate;

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex min-w-[80px] flex-col items-center rounded-lg border-2 p-3 transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-white'
                    : 'hover:border-primary border-gray-200'
                }`}
              >
                <span className="text-xs font-medium">
                  {dateObj.toLocaleDateString('vi-VN', { weekday: 'short' })}
                </span>
                <span className="text-lg font-bold">{dateObj.getDate()}</span>
                <span className="text-xs">Tháng {dateObj.getMonth() + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Chọn giờ khám
        </label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {displaySlots.map((slot) => {
            const isSelected = slot.id === selectedSlot;

            return (
              <button
                key={slot.id}
                onClick={() => onSelect(slot.id)}
                className={`rounded-lg border-2 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-white'
                    : 'hover:border-primary hover:bg-primary/5 border-gray-200'
                }`}
              >
                {slot.start_time.slice(0, 5)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
