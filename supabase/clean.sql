-- =========================================================
-- GabaySJNHS - Clean / Reset Database Script
-- Run this in Supabase SQL Editor to wipe all dummy data
-- while keeping table structures, triggers, and RLS policies.
-- =========================================================

-- Disable foreign key constraints temporarily / cascade truncate
TRUNCATE TABLE 
    public.officer_access_logs,
    public.counseling_notes,
    public.counseling_sessions,
    public.disciplinary_records,
    public.students,
    public.enrollment_officers,
    public.profiles
CASCADE;
