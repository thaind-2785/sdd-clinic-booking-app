/**
 * Validate if a time slot is available for booking
 */
export interface TimeSlotValidation {
  valid: boolean;
  error?: string;
}

/**
 * Validate time slot for appointment booking
 */
export function validateTimeSlot(
  date: string,
  startTime: string,
  endTime: string
): TimeSlotValidation {
  // Check if date is in the past
  const slotDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (slotDate < today) {
    return {
      valid: false,
      error: 'Không thể đặt lịch trong quá khứ',
    };
  }

  // Check if start time is before end time
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (startMinutes >= endMinutes) {
    return {
      valid: false,
      error: 'Giờ bắt đầu phải trước giờ kết thúc',
    };
  }

  // Check if duration is at least 15 minutes
  const duration = endMinutes - startMinutes;
  if (duration < 15) {
    return {
      valid: false,
      error: 'Thời gian khám tối thiểu 15 phút',
    };
  }

  return { valid: true };
}

/**
 * Check if a time slot is in the future (at least 1 hour from now)
 */
export function isTimeSlotBookable(date: string, startTime: string): boolean {
  const [hour, minute] = startTime.split(':').map(Number);
  const slotDateTime = new Date(date);
  slotDateTime.setHours(hour, minute, 0, 0);

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  return slotDateTime > oneHourLater;
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(startTime: string, endTime: string): string {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

/**
 * Format date for display in Vietnamese
 */
export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
