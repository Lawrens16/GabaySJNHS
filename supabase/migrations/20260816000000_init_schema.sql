-- GabaySJNHS Initial Schema Migration
-- San Jose National High School Guidance Counseling & Disciplinary Management

-- 1. Create Custom Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'lfo', 'counselor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE profile_status AS ENUM ('stub', 'complete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE offense_category AS ENUM ('minor', 'major', 'grave');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE clearance_status AS ENUM ('pending', 'served', 'cleared', 'non_compliant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_type AS ENUM ('intake', 'routine', 'behavioral', 'academic', 'crisis', 'follow_up');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Staff Profiles (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role, -- NULL when status is 'pending'
    status user_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Seasonal Enrollment Officers (Custom 6-digit PIN Accounts)
CREATE TABLE IF NOT EXISTS public.enrollment_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Students Table (Lifecycle: Stub -> Complete)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lrn VARCHAR(12) UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    gender TEXT,
    birthdate DATE,
    grade_level INT,
    section TEXT,
    contact_number TEXT,
    guardian_name TEXT,
    guardian_contact TEXT,
    photo_url TEXT,
    photo_storage_path TEXT,
    profile_status profile_status NOT NULL DEFAULT 'stub',
    assigned_counselor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by_lfo_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    completed_by_counselor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Disciplinary Records ("Bad Records" - LFO Exclusive CRUD)
CREATE TABLE IF NOT EXISTS public.disciplinary_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    lfo_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
    offense_category offense_category NOT NULL DEFAULT 'minor',
    offense_description TEXT NOT NULL,
    sanction_imposed TEXT NOT NULL,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    suspension_start_date DATE,
    suspension_end_date DATE,
    clearance_status clearance_status NOT NULL DEFAULT 'pending',
    cleared_at TIMESTAMPTZ,
    cleared_by_lfo_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Counseling Sessions & Timetable
CREATE TABLE IF NOT EXISTS public.counseling_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    session_type session_type NOT NULL DEFAULT 'routine',
    status session_status NOT NULL DEFAULT 'scheduled',
    summary_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Digitized Counseling Notes & OCR Scans (Strictly Confidential)
CREATE TABLE IF NOT EXISTS public.counseling_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.counseling_sessions(id) ON DELETE SET NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_storage_path TEXT NOT NULL,
    ocr_raw_text TEXT NOT NULL,
    counselor_edited_text TEXT NOT NULL,
    accuracy_disclaimer_acknowledged BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Officer Access Audit Logs
CREATE TABLE IF NOT EXISTS public.officer_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL REFERENCES public.enrollment_officers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    action TEXT NOT NULL DEFAULT 'view_student_for_enrollment',
    ip_address TEXT,
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Automatic Profile Creation Trigger on Google OAuth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, status, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Staff Member'),
    NEW.raw_user_meta_data->>'avatar_url',
    'pending',
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_students_assigned_counselor ON public.students(assigned_counselor_id);
CREATE INDEX IF NOT EXISTS idx_students_lrn ON public.students(lrn);
CREATE INDEX IF NOT EXISTS idx_students_profile_status ON public.students(profile_status);
CREATE INDEX IF NOT EXISTS idx_sessions_counselor_date ON public.counseling_sessions(counselor_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notes_student_id ON public.counseling_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_disciplinary_student_id ON public.disciplinary_records(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_officer_id ON public.officer_access_logs(officer_id);

-- 11. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_access_logs ENABLE ROW LEVEL SECURITY;
