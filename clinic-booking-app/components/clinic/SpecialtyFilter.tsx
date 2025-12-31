'use client';

import { useEffect, useState } from 'react';
import Select from '@/components/ui/Select';
import { MedicalSpecialty } from '@/lib/types';

interface SpecialtyFilterProps {
  value: string;
  onChange: (specialty: string) => void;
}

export default function SpecialtyFilter({
  value,
  onChange,
}: SpecialtyFilterProps) {
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpecialties() {
      try {
        const response = await fetch('/api/v1/specialties');
        const data = await response.json();
        setSpecialties(data.data || []);
      } catch (error) {
        console.error('Error fetching specialties:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSpecialties();
  }, []);

  const options = [
    { value: '', label: 'Tất cả chuyên khoa' },
    ...specialties.map((s) => ({ value: s.id, label: s.name })),
  ];

  if (loading) {
    return (
      <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200"></div>
    );
  }

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      label="Chuyên khoa"
    />
  );
}
