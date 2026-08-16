-- GabaySJNHS Row Level Security (RLS) Policies
-- Strict Privacy Partitioning & 4-Tier Access Control

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_access_logs ENABLE ROW LEVEL SECURITY;

-- 2. Security Helper Functions
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Check for Enrollment Officer custom session JWT claim
  IF (auth.jwt() ->> 'app_role') = 'enrollment_officer' THEN
    RETURN 'enrollment_officer';
  END IF;

  -- Resolve approved role from profiles
  SELECT role::TEXT INTO v_role
  FROM public.profiles
  WHERE id = auth.uid() AND status = 'approved';
  
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT public.get_current_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_lfo() RETURNS BOOLEAN AS $$
  SELECT public.get_current_role() = 'lfo';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_counselor() RETURNS BOOLEAN AS $$
  SELECT public.get_current_role() = 'counselor';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_enrollment_officer() RETURNS BOOLEAN AS $$
  SELECT public.get_current_role() = 'enrollment_officer';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. PROFILES TABLE POLICIES
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Approved staff can view colleagues"
ON public.profiles FOR SELECT
USING (public.get_current_role() IN ('admin', 'lfo', 'counselor'));

CREATE POLICY "Admin can update profiles and assign roles"
ON public.profiles FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. ENROLLMENT OFFICERS TABLE POLICIES (Admin Only)
CREATE POLICY "Admin full access to enrollment officers"
ON public.enrollment_officers FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. STUDENTS TABLE POLICIES
CREATE POLICY "Admin and LFO can view all students"
ON public.students FOR SELECT
USING (public.get_current_role() IN ('admin', 'lfo'));

CREATE POLICY "LFO can insert student stubs"
ON public.students FOR INSERT
WITH CHECK (public.is_lfo() OR public.is_admin());

CREATE POLICY "LFO can update student stubs and assignments"
ON public.students FOR UPDATE
USING (public.is_lfo() OR public.is_admin())
WITH CHECK (public.is_lfo() OR public.is_admin());

CREATE POLICY "Counselor can view assigned students"
ON public.students FOR SELECT
USING (
  public.is_counselor() AND assigned_counselor_id = auth.uid()
);

CREATE POLICY "Counselor can update assigned student profiles"
ON public.students FOR UPDATE
USING (
  public.is_counselor() AND assigned_counselor_id = auth.uid()
)
WITH CHECK (
  public.is_counselor() AND assigned_counselor_id = auth.uid()
);

CREATE POLICY "Enrollment Officer can view students"
ON public.students FOR SELECT
USING (public.is_enrollment_officer());

-- 6. DISCIPLINARY RECORDS POLICIES ("Bad Records")
-- LFO has Exclusive CRUD. Counselors & Officers have Read-Only. Admin is BLOCKED.
CREATE POLICY "LFO exclusive CRUD for disciplinary records"
ON public.disciplinary_records FOR ALL
USING (public.is_lfo())
WITH CHECK (public.is_lfo());

CREATE POLICY "Counselor can read disciplinary for assigned students"
ON public.disciplinary_records FOR SELECT
USING (
  public.is_counselor() AND EXISTS (
    SELECT 1 FROM public.students
    WHERE students.id = disciplinary_records.student_id
    AND students.assigned_counselor_id = auth.uid()
  )
);

CREATE POLICY "Enrollment Officer can read disciplinary records"
ON public.disciplinary_records FOR SELECT
USING (public.is_enrollment_officer());

-- 7. COUNSELING SESSIONS POLICIES
-- Strictly restricted to the assigned Guidance Counselor. Admin, LFO, Officer = BLOCKED.
CREATE POLICY "Counselor exclusive access to counseling sessions"
ON public.counseling_sessions FOR ALL
USING (
  public.is_counselor() AND counselor_id = auth.uid()
)
WITH CHECK (
  public.is_counselor() AND counselor_id = auth.uid()
);

-- 8. COUNSELING NOTES & OCR TRANSCRIPTS POLICIES
-- Strictly restricted to the specific Guidance Counselor. Admin, LFO, Officer = BLOCKED.
CREATE POLICY "Counselor exclusive access to counseling notes"
ON public.counseling_notes FOR ALL
USING (
  public.is_counselor() AND counselor_id = auth.uid()
)
WITH CHECK (
  public.is_counselor() AND counselor_id = auth.uid()
);

-- 9. OFFICER ACCESS AUDIT LOGS POLICIES
CREATE POLICY "Officers can insert audit logs"
ON public.officer_access_logs FOR INSERT
WITH CHECK (public.is_enrollment_officer());

CREATE POLICY "Admin and LFO can view audit logs"
ON public.officer_access_logs FOR SELECT
USING (public.get_current_role() IN ('admin', 'lfo'));

-- 10. SUPABASE STORAGE BUCKETS CONFIGURATION
-- Buckets: 'student-avatars' and 'counseling-documents'
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('student-avatars', 'student-avatars', true),
  ('counseling-documents', 'counseling-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Avatars publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-avatars');

CREATE POLICY "Counselors can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-avatars' AND 
  (public.is_counselor() OR public.is_admin())
);

CREATE POLICY "Only assigned counselor can access counseling documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'counseling-documents' AND
  public.is_counselor() AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'counseling-documents' AND
  public.is_counselor() AND
  (storage.foldername(name))[1] = auth.uid()::text
);
