'use client';

import { useEffect, useState, useRef, KeyboardEvent } from 'react';
import { TimeSlot } from '@/lib/types';
import Loading from '@/components/ui/Loading';

interface TimeSlotSelectorProps {
  clinicId: string;
  selectedSlot: string | null;
  onSelect: (timeSlotId: string) => void;
  onError?: (message: string) => void;
}

export default function TimeSlotSelector({
  clinicId,
  selectedSlot,
  onSelect,
  onError,
}: TimeSlotSelectorProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string>('');
  const dateButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const slotButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    async function fetchTimeSlots() {
      try {
        setError('');
        const response = await fetch(
          `/api/v1/time-slots?clinic_id=${clinicId}`
        );

        if (!response.ok) {
          throw new Error('Không thể tải lịch khám');
        }

        const data = await response.json();
        const slots = data.data || [];

        if (slots.length === 0) {
          const errorMsg = 'Hiện tại không có lịch trống';
          setError(errorMsg);
          onError?.(errorMsg);
        }

        setTimeSlots(slots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        const errorMsg = 'Có lỗi xảy ra khi tải lịch khám. Vui lòng thử lại.';
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    if (clinicId) {
      fetchTimeSlots();
    }
  }, [clinicId, onError]);

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

  // Keyboard navigation handlers
  const handleDateKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = Math.max(0, index - 1);
        dateButtonsRef.current[prevIndex]?.focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = Math.min(dates.length - 1, index + 1);
        dateButtonsRef.current[nextIndex]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        dateButtonsRef.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        dateButtonsRef.current[dates.length - 1]?.focus();
        break;
    }
  };

  const handleSlotKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    index: number,
    totalSlots: number
  ) => {
    const cols = 5; // Number of columns in grid

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        const prevSlot = Math.max(0, index - 1);
        slotButtonsRef.current[prevSlot]?.focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        const nextSlot = Math.min(totalSlots - 1, index + 1);
        slotButtonsRef.current[nextSlot]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const upSlot = Math.max(0, index - cols);
        slotButtonsRef.current[upSlot]?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        const downSlot = Math.min(totalSlots - 1, index + cols);
        slotButtonsRef.current[downSlot]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        slotButtonsRef.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        slotButtonsRef.current[totalSlots - 1]?.focus();
        break;
    }
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-label="Đang tải lịch khám">
        <Loading text="Đang tải lịch trống..." />
      </div>
    );
  }

  if (error || timeSlots.length === 0) {
    return (
      <div
        className="rounded-lg border border-gray-200 p-6 text-center"
        role="alert"
        aria-live="polite"
      >
        <p className="text-gray-600">
          {error || 'Hiện tại không có lịch trống. Vui lòng quay lại sau.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary mt-4 hover:underline"
          aria-label="Tải lại trang"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const displayDate = selectedDate || dates[0];
  const displaySlots = slotsByDate[displayDate] || [];

  return (
    <div className="space-y-4">
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          id="date-selector-label"
        >
          Chọn ngày khám
        </label>
        <div
          className="flex gap-2 overflow-x-auto pb-2"
          role="radiogroup"
          aria-labelledby="date-selector-label"
          aria-describedby="date-selector-help"
        >
          {dates.map((date, index) => {
            const dateObj = new Date(date);
            const isSelected = date === displayDate;

            return (
              <button
                key={date}
                ref={(el) => {
                  dateButtonsRef.current[index] = el;
                }}
                onClick={() => setSelectedDate(date)}
                onKeyDown={(e) => handleDateKeyDown(e, index)}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${dateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}`}
                tabIndex={isSelected ? 0 : -1}
                className={`focus:ring-primary flex min-w-20 flex-col items-center rounded-lg border-2 p-3 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${
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
        <p id="date-selector-help" className="sr-only">
          Sử dụng phím mũi tên trái/phải để điều hướng giữa các ngày. Nhấn Home
          để đến ngày đầu tiên, End để đến ngày cuối cùng.
        </p>
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          id="slot-selector-label"
        >
          Chọn giờ khám
        </label>
        <div
          className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5"
          role="radiogroup"
          aria-labelledby="slot-selector-label"
          aria-describedby="slot-selector-help"
        >
          {displaySlots.map((slot, index) => {
            const isSelected = slot.id === selectedSlot;

            return (
              <button
                key={slot.id}
                ref={(el) => {
                  slotButtonsRef.current[index] = el;
                }}
                onClick={() => onSelect(slot.id)}
                onKeyDown={(e) =>
                  handleSlotKeyDown(e, index, displaySlots.length)
                }
                role="radio"
                aria-checked={isSelected}
                aria-label={`${slot.start_time.slice(0, 5)}`}
                tabIndex={isSelected ? 0 : -1}
                className={`focus:ring-primary rounded-lg border-2 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${
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
        <p id="slot-selector-help" className="sr-only">
          Sử dụng phím mũi tên để điều hướng giữa các giờ khám. Nhấn Home để đến
          giờ đầu tiên, End để đến giờ cuối cùng.
        </p>
      </div>
    </div>
  );
}
