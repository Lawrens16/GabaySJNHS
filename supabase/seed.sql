-- GabaySJNHS Sample Seed Data for San Jose National High School

-- Sample UUIDs for testing
-- Admin: 00000000-0000-0000-0000-000000000001
-- LFO: 00000000-0000-0000-0000-000000000002
-- Counselor: 00000000-0000-0000-0000-000000000003

-- 1. Demo Staff Profiles
INSERT INTO public.profiles (id, email, full_name, role, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@sjnhs.edu.ph', 'Engr. Roberto Reyes (IT Admin)', 'admin', 'approved'),
  ('00000000-0000-0000-0000-000000000002', 'lfo@sjnhs.edu.ph', 'Mr. Danilo Torres (LFO Officer)', 'lfo', 'approved'),
  ('00000000-0000-0000-0000-000000000003', 'counselor@sjnhs.edu.ph', 'Ms. Clarissa Gomez (Head Counselor)', 'counselor', 'approved')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- 2. Demo Seasonal Enrollment Officers (PIN: 123456 -> bcrypt hash: $2a$10$wEeVnqy70L7jX8L2ZtQo9O8jYpS7Vn5K8I7Z6e6q6q6q6q6q6q6q6)
-- Note: Replace with actual bcrypt hash for testing PIN '123456'
INSERT INTO public.enrollment_officers (id, username, full_name, pin_hash, is_active, expires_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'eo_santos', 'Maria Santos (Station 1)', '$2a$10$w1qE1vR8gL5Z7xO8JpS7Vu9wK2I5Z6e6q6q6q6q6q6q6q6q6q6q6q', true, NOW() + INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222', 'eo_reyes', 'Carlos Reyes (Station 2)', '$2a$10$w1qE1vR8gL5Z7xO8JpS7Vu9wK2I5Z6e6q6q6q6q6q6q6q6q6q6q6q', true, NOW() + INTERVAL '30 days')
ON CONFLICT (username) DO NOTHING;

-- 3. Demo Students (Stubs and Completed Profiles)
INSERT INTO public.students (
  id, lrn, first_name, last_name, middle_name, gender, birthdate, grade_level, section,
  contact_number, guardian_name, guardian_contact, photo_url, profile_status,
  assigned_counselor_id, created_by_lfo_id, completed_by_counselor_id
)
VALUES
  -- Completed Student 1: Cleared for enrollment
  (
    '33333333-3333-3333-3333-333333333331',
    '109283746501',
    'Juan',
    'Dela Cruz',
    'Mercado',
    'Male',
    '2009-04-12',
    10,
    'Mabini',
    '09171234567',
    'Elena Dela Cruz',
    '09187654321',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    'complete',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
  ),
  -- Completed Student 2: Active Disciplinary Suspension (HOLD)
  (
    '33333333-3333-3333-3333-333333333332',
    '109283746502',
    'Angelo',
    'Bautista',
    'Castro',
    'Male',
    '2008-11-20',
    11,
    'Rizal',
    '09201239876',
    'Teresa Bautista',
    '09219876543',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    'complete',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
  ),
  -- Student 3: New Stub (Action Required for Counselor)
  (
    '33333333-3333-3333-3333-333333333333',
    NULL,
    'Kirsten Jane',
    'Villanueva',
    NULL,
    'Female',
    NULL,
    9,
    'Bonifacio',
    NULL,
    NULL,
    NULL,
    NULL,
    'stub',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Demo Disciplinary Record for Student 2
INSERT INTO public.disciplinary_records (
  id, student_id, lfo_id, incident_date, offense_category, offense_description,
  sanction_imposed, is_suspended, suspension_start_date, suspension_end_date, clearance_status
)
VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333332',
    '00000000-0000-0000-0000-000000000002',
    CURRENT_DATE - INTERVAL '3 days',
    'major',
    'Repeated campus physical altercation during intramurals.',
    '5-Day In-School Suspension and mandatory counseling evaluation.',
    true,
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '2 days',
    'pending'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Demo Counseling Session for Counselor Timetable (Scheduled for Today)
INSERT INTO public.counseling_sessions (
  id, student_id, counselor_id, scheduled_at, session_type, status, summary_notes
)
VALUES
  (
    '55555555-5555-5555-5555-555555555551',
    '33333333-3333-3333-3333-333333333331',
    '00000000-0000-0000-0000-000000000003',
    NOW() + INTERVAL '2 hours',
    'academic',
    'scheduled',
    'Routine semester check-in regarding academic progress in STEM electives.'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '33333333-3333-3333-3333-333333333332',
    '00000000-0000-0000-0000-000000000003',
    NOW() + INTERVAL '4 hours',
    'behavioral',
    'scheduled',
    'LFO referral follow-up intake regarding peer conflict resolution.'
  )
ON CONFLICT (id) DO NOTHING;
