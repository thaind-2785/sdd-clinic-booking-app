'use client';

import React from 'react';
import type { AppointmentWithDetails } from '@/lib/types';
import Card from '@/components/ui/Card';

interface PatientInfoDisplayProps {
  appointment: AppointmentWithDetails;
}

export function PatientInfoDisplay({ appointment }: PatientInfoDisplayProps) {
  const patient = appointment.patient;
  const user = patient?.user;
  const timeSlot = appointment.time_slot;

  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Patient Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-base font-medium text-gray-900">
              {user?.name || 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium text-gray-900">
              {user?.email || 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-base font-medium text-gray-900">
              {patient?.phone || 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="text-base font-medium text-gray-900">
              {patient?.date_of_birth
                ? new Date(patient.date_of_birth).toLocaleDateString('vi-VN')
                : 'N/A'}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-gray-500">Medical Notes</p>
            <p className="text-base font-medium text-gray-900">
              {patient?.medical_notes || 'No medical notes'}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="mb-2 text-base font-semibold text-gray-900">
            Appointment Details
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(timeSlot.date).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="text-base font-medium text-gray-900">
                {timeSlot.start_time} - {timeSlot.end_time}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-gray-500">Reason for Visit</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.reason_for_visit}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Submitted At</p>
              <p className="text-base font-medium text-gray-900">
                {appointment.created_at
                  ? new Date(appointment.created_at).toLocaleString('vi-VN')
                  : 'N/A'}
              </p>
            </div>

            {appointment.approved_at && (
              <div>
                <p className="text-sm text-gray-500">Approved At</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(appointment.approved_at).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
