-- Simple seed data - Copy & paste vào SQL Editor của Supabase
-- Dashboard → SQL Editor → New Query → Paste → Run

-- 1. Insert specialties first
INSERT INTO specialties (name, description) VALUES
('Tim mạch', 'Chuyên khoa tim mạch, điều trị các bệnh về tim và mạch máu'),
('Nội khoa', 'Chuyên khoa nội tổng quát'),
('Nhi khoa', 'Chuyên khoa trẻ em')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert clinics
INSERT INTO clinics (name, address, city, phone, email, description, working_hours) VALUES
('Phòng khám Đa khoa ABC', '123 Nguyễn Huệ', 'Hồ Chí Minh', '02812345678', 'contact@abc.com', 'Phòng khám đa khoa chất lượng cao', '{"mon": "8:00-17:00", "tue": "8:00-17:00", "wed": "8:00-17:00", "thu": "8:00-17:00", "fri": "8:00-17:00", "sat": "8:00-12:00"}'),
('Bệnh viện Quốc tế Vinmec', '208 Nguyễn Hữu Cảnh, Phường 22', 'Hồ Chí Minh', '02838688888', 'contact@vinmec.com', 'Hệ thống bệnh viện đạt chuẩn quốc tế JCI với đội ngũ bác sĩ chuyên môn cao', '{"mon": "7:00-19:00", "tue": "7:00-19:00", "wed": "7:00-19:00", "thu": "7:00-19:00", "fri": "7:00-19:00", "sat": "7:00-17:00", "sun": "7:00-12:00"}'),
('Phòng khám Nhi đồng Hạnh Phúc', '456 Lê Văn Sỹ, Phường 14, Quận 3', 'Hồ Chí Minh', '02839251234', 'contact@happykids.com', 'Chuyên khoa nhi - Đội ngũ bác sĩ giàu kinh nghiệm trong điều trị bệnh nhi', '{"mon": "8:00-18:00", "tue": "8:00-18:00", "wed": "8:00-18:00", "thu": "8:00-18:00", "fri": "8:00-18:00", "sat": "8:00-16:00"}')
ON CONFLICT (name, city) DO NOTHING;

-- 3. Link clinics with specialties
INSERT INTO clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id 
FROM clinics c, specialties s 
WHERE c.email = 'contact@abc.com' 
  AND s.name IN ('Tim mạch', 'Nội khoa')
ON CONFLICT (clinic_id, specialty_id) DO NOTHING;

INSERT INTO clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id 
FROM clinics c, specialties s 
WHERE c.email = 'contact@vinmec.com' 
  AND s.name IN ('Tim mạch', 'Nội khoa', 'Nhi khoa')
ON CONFLICT (clinic_id, specialty_id) DO NOTHING;

INSERT INTO clinic_specialties (clinic_id, specialty_id)
SELECT c.id, s.id 
FROM clinics c, specialties s 
WHERE c.email = 'contact@happykids.com' 
  AND s.name = 'Nhi khoa'
ON CONFLICT (clinic_id, specialty_id) DO NOTHING;

-- 4. Insert time slots for tomorrow (all clinics)
INSERT INTO time_slots (clinic_id, date, start_time, end_time, is_available)
SELECT 
  c.id,
  CURRENT_DATE + INTERVAL '1 day',
  slot_time,
  slot_time + INTERVAL '1 hour',
  true
FROM clinics c,
UNNEST(ARRAY['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']::time[]) AS slot_time
WHERE c.email IN ('contact@abc.com', 'contact@vinmec.com', 'contact@happykids.com')
ON CONFLICT (clinic_id, date, start_time) DO NOTHING;

-- 5. Insert time slots for day after tomorrow (all clinics)
INSERT INTO time_slots (clinic_id, date, start_time, end_time, is_available)
SELECT 
  c.id,
  CURRENT_DATE + INTERVAL '2 days',
  slot_time,
  slot_time + INTERVAL '1 hour',
  true
FROM clinics c,
UNNEST(ARRAY['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']::time[]) AS slot_time
WHERE c.email IN ('contact@abc.com', 'contact@vinmec.com', 'contact@happykids.com')
ON CONFLICT (clinic_id, date, start_time) DO NOTHING;

-- 6. Insert time slots for 3 days later (all clinics)
INSERT INTO time_slots (clinic_id, date, start_time, end_time, is_available)
SELECT 
  c.id,
  CURRENT_DATE + INTERVAL '3 days',
  slot_time,
  slot_time + INTERVAL '1 hour',
  true
FROM clinics c,
UNNEST(ARRAY['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']::time[]) AS slot_time
WHERE c.email IN ('contact@abc.com', 'contact@vinmec.com', 'contact@happykids.com')
ON CONFLICT (clinic_id, date, start_time) DO NOTHING;

-- Done! Verify data:
SELECT 'Clinics' as table_name, COUNT(*) as count FROM clinics
UNION ALL
SELECT 'Specialties', COUNT(*) FROM specialties
UNION ALL
SELECT 'Time Slots', COUNT(*) FROM time_slots
UNION ALL
SELECT 'Clinic Specialties', COUNT(*) FROM clinic_specialties;
