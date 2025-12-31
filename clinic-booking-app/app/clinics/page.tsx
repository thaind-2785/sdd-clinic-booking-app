'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SpecialtyFilter from '@/components/clinic/SpecialtyFilter';
import ClinicList from '@/components/clinic/ClinicList';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ClinicWithSpecialties } from '@/lib/types';

const CITIES = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Nha Trang',
  'Huế',
  'Vũng Tàu',
];

export default function ClinicsPage() {
  const searchParams = useSearchParams();
  const [clinics, setClinics] = useState<ClinicWithSpecialties[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Filters
  const [specialty, setSpecialty] = useState(
    searchParams.get('specialty') || ''
  );
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const fetchClinics = React.useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (specialty) params.set('specialty', specialty);
      if (city) params.set('city', city);
      if (search) params.set('search', search);
      params.set('limit', '12');
      params.set('offset', offset.toString());

      const response = await fetch(`/api/v1/clinics?${params.toString()}`);
      const result = await response.json();

      if (offset === 0) {
        setClinics(result.data || []);
      } else {
        setClinics((prev) => [...prev, ...(result.data || [])]);
      }

      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  }, [specialty, city, search, offset]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const handleReset = () => {
    setSpecialty('');
    setCity('');
    setSearch('');
    setOffset(0);
  };

  const handleLoadMore = () => {
    setOffset((prev) => prev + 12);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Tìm kiếm phòng khám
      </h1>

      {/* Filters */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Input
            type="text"
            label="Tìm theo tên"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
            placeholder="Nhập tên phòng khám..."
          />

          <SpecialtyFilter
            value={specialty}
            onChange={(value) => {
              setSpecialty(value);
              setOffset(0);
            }}
          />

          <Select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setOffset(0);
            }}
            options={[
              { value: '', label: 'Tất cả thành phố' },
              ...CITIES.map((c) => ({ value: c, label: c })),
            ]}
            label="Thành phố"
          />

          <div className="flex items-end">
            <Button variant="outline" onClick={handleReset} fullWidth>
              Đặt lại bộ lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <ClinicList clinics={clinics} loading={loading && offset === 0} />

      {/* Load More */}
      {hasMore && !loading && (
        <div className="mt-8 text-center">
          <Button onClick={handleLoadMore}>Xem thêm</Button>
        </div>
      )}

      {loading && offset > 0 && (
        <div className="mt-8 text-center text-gray-500">Đang tải...</div>
      )}
    </div>
  );
}
