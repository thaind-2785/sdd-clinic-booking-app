'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { AppointmentWithDetails } from '@/lib/types';
import AppointmentList from '@/components/appointment/AppointmentList';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Confirmed'>('all');
  const fetchAppointments = React.useCallback(async () => {
    if (!user) return setLoading(false);

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);

      const response = await fetch(`/api/v1/appointments?${params.toString()}`);
      const data = await response.json();
      setAppointments(data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lịch hẹn của tôi</h1>
          <p className="mt-1 text-gray-600">Quản lý các lịch khám của bạn</p>
        </div>
        <Button onClick={() => router.push('/clinics')}>Đặt lịch mới</Button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('Pending')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'Pending'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Chờ xác nhận
        </button>
        <button
          onClick={() => setFilter('Confirmed')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'Confirmed'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Đã xác nhận
        </button>
      </div>

      {/* Appointments List */}
      <AppointmentList appointments={appointments} loading={loading} />
    </div>
  );
}
