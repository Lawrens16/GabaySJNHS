# GabaySJNHS - Guidance Counseling & Disciplinary Management System
## Design Specification

**Date:** 2026-08-16  
**Status:** Approved  
**Platform:** Next.js (App Router), Supabase (PostgreSQL + Auth + Storage), Vercel  
**Target:** Mobile-First PWA & Desktop-Oriented Management System  
**Workspace Skills Compliance:** Enforcing guidelines from `.agents/skills/` (`vercel-react-best-practices`, `web-design-guidelines`, `vercel-optimize`)

---

## 1. System Overview & Core Objectives

GabaySJNHS is a specialized Progressive Web App (PWA) designed for public high schools to manage student guidance counseling, digitize physical handwritten counseling notes via OCR, manage student disciplinary infractions, and facilitate fast, secure identity and clearance verification during seasonal student enrollment.

### Key Architectural Tenets
1. **Zero-Cost Operation:** Built entirely within generous free tiers (Vercel Hobby, Supabase Free Tier, OCR.Space Free Tier).
2. **Aggressive Client-Side Optimization:** Images are compressed on the client device prior to transmission (<200KB for face portraits, <500KB for handwritten documents) to conserve Supabase Storage and easily clear OCR.Space's 1MB file payload limit.
3. **Strict Separation of Duties & Data Privacy:** PostgreSQL Row Level Security (RLS) guarantees that IT Admins, LFOs, and Enrollment Officers cannot view confidential counseling notes or psychological records.
4. **Immediate Mobile Utility:** Counselors immediately land on their daily scheduled timetable upon opening the app.

---

## 2. 4-Tier Role-Based Access Control (RBAC) & Authentication

### 2.1 Staff Google OAuth & Approval Queue
* **Engine:** Supabase Auth with Google OAuth (`auth.users`).
* **Trigger:** Postgres trigger `on_auth_user_created` creates a corresponding record in `public.profiles` with `status: 'pending'` and `role: NULL`.
* **Approval Flow:** Users with `pending` status are gated at `/approval-pending`. The System Admin reviews pending registrations in `/admin/approval-queue`, assigning either `admin`, `lfo`, or `counselor`. On approval, Supabase Realtime notifies the client and routes them to their dashboard.

### 2.2 Seasonal Enrollment Officer Custom PIN Authentication
* **Engine:** Custom credentials (system-generated Username + 6-digit numeric PIN).
* **Security:** 6-digit PIN is hashed using `bcrypt` and stored in `public.enrollment_officers`.
* **Session Lifecycle:** Successful login issues a signed JWT (`app_role: 'enrollment_officer'`) stored in an HTTP-Only, `SameSite=Strict`, `Secure` cookie (`eo_session`) with a hard **10-hour TTL** (36,000 seconds). No silent refresh tokens are issued—officers must re-authenticate daily.
* **Audit Trail:** Every student lookup by an officer is logged in `public.officer_access_logs`.

### 2.3 Permission & Data Access Matrix

| Feature / Resource | System Admin (IT) | Learner Formation Officer (LFO) | Guidance Counselor | Enrollment Officer (PIN) |
| :--- | :--- | :--- | :--- | :--- |
| **User Approvals & Roles (`profiles`)** | Full CRUD | Read approved staff | Read approved staff | No access |
| **Enrollment Officer Provisioning** | Full CRUD | No access | No access | Self-read (Auth only) |
| **Student Profiles (`students`)** | Read-Only (Auditing) | **Create Stubs** / Reassign | **Complete Profiles & Photos** (Assigned only) | **Read-Only** (Basic info + Photo) |
| **Disciplinary Records ("Bad Records")**| **No access (BLOCKED)** | **Exclusive CRUD** | **Read-Only** (Assigned students) | **Read-Only** (Clearance/Suspension) |
| **Counseling Sessions (`counseling_sessions`)** | **No access (BLOCKED)** | **No access (BLOCKED)** | **CRUD** (Assigned students only) | **No access (BLOCKED)** |
| **Counseling Notes & OCR Scans** | **No access (BLOCKED)** | **No access (BLOCKED)** | **CRUD** (Assigned students only) | **No access (BLOCKED)** |
| **Officer Audit Logs** | **Read-Only** | Read-Only | No access | **Insert-Only** (Auto-logged) |

---

## 3. Database Schema & Storage Architecture

### 3.1 PostgreSQL DDL (Supabase)

```sql
-- Custom Enums
CREATE TYPE user_role AS ENUM ('admin', 'lfo', 'counselor');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE profile_status AS ENUM ('stub', 'complete');
CREATE TYPE offense_category AS ENUM ('minor', 'major', 'grave');
CREATE TYPE clearance_status AS ENUM ('pending', 'served', 'cleared', 'non_compliant');
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE session_type AS ENUM ('intake', 'routine', 'behavioral', 'academic', 'crisis', 'follow_up');

-- 1. Profiles & Staff Accounts
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role,
    status user_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Seasonal Enrollment Officers
CREATE TABLE public.enrollment_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Students
CREATE TABLE public.students (
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
    assigned_counselor_id UUID REFERENCES public.profiles(id),
    created_by_lfo_id UUID REFERENCES public.profiles(id),
    completed_by_counselor_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Disciplinary Records ("Bad Records")
CREATE TABLE public.disciplinary_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    lfo_id UUID NOT NULL REFERENCES public.profiles(id),
    incident_date DATE NOT NULL,
    offense_category offense_category NOT NULL,
    offense_description TEXT NOT NULL,
    sanction_imposed TEXT NOT NULL,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    suspension_start_date DATE,
    suspension_end_date DATE,
    clearance_status clearance_status NOT NULL DEFAULT 'pending',
    cleared_at TIMESTAMPTZ,
    cleared_by_lfo_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Counseling Sessions
CREATE TABLE public.counseling_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES public.profiles(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    session_type session_type NOT NULL DEFAULT 'routine',
    status session_status NOT NULL DEFAULT 'scheduled',
    summary_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Digitized Counseling Notes & OCR Scans
CREATE TABLE public.counseling_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.counseling_sessions(id) ON DELETE SET NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    counselor_id UUID NOT NULL REFERENCES public.profiles(id),
    image_url TEXT NOT NULL,
    image_storage_path TEXT NOT NULL,
    ocr_raw_text TEXT NOT NULL,
    counselor_edited_text TEXT NOT NULL,
    accuracy_disclaimer_acknowledged BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Officer Access Audit Logs
CREATE TABLE public.officer_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL REFERENCES public.enrollment_officers(id),
    student_id UUID NOT NULL REFERENCES public.students(id),
    action TEXT NOT NULL DEFAULT 'view_student_for_enrollment',
    ip_address TEXT,
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.2 Supabase Storage Buckets
1. **`student-avatars` (Public/Authenticated Read):**
   * Stores compressed WebP student face portraits (`avatars/{student_id}.webp`).
   * Read permissions granted to all authenticated staff and enrollment officers.
2. **`counseling-documents` (Strictly Private):**
   * Stores original scanned handwritten note images (`notes/{student_id}/{note_id}.webp`).
   * Storage RLS strictly restricts read access to the specific assigned Guidance Counselor.

---

## 4. OCR Pipeline & Client Compression Architecture

### 4.1 Compression Rules (`browser-image-compression`)
* **Student Photos:** Max width 800px, Max size 0.2MB, WebP format.
* **Handwritten Notes:** Max width 1800px (preserves high stroke contrast), Max size 0.5MB, WebP format.

### 4.2 OCR Proxy Route (`/api/ocr`)
* Proxies requests to `https://api.ocr.space/parse/image`.
* Flags: `OCREngine=2` (Handwriting / unstructured text model), `scale=true`, `detectOrientation=true`.
* Never exposes `OCR_SPACE_API_KEY` to client.

### 4.3 Review & Disclaimer UX
* Displays side-by-side or stacked image preview + editable textarea.
* Prominent yellow alert: *"⚠️ Disclaimer: Automated OCR handwriting transcription may contain inaccuracies. Please review and edit before saving."*
* Saving uploads the compressed image to Supabase Storage and inserts the note into `public.counseling_notes`.

---

## 5. UI/UX Workflows & User Journeys

### 5.1 Guidance Counselor (Mobile PWA)
* **Landing Screen:** Daily Timetable showing today's scheduled sessions with time badges and student avatars.
* **Student Stub Completion:** Prompts counselor with an Action Required card. Opens native camera with face-framing guide, compresses image, captures LRN and guardian contact, and saves as `complete`.
* **Digitize Notes:** Camera scan -> Instant OCR -> Split-screen Review -> Save.

### 5.2 System Admin Dashboard
* **Approval Queue:** Live list of pending Google logins with one-click role assignment (`Admin`, `LFO`, `Counselor`).
* **Enrollment Officers:** Provision new username + 6-digit PIN, print/export station pass, or click emergency revoke.
* **Audit Log Viewer:** Real-time log of enrollment verification checks.

### 5.3 Learner Formation Officer (LFO)
* **Student Dispatcher:** Creates student stubs (Name + Assigned Counselor).
* **Disciplinary Hub:** Logs offenses, issues suspension dates, and resolves clearance status.

### 5.4 Enrollment Officer
* **Mobile / Station View:** Search bar (Name / LRN).
* **Clearance Screen:** Large photo verification + green/red clearance status badge (zero counseling data exposed).

---

## 6. Engineering Standards & Workspace Skills Compliance (`.agents/skills`)

All development in this repository must strictly adhere to the workspace-specific guidelines provided in `.agents/skills/`:

### 6.1 `vercel-react-best-practices`
* **Eliminating Waterfalls:** Use `Promise.all` for parallel data fetching in Server Components and API routes.
* **Bundle Size Optimization:** Direct module imports (no barrel file overhead) and dynamic lazy loading (`next/dynamic`) for heavy client components like `CameraCaptureModal` and `OCRScanReviewModal`.
* **Server-Side Performance:** Hoist static assets and avoid passing redundant serialized props between Server and Client Components.
* **Re-render Optimization:** Stable functional state updates, memoizing expensive visual transforms, and avoiding unnecessary context re-renders.

### 6.2 `web-design-guidelines`
* **Mobile PWA Accessibility:** Minimum 44x44px touch targets for buttons, camera triggers, and modal actions.
* **Color Contrast & Readability:** Strict WCAG 2.1 AA color contrast for warning disclaimers, clearance badges (clear red/green distinctions with text labels), and timetable cards.
* **Responsive Layouts:** Seamless fluid transitions between mobile-first portrait viewports and desktop administrative widescreen layouts.

### 6.3 `vercel-optimize`
* **Zero-Cost Compute:** Lightweight Serverless API routes with early exits, fast streaming responses where applicable, and optimal edge cache headers for public static assets.

