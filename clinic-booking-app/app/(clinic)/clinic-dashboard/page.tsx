'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppointmentRequestCard } from '@/components/clinic/AppointmentRequestCard';
import Loading from '@/components/ui/Loading';
import { createClient } from '@/lib/supabase/client';
import type { AppointmentWithDetails, Clinic } from '@/lib/types';

type StatusFilter = 'all' | 'Pending' | 'Confirmed' | 'Rejected';

export default function ClinicDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(
    []
  );
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('Pending');
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Need clinic_id to fetch appointments
      if (!clinic?.id) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      let query = supabase
        .from('appointments')
        .select(
          `
          *,
          clinic:clinics(*),
          time_slot:time_slots(*),
          patient:patients(
            *,
            user:users(*)
          )
        `
        )
        .eq('clinic_id', clinic.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      // Cast data to proper type
      const appointmentsData = (data || []) as AppointmentWithDetails[];

      setAppointments(appointmentsData);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to fetch appointments'
      );
    } finally {
      setLoading(false);
    }
  }, [clinic?.id, filter]);

  // Fetch clinic information
  const fetchClinicInfo = useCallback(async () => {
    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get clinic_staff record to find clinic_id
      const { data: staffData } = await supabase
        .from('clinic_staff')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single();

      if (!staffData) return;

      // Get clinic details
      const { data: clinicData } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', staffData.clinic_id)
        .single();

      if (clinicData) {
        setClinic(clinicData);
      }
    } catch (error) {
      console.error('Error fetching clinic info:', error);
    }
  }, []);

  useEffect(() => {
    fetchClinicInfo();
    fetchAppointments();
  }, [fetchAppointments, fetchClinicInfo]);

  const handleAppointmentClick = (appointmentId: string) => {
    router.push(`/appointments/${appointmentId}`);
  };

  const pendingCount = appointments.filter(
    (a) => a.status === 'Pending'
  ).length;
  const confirmedCount = appointments.filter(
    (a) => a.status === 'Confirmed'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Clinic Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Clinic Dashboard</h1>
          {clinic ? (
            <div className="mt-4 rounded-lg bg-white p-6 shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {clinic.name}
                  </h2>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg
                        className="mr-2 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{clinic.address}</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="mr-2 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>{clinic.phone}</span>
                    </div>
                    {clinic.city && (
                      <div className="flex items-center">
                        <svg
                          className="mr-2 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span>{clinic.city}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      clinic.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {clinic.is_active ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
              </div>
              {clinic.description && (
                <p className="mt-4 text-sm text-gray-600">
                  {clinic.description}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-gray-600">
              Đang tải thông tin phòng khám...
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Pending Requests
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {pendingCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Confirmed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {confirmedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Appointments
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {appointments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 rounded-lg bg-white shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {(['Pending', 'Confirmed', 'Rejected', 'all'] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
                      filter === status
                        ? 'border-healthcare-primary text-healthcare-primary'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } `}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                )
              )}
            </nav>
          </div>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading fullScreen={false} />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchAppointments}
              className="mt-4 font-medium text-red-600 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No appointments
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No {filter !== 'all' ? filter.toLowerCase() : ''} appointments
              found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <AppointmentRequestCard
                key={appointment.id}
                appointment={appointment}
                onClick={() => handleAppointmentClick(appointment.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
