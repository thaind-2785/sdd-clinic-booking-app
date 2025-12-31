'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/appointment/StatusBadge';
import type { AppointmentWithDetails } from '@/lib/types';

interface AppointmentRequestCardProps {
  appointment: AppointmentWithDetails;
  onClick?: () => void;
}

export function AppointmentRequestCard({
  appointment,
  onClick,
}: AppointmentRequestCardProps) {
  const patient = appointment.patient;
  const user = patient?.user;
  const timeSlot = appointment.time_slot;
  console.log('appointment', appointment);
  const appointmentDate = new Date(timeSlot.date);
  const now = new Date();
  const isPast = appointmentDate < now;

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-shadow duration-200 hover:shadow-lg"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {user?.name || 'Unknown Patient'}
          </h3>
          <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm">
          <svg
            className="mr-2 h-4 w-4 text-gray-400"
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
          <span className="text-gray-700">
            {appointmentDate.toLocaleDateString('vi-VN', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {isPast && <span className="ml-2 text-xs text-red-500">(Past)</span>}
        </div>

        <div className="flex items-center text-sm">
          <svg
            className="mr-2 h-4 w-4 text-gray-400"
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
          <span className="text-gray-700">
            {timeSlot.start_time} - {timeSlot.end_time}
          </span>
        </div>

        <div className="flex items-center text-sm">
          <svg
            className="mr-2 h-4 w-4 text-gray-400"
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
          <span className="text-gray-700">{patient?.phone || 'No phone'}</span>
        </div>

        <div className="mt-3 border-t border-gray-200 pt-3">
          <p className="text-sm text-gray-500">Reason for visit:</p>
          <p className="line-clamp-2 text-sm text-gray-700">
            {appointment.reason_for_visit}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>
            Submitted:{' '}
            {appointment.created_at
              ? new Date(appointment.created_at).toLocaleDateString('vi-VN')
              : 'N/A'}
          </span>
          {appointment.approved_at && (
            <span>
              Approved:{' '}
              {new Date(appointment.approved_at).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
