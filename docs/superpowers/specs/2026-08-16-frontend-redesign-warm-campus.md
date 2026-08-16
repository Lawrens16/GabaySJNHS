# Frontend Design Specification: "Warm Campus Classic" Theme

**Project:** GabaySJNHS Guidance Counseling & Disciplinary Management System  
**Date:** 2026-08-16  
**Status:** Approved for Implementation  
**Audience:** Public School Teachers, Guidance Counselors, and School Staff of San Jose National High School  

---

## 1. Design Philosophy & Goals

1. **Teacher-First & Non-Technical Language:**
   * Eliminate all developer jargon (*PWA, Next.js, Vercel, Supabase, OCR Proxy, RBAC*) across user-facing pages.
   * Highlight **The Gabay** as a caring, practical guidance and records assistant.
2. **Warm Campus Palette (Approach A):**
   * **Light Mode as Default:** A soft, natural off-white canvas (`#F8FAF6`) that feels like clean warm parchment, easy on the eyes during prolonged school desk work.
   * **Primary Garden Green (`#51ae44`):** Represents growth, guidance, care, and positive enrollment clearance.
   * **Heritage Deep Blue (`#0d14a6`):** Represents school identity, official documentation, structure, and high contrast accents.
   * **Elevated White Cards (`#FFFFFF`):** High contrast with subtle borders (`#E2E8DF`) and gentle shadows.
3. **Intuitive Lightbulb Theme Switcher:**
   * Styled as a prominent, friendly 💡 lightbulb button with clear label/tooltip.
   * Default state is Light Mode; persists user preference in `localStorage`.
4. **Custom Open Brand Identity:**
   * Custom dual-toned `HeartHandshake` brand mark avoiding official DepEd national seals while maintaining respectful school attribution: *"San Jose National High School Guidance Office"*.

---

## 2. Color Tokens Specification

### 2.1 Light Mode (Default)
* `--background`: `#F8FAF6` (Soft herbal off-white canvas)
* `--foreground`: `#131E29` (High-contrast charcoal slate)
* `--card`: `#FFFFFF` (Elevated card background)
* `--card-foreground`: `#131E29`
* `--primary`: `#51ae44` (Vibrant school garden green)
* `--primary-foreground`: `#FFFFFF`
* `--primary-hover`: `#439737`
* `--secondary`: `#0d14a6` (Heritage deep blue)
* `--secondary-foreground`: `#FFFFFF`
* `--secondary-hover`: `#090e78`
* `--muted`: `#EDF2EC` (Soft green-grey muted container)
* `--muted-foreground`: `#5A6872` (Readable secondary text)
* `--border`: `#E2E8DF` (Subtle boundary borders)
* `--accent`: `#E8F5E5` (Light green highlight tint)
* `--accent-foreground`: `#2E6E24`
* `--danger`: `#DC2626`
* `--danger-bg`: `#FEF2F2`
* `--warning`: `#D97706`
* `--warning-bg`: `#FFFBEB`
* `--success`: `#51ae44`
* `--success-bg`: `#F0FDF4`

### 2.2 Dark Mode (Toggleable via Lightbulb)
* `--background`: `#0B111A` (Deep midnight slate)
* `--foreground`: `#F1F5F9` (Soft cream white)
* `--card`: `#121D2B` (Charcoal navy surface)
* `--card-foreground`: `#F1F5F9`
* `--primary`: `#61c753` (Vibrant lime green)
* `--primary-foreground`: `#0B111A`
* `--secondary`: `#3b4cca` (Luminous blue)
* `--secondary-foreground`: `#FFFFFF`
* `--muted`: `#1E293B`
* `--muted-foreground`: `#94A3B8`
* `--border`: `#1E2E42`
* `--accent`: `#16281E`
* `--accent-foreground`: `#86EFAC`

---

## 3. UI Component Architecture

### 3.1 Brand Logo Component (`src/components/brand/GabayLogo.tsx`)
* Custom dual-toned SVG badge using Lucide `HeartHandshake`:
  * Heart icon outline in `#51ae44` green.
  * Handshake support in `#0d14a6` deep blue.
* Size variants: `sm` (navbar), `md` (cards), `lg` (splash/auth screens).
* Typography: Bold **Gabay** in primary green with a pill badge **SJNHS** in heritage blue.

### 3.2 Theme Provider & Lightbulb Switcher (`src/components/theme/ThemeProvider.tsx` & `ThemeToggle.tsx`)
* Default theme: `'light'`.
* Persistent storage key: `gabay_theme`.
* Top navigation toggle: An accessible button with a glowing 💡 lightbulb icon on light mode, and a soft moon on dark mode, with a tooltip explaining its purpose.

### 3.3 Redesigned Portal Landing Page (`src/app/page.tsx`)
* **Header:** Gabay SJNHS logo, theme switcher, and "Staff Sign In" button.
* **Hero Banner:** Warm welcoming message for teachers and school staff. Explains how Gabay simplifies daily counseling scheduling, notes digitization, and clearance tracking without any tech jargon.
* **4 Role Access Cards:**
  1. **Guidance Counselor Portal:** Daily appointments timetable, student counseling files, note scanning.
  2. **Learner Formation (LFO):** Student stub dispatching, campus disciplinary records, and student clearance tracking.
  3. **Enrollment Officer Clearance Station:** 6-digit PIN login, student face photo verification, and clearance status checks.
  4. **System Administrator:** Staff access approvals and seasonal enrollment accounts.
* **Footer:** Respectful attribution to the Guidance Office of San Jose National High School.

### 3.4 Internal Module Consistency
* Update `globals.css` and all layouts/pages (`/counselor/*`, `/lfo/*`, `/officer/*`, `/admin/*`, `/(auth)/*`) to utilize the semantic color classes so every screen transitions between the warm off-white canvas and dark mode.
