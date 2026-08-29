-- GabaySJNHS Add pin_code to Enrollment Officers
-- Allows IT Admin to view/reveal PIN on credential passes and copy for deployment

ALTER TABLE public.enrollment_officers 
ADD COLUMN IF NOT EXISTS pin_code TEXT;

COMMENT ON COLUMN public.enrollment_officers.pin_code IS 'Plaintext 6-digit PIN visible only to Admin for station pass management and fast-copying credentials';
