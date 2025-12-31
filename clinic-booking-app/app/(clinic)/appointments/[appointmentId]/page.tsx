'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PatientInfoDisplay } from '@/components/clinic/PatientInfoDisplay';
import { AppointmentActions } from '@/components/clinic/AppointmentActions';
import StatusBadge from '@/components/appointment/StatusBadge';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import type { AppointmentWithDetails } from '@/lib/types';

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  const [appointment, setAppointment] = useState<AppointmentWithDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/appointments/${appointmentId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Appointment not found');
        }
        throw new Error('Failed to fetch appointment');
      }

      const data = await response.json();
      setAppointment(data.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch appointment'
      );
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  const handleActionComplete = () => {
    fetchAppointment();
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error || !appointment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error</h3>
            <p className="mt-2 text-sm text-gray-500">
              {error || 'Appointment not found'}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/clinic-dashboard')}
              className="mt-6"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => router.push('/clinic-dashboard')}
          >
            ← Back to Dashboard
          </Button>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Appointment Details
              </h1>
              <p className="mt-1 text-sm text-gray-500">ID: {appointment.id}</p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          {/* Patient Information */}
          <PatientInfoDisplay appointment={appointment} />

          {/* Actions */}
          {appointment.status === 'Pending' && (
            <div className="mt-6 border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Actions
              </h3>
              <AppointmentActions
                appointmentId={appointment.id}
                status={appointment.status}
                onActionComplete={handleActionComplete}
              />
            </div>
          )}

          {/* Additional Info for Confirmed */}
          {appointment.status === 'Confirmed' && appointment.approved_at && (
            <div className="mt-6 border-t pt-6">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Appointment Confirmed
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        This appointment was confirmed on{' '}
                        {new Date(appointment.approved_at).toLocaleString(
                          'vi-VN'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info for Rejected */}
          {appointment.status === 'Rejected' && (
            <div className="mt-6 border-t pt-6">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Appointment Rejected
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        This appointment has been rejected. The time slot has
                        been released.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
