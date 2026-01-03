-- Check appointments for patient
SELECT 
  a.id,
  a.patient_id,
  a.time_slot_id,
  a.status,
  EXISTS(SELECT 1 FROM time_slots WHERE id = a.time_slot_id) as timeslot_exists
FROM appointments a
WHERE a.patient_id = '11c86415-dad9-4f03-bda5-f8ed4c6f40aa'
LIMIT 3;

-- Check time slots
SELECT id, clinic_id, date, start_time, is_available
FROM time_slots
WHERE id IN (
  SELECT time_slot_id FROM appointments WHERE patient_id = '11c86415-dad9-4f03-bda5-f8ed4c6f40aa'
)
LIMIT 3;
