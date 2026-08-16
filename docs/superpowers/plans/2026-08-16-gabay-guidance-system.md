# GabaySJNHS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-cost, high-security, mobile-first Progressive Web App (PWA) Guidance Counseling & Disciplinary Management System for San Jose National High School with 4-tier RBAC, Google OAuth approval queue, seasonal 6-digit PIN officer auth with 10-hour cookies, client-side image compression, and OCR handwritten note digitization.

**Architecture:** Next.js 15+ App Router, Supabase (PostgreSQL with RLS + Auth + Storage), Client-Side Image Compression (`browser-image-compression`), Server-Side OCR Proxy (`OCR.Space` API Engine 2), and PWA Manifest/Service Worker.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS / Vanilla CSS design tokens, Lucide Icons, Supabase JS Client, `jose` / `bcryptjs`, `browser-image-compression`.

**Spec:** `docs/superpowers/specs/2026-08-16-gabay-guidance-system-design.md`

## Global Constraints
- Target 100% Zero-Cost Architecture (Supabase Free Tier, Vercel Hobby, OCR.Space Free Tier).
- All image uploads must undergo client-side compression (<200KB for avatars, <500KB for OCR documents).
- IT Admin, LFO, and Enrollment Officers have strict 0% access to `counseling_notes` and `counseling_sessions`.
- Enrollment Officer sessions must strictly expire after 10 hours via HTTP-only cookie.
- Every commit on branch `dev` must adhere to concise `caveman-commit` standards.

---

### Task 1: Next.js Project Scaffolding, PWA Configuration & Design System

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`
- Create: `public/manifest.json`, `public/sw.js`, `public/icons/*`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Create: `src/types/database.types.ts`

**Interfaces:**
- Produces: Initialized Next.js 15 App Router app with PWA support, Tailwind CSS tokens, and TypeScript configuration.

- [ ] **Step 1: Initialize Next.js project with App Router, TypeScript, and Tailwind CSS**
- [ ] **Step 2: Add PWA Manifest (`public/manifest.json`) and service worker registration**
- [ ] **Step 3: Setup theme variables in `src/app/globals.css` (primary, accents, responsive layouts)**
- [ ] **Step 4: Verify dev server runs cleanly**
- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "chore(app): scaffold nextjs pwa with design tokens"
```

---

### Task 2: Database Migration Scripts & Supabase RLS Policies

**Files:**
- Create: `supabase/migrations/20260816000000_init_schema.sql`
- Create: `supabase/migrations/20260816000001_rls_policies.sql`
- Create: `supabase/seed.sql`

**Interfaces:**
- Produces: Complete PostgreSQL DDL, Triggers, RLS Policies, and Seed data for all 4 roles.

- [ ] **Step 1: Write DDL for `profiles`, `enrollment_officers`, `students`, `disciplinary_records`, `counseling_sessions`, `counseling_notes`, `officer_access_logs`**
- [ ] **Step 2: Write trigger `on_auth_user_created` for auto-bootstrapping pending profiles**
- [ ] **Step 3: Write Row Level Security policies with strict privacy partitioning**
- [ ] **Step 4: Write seed dataset with sample stubs, disciplinary records, and staff test profiles**
- [ ] **Step 5: Commit**
```bash
git add supabase/
git commit -m "feat(db): add postgres schema triggers and rls policies"
```

---

### Task 3: Supabase Client Utilities & Auth Middleware Gate

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/approval-pending/page.tsx`
- Create: `src/app/(auth)/access-denied/page.tsx`

**Interfaces:**
- Consumes: Supabase project credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Produces: Multi-role route protection middleware routing Google OAuth users to their appropriate dashboards based on `profiles.status` and `profiles.role`.

- [ ] **Step 1: Create browser, server, and middleware Supabase client factories**
- [ ] **Step 2: Create Google OAuth login UI at `/login` with school branding**
- [ ] **Step 3: Create `/approval-pending` screen with live Supabase Realtime listener**
- [ ] **Step 4: Implement `src/middleware.ts` to enforce RBAC and route pending users**
- [ ] **Step 5: Commit**
```bash
git add src/lib/supabase src/middleware.ts src/app/(auth)
git commit -m "feat(auth): add google oauth flow and rbac route guard"
```

---

### Task 4: Seasonal Enrollment Officer Auth & 10-Hour Session Engine

**Files:**
- Create: `src/lib/auth/officer-jwt.ts`
- Create: `src/app/api/auth/officer-login/route.ts`
- Create: `src/app/api/auth/officer-logout/route.ts`
- Create: `src/app/(auth)/officer/login/page.tsx`

**Interfaces:**
- Consumes: `public.enrollment_officers` table
- Produces: 6-digit PIN verification, `eo_session` 10-hour cookie issuance, and officer session validation.

- [ ] **Step 1: Implement JWT signing and verification utility with `jose` for 10-hour TTL**
- [ ] **Step 2: Create POST `/api/auth/officer-login` (validates username, compares PIN hash, sets cookie)**
- [ ] **Step 3: Create POST `/api/auth/officer-logout` (clears cookie)**
- [ ] **Step 4: Build mobile-optimized numeric keypad / PIN login screen at `/officer/login`**
- [ ] **Step 5: Update `middleware.ts` to enforce 10-hour officer session checks**
- [ ] **Step 6: Commit**
```bash
git add src/lib/auth src/app/api/auth src/app/(auth)/officer
git commit -m "feat(auth): add officer 6-digit pin login with 10h cookie"
```

---

### Task 5: Client-Side Image Compression & OCR.Space API Proxy

**Files:**
- Create: `src/lib/image-compression.ts`
- Create: `src/app/api/ocr/route.ts`
- Create: `src/components/camera/CameraCaptureModal.tsx`
- Create: `src/components/ocr/OCRScanReviewModal.tsx`

**Interfaces:**
- Consumes: Native camera stream or file input, `OCR_SPACE_API_KEY`
- Produces: Compressed WebP images (<200KB avatar, <500KB note) and OCR text extraction route.

- [ ] **Step 1: Install `browser-image-compression` and create compression helpers**
- [ ] **Step 2: Build `/api/ocr` route proxying to OCR.Space API Engine 2 for handwriting**
- [ ] **Step 3: Build `CameraCaptureModal` with face portrait guide and document framing guide**
- [ ] **Step 4: Build `OCRScanReviewModal` with side-by-side preview, handwriting disclaimer, and editable text**
- [ ] **Step 5: Commit**
```bash
git add src/lib/image-compression.ts src/app/api/ocr src/components
git commit -m "feat(ocr): add client compression and ocr review pipeline"
```

---

### Task 6: System Admin Management Dashboard

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/approval-queue/page.tsx`
- Create: `src/app/admin/enrollment-officers/page.tsx`
- Create: `src/app/admin/audit-logs/page.tsx`
- Create: `src/components/admin/OfficerProvisionModal.tsx`

**Interfaces:**
- Consumes: `profiles`, `enrollment_officers`, `officer_access_logs`
- Produces: UI for approving staff roles, generating/revoking seasonal officer credentials, and auditing access logs.

- [ ] **Step 1: Create Admin dashboard layout with role guard**
- [ ] **Step 2: Build Approval Queue page with real-time updates and one-click role assignment**
- [ ] **Step 3: Build Enrollment Officer management page (provisioning PINs, copying credentials, revoking)**
- [ ] **Step 4: Build Audit Log Viewer displaying officer lookups**
- [ ] **Step 5: Commit**
```bash
git add src/app/admin src/components/admin
git commit -m "feat(admin): add approval queue and officer credential manager"
```

---

### Task 7: Learner Formation Officer (LFO) Dispatcher & Disciplinary Hub

**Files:**
- Create: `src/app/lfo/layout.tsx`
- Create: `src/app/lfo/dashboard/page.tsx`
- Create: `src/app/lfo/students/new/page.tsx`
- Create: `src/app/lfo/disciplinary/page.tsx`
- Create: `src/components/lfo/DisciplinaryRecordFormModal.tsx`

**Interfaces:**
- Consumes: `students`, `disciplinary_records`
- Produces: Student stub creation (name + counselor assignment) and exclusive CRUD for Bad Records (suspensions/clearances).

- [ ] **Step 1: Create LFO layout and navigation**
- [ ] **Step 2: Build Student Stub Creator (`/lfo/students/new`) with counselor assignment dropdown**
- [ ] **Step 3: Build Disciplinary Records CRUD table with offense category, sanction, and suspension dates**
- [ ] **Step 4: Build Clearance Resolution action (marks records cleared with notes)**
- [ ] **Step 5: Commit**
```bash
git add src/app/lfo src/components/lfo
git commit -m "feat(lfo): add student stub dispatcher and disciplinary crud"
```

---

### Task 8: Guidance Counselor Mobile PWA Module

**Files:**
- Create: `src/app/counselor/layout.tsx`
- Create: `src/app/counselor/timetable/page.tsx` (Default Landing Screen)
- Create: `src/app/counselor/students/[id]/page.tsx`
- Create: `src/app/counselor/students/[id]/complete-profile/page.tsx`
- Create: `src/components/counselor/TimetableList.tsx`
- Create: `src/components/counselor/SessionModal.tsx`

**Interfaces:**
- Consumes: `students`, `counseling_sessions`, `counseling_notes`, `disciplinary_records` (read-only)
- Produces: Counselor daily timetable, mandatory face photo capture & profile completion, session logging, and OCR note scanning.

- [ ] **Step 1: Build Counselor layout with mobile bottom navigation**
- [ ] **Step 2: Implement immediate landing screen `/counselor/timetable` showing today's appointments**
- [ ] **Step 3: Build Student Profile view with Action Required badge for stubs**
- [ ] **Step 4: Implement Profile Completion flow (mandatory camera face capture + LRN/guardian details)**
- [ ] **Step 5: Integrate OCR note scan & review modal on student profile**
- [ ] **Step 6: Commit**
```bash
git add src/app/counselor src/components/counselor
git commit -m "feat(counselor): add timetable landing photo capture and ocr notes"
```

---

### Task 9: Seasonal Enrollment Officer Mobile/Desktop Clearance Module

**Files:**
- Create: `src/app/officer/layout.tsx`
- Create: `src/app/officer/search/page.tsx`
- Create: `src/app/officer/student/[id]/page.tsx`
- Create: `src/components/officer/StudentClearanceCard.tsx`

**Interfaces:**
- Consumes: `students` (basic info + photo), `disciplinary_records` (clearance status)
- Produces: Fast student lookup, prominent ID photo verification, clearance status badge, and auto-logged audit trails.

- [ ] **Step 1: Build Officer layout with remaining session timer badge (countdown to 10h expiry)**
- [ ] **Step 2: Build fast search bar (LRN or Name) with debounce**
- [ ] **Step 3: Build `StudentClearanceCard` with large student photo and Green/Red clearance status**
- [ ] **Step 4: Auto-log lookup in `officer_access_logs` upon viewing student record**
- [ ] **Step 5: Verify zero counseling data is exposed**
- [ ] **Step 6: Commit**
```bash
git add src/app/officer src/components/officer
git commit -m "feat(officer): add student clearance search and photo verify"
```

---

### Task 10: End-to-End Polish, Performance & Security Verification

**Files:**
- Modify: `next.config.mjs` (headers, security policies)
- Test: `tests/rbac-rls.test.ts`
- Test: `tests/image-compression.test.ts`
- Test: `tests/officer-session.test.ts`

**Interfaces:**
- Produces: Complete automated test suite, security verification, and PWA lighthouse audit.

- [ ] **Step 1: Run RLS penetration tests (verify Admin & Officers cannot read counseling notes)**
- [ ] **Step 2: Run image compression unit tests (verify <200KB avatar and <500KB document outputs)**
- [ ] **Step 3: Run 10-hour cookie expiration tests**
- [ ] **Step 4: Test PWA offline caching and camera permissions on mobile viewport**
- [ ] **Step 5: Commit**
```bash
git add tests/ next.config.mjs
git commit -m "test(core): add rls security and image compression test suite"
```
