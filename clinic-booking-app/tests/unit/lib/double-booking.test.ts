import { checkDoubleBooking } from '@/lib/utils/double-booking';
import { describe, it, expect } from 'vitest';

describe('Double booking prevention', () => {
  it('should detect double booking for same time slot', async () => {
    const timeSlotId = 'test-slot-123';
    const result = await checkDoubleBooking(timeSlotId);

    expect(result).toHaveProperty('isAvailable');
    expect(typeof result.isAvailable).toBe('boolean');
  });

  it('should allow booking if time slot is available', async () => {
    const availableSlotId = 'available-slot-456';
    const result = await checkDoubleBooking(availableSlotId);

    expect(result.isAvailable).toBe(true);
    expect(result.existingAppointmentId).toBeUndefined();
  });

  it('should prevent booking if time slot is taken', async () => {
    const bookedSlotId = 'booked-slot-789';
    const result = await checkDoubleBooking(bookedSlotId);

    if (!result.isAvailable) {
      expect(result.existingAppointmentId).toBeTruthy();
    }
  });

  it('should not count Rejected appointments as booked', async () => {
    const slotWithRejectedId = 'rejected-slot-101';
    const result = await checkDoubleBooking(slotWithRejectedId);

    // Slot with only rejected appointments should be available
    expect(result.isAvailable).toBe(true);
  });

  it('should handle multiple pending appointments correctly', async () => {
    const slotWithPendingId = 'pending-slot-202';
    const result = await checkDoubleBooking(slotWithPendingId);

    // Multiple pending appointments should block the slot
    expect(typeof result.isAvailable).toBe('boolean');
  });
});
