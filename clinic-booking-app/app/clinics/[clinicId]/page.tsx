'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ClinicWithSpecialties } from '@/lib/types';
import Loading from '@/components/ui/Loading';
import TimeSlotSelector from '@/components/appointment/TimeSlotSelector';
import AppointmentForm from '@/components/appointment/AppointmentForm';
import Card from '@/components/ui/Card';

export default function ClinicDetailPage() {
  const params = useParams();
  const clinicId = params.clinicId as string;

  const [clinic, setClinic] = useState<ClinicWithSpecialties | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClinic() {
      try {
        const response = await fetch(`/api/v1/clinics/${clinicId}`);
        if (!response.ok) throw new Error('Clinic not found');
        const data = await response.json();
        setClinic(data.data);
      } catch (error) {
        console.error('Error fetching clinic:', error);
      } finally {
        setLoading(false);
      }
    }

    if (clinicId) {
      fetchClinic();
    }
  }, [clinicId]);

  if (loading) {
    return <Loading fullScreen text="Đang tải thông tin phòng khám..." />;
  }

  if (!clinic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Không tìm thấy phòng khám
        </h1>
        <p className="mt-2 text-gray-600">
          Phòng khám này có thể đã bị xóa hoặc không tồn tại.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Clinic Info */}
        <div className="lg:col-span-2">
          <Card>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              {clinic.name}
            </h1>

            {/* Specialties */}
            {clinic.specialties && clinic.specialties.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-2 text-sm font-medium text-gray-700">
                  Chuyên khoa
                </h2>
                <div className="flex flex-wrap gap-2">
                  {clinic.specialties.map((specialty) => (
                    <span
                      key={specialty.id}
                      className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium"
                    >
                      {specialty.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {clinic.description && (
              <div className="mb-6">
                <h2 className="mb-2 text-sm font-medium text-gray-700">
                  Giới thiệu
                </h2>
                <p className="text-gray-600">{clinic.description}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
                <div>
                  <p className="text-sm font-medium text-gray-700">Địa chỉ</p>
                  <p className="text-gray-600">
                    {clinic.address}, {clinic.city}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Số điện thoại
                  </p>
                  <a
                    href={`tel:${clinic.phone}`}
                    className="text-primary hover:underline"
                  >
                    {clinic.phone}
                  </a>
                </div>
              </div>

              {clinic.email && (
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <a
                      href={`mailto:${clinic.email}`}
                      className="text-primary hover:underline"
                    >
                      {clinic.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Booking Section */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Đặt lịch khám
            </h2>

            <TimeSlotSelector
              clinicId={clinicId}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
            />

            {selectedSlot && (
              <div className="mt-6">
                <AppointmentForm
                  clinicId={clinicId}
                  timeSlotId={selectedSlot}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
