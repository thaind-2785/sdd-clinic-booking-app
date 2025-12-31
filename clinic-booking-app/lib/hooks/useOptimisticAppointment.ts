import { useState, useOptimistic } from 'react';
import type { AppointmentWithDetails } from '@/lib/types';

type AppointmentAction =
  | { type: 'approve'; appointmentId: string }
  | { type: 'reject'; appointmentId: string };

/**
 * Custom hook for optimistic updates to appointment status
 * Provides instant UI feedback before server confirmation
 */
export function useOptimisticAppointment(
  initialAppointments: AppointmentWithDetails[]
) {
  const [appointments, setAppointments] = useState(initialAppointments);

  const [optimisticAppointments, updateOptimisticAppointments] = useOptimistic(
    appointments,
    (state: AppointmentWithDetails[], action: AppointmentAction) => {
      if (action.type === 'approve') {
        return state.map((apt) =>
          apt.id === action.appointmentId
            ? {
                ...apt,
                status: 'Confirmed' as const,
                approved_at: new Date().toISOString(),
              }
            : apt
        );
      }

      if (action.type === 'reject') {
        return state.map((apt) =>
          apt.id === action.appointmentId
            ? {
                ...apt,
                status: 'Rejected' as const,
              }
            : apt
        );
      }

      return state;
    }
  );

  const approveAppointment = async (appointmentId: string) => {
    // Optimistic update
    updateOptimisticAppointments({ type: 'approve', appointmentId });

    try {
      const response = await fetch(
        `/api/v1/appointments/${appointmentId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve appointment');
      }

      const data = await response.json();

      // Update with actual server response
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? data.data : apt))
      );

      return { success: true, data: data.data };
    } catch (error) {
      // Revert optimistic update on error
      setAppointments((prev) => prev);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve',
      };
    }
  };

  const rejectAppointment = async (
    appointmentId: string,
    rejectionReason: string
  ) => {
    // Optimistic update
    updateOptimisticAppointments({ type: 'reject', appointmentId });

    try {
      const response = await fetch(
        `/api/v1/appointments/${appointmentId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rejection_reason: rejectionReason }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject appointment');
      }

      const data = await response.json();

      // Update with actual server response
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? data.data : apt))
      );

      return { success: true, data: data.data };
    } catch (error) {
      // Revert optimistic update on error
      setAppointments((prev) => prev);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject',
      };
    }
  };

  return {
    appointments: optimisticAppointments,
    setAppointments,
    approveAppointment,
    rejectAppointment,
  };
}
