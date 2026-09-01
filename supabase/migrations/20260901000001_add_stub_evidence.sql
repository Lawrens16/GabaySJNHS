-- Migration: Add stub evidence columns to students table
-- Run this in your Supabase project SQL Editor

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS stub_evidence_urls  TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS stub_evidence_notes TEXT;

COMMENT ON COLUMN public.students.stub_evidence_urls  IS 'Array of Storage URLs for guardian-signed documents or evidence photos attached at stub creation by LFO';
COMMENT ON COLUMN public.students.stub_evidence_notes IS 'Optional LFO notes describing the attached evidence context';
