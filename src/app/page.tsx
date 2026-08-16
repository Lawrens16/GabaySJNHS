import Link from 'next/link';
import {
  Calendar,
  FileText,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldAlert,
  Users,
  Building2,
  LogIn
} from 'lucide-react';
import GabayLogo from '@/components/brand/GabayLogo';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <GabayLogo size="md" showSubtitle={true} />
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Lightbulb Theme Toggle Button */}
          <ThemeToggle showLabel={false} />

          <Link
            href="/login"
            className="h-10 px-4 sm:px-5 rounded-xl bg-gabay-green hover:bg-gabay-green-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Staff Sign In</span>
          </Link>
        </div>
      </header>

      {/* Hero Welcome Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-14">
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-2 sm:pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold border border-gabay-green/30 shadow-xs animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-gabay-green" />
            <span>San Jose National High School • Guidance Office</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Supporting Every Student&apos;s Journey with <span className="text-gabay-green underline decoration-gabay-green/30 decoration-wavy">Gabay</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            A centralized digital workspace designed to help guidance counselors, teachers, and school staff coordinate daily appointments, maintain private student counseling files, and verify enrollment clearances.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="h-12 px-7 rounded-2xl bg-gabay-green hover:bg-gabay-green-600 text-white font-bold text-sm flex items-center gap-2.5 transition shadow-lg shadow-gabay-green/25 active:scale-95"
            >
              <span>Access Staff Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/officer/login"
              className="h-12 px-6 rounded-2xl bg-card hover:bg-muted border border-border text-foreground font-semibold text-sm flex items-center gap-2 transition active:scale-95"
            >
              <UserCheck className="w-4 h-4 text-gabay-navy" />
              <span>Enrollment Officer Station</span>
            </Link>
          </div>
        </section>

        {/* 4 Dedicated Staff Access Portals */}
        <section className="space-y-4">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Select Your Designated Portal
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in with your authorized school account to access your workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* 1. Guidance Counselor Portal */}
            <div className="p-6 rounded-3xl bg-card border border-border hover:border-gabay-green/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-gabay-green flex items-center justify-center border border-gabay-green/25">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-[11px] font-bold">
                    Guidance Staff
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-gabay-green transition-colors">
                    Guidance Counselor Portal
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    View your daily schedule timetable, manage assigned student records, take face photos, and digitize handwritten counseling notes.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gabay-green shrink-0" />
                    <span>Daily counseling appointment schedule</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gabay-green shrink-0" />
                    <span>Handwritten note scanner & transcription review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gabay-green shrink-0" />
                    <span>Strictly confidential student files</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/counselor/timetable"
                  className="w-full h-11 rounded-xl bg-gabay-green hover:bg-gabay-green-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-gabay-green/20"
                >
                  <span>Open Counselor Workspace</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 2. Learner Formation Portal */}
            <div className="p-6 rounded-3xl bg-card border border-border hover:border-gabay-navy/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-gabay-navy dark:text-blue-400 flex items-center justify-center border border-gabay-navy/25">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-gabay-navy dark:text-blue-300 text-[11px] font-bold">
                    Disciplinary Office
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-gabay-navy dark:group-hover:text-blue-400 transition-colors">
                    Learner Formation (LFO) Hub
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    Dispatch initial student stubs to counselors and exclusively maintain campus disciplinary records, infractions, and suspension holds.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gabay-navy dark:text-blue-400 shrink-0" />
                    <span>Quick student stub dispatching (Name & Counselor)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gabay-navy dark:text-blue-400 shrink-0" />
                    <span>Exclusive disciplinary violation management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gabay-navy dark:text-blue-400 shrink-0" />
                    <span>Suspension clearance actions for enrollment</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/lfo/dashboard"
                  className="w-full h-11 rounded-xl bg-gabay-navy hover:bg-gabay-navy-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-gabay-navy/20"
                >
                  <span>Open Formation Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 3. Enrollment Officer Clearance Station */}
            <div className="p-6 rounded-3xl bg-card border border-border hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                    Seasonal Staff
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                    Enrollment Clearance Station
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    Designed for seasonal enrollment desks. Simple 6-digit PIN login with student face photo verification and instant clearance indicators.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Fast LRN and Student Name search</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Large student portrait photo verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Automatic security access logging</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/officer/login"
                  className="w-full h-11 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                >
                  <span>Officer PIN Sign In</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 4. System Administrator */}
            <div className="p-6 rounded-3xl bg-card border border-border hover:border-slate-500/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center border border-border">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-bold">
                    IT & Admin
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-foreground transition-colors">
                    System Administration
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    Approve incoming staff sign-in requests, manage seasonal enrollment officer credentials, and review station audit logs.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>Staff Google account approval queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>Provision enrollment station passes & PINs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>Strict privacy isolation from counseling data</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/admin/approval-queue"
                  className="w-full h-11 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                >
                  <span>Open Admin Console</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Helps Our School (Guidance Philosophy) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              How Gabay Supports San Jose NHS
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Built with care to address the day-to-day coordination needs of our high school guidance department.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-foreground">Clear Daily Timetables</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Counselors immediately view their daily schedule upon signing in, eliminating missed sessions and lost paper slips.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-gabay-navy dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-foreground">Paperless Note Digitization</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Take a quick photo of handwritten notes during sessions to store them securely in the student&apos;s private counseling history.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-foreground">Seamless Enrollment Checks</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enrollment officers can confirm student identity via photo ID and check clearance in seconds during busy registration weeks.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* School Attribution Footer */}
      <footer className="border-t border-border bg-card py-6 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2">
            <GabayLogo size="sm" showSubtitle={false} />
          </div>
          <p className="text-[11px] leading-relaxed max-w-xl mx-auto">
            Developed to support the Guidance Counseling Office and Faculty of <strong>San Jose National High School</strong>.
          </p>
          <p className="text-[10px] text-muted-foreground/80">
            Dedicated to the welfare, guidance, and academic growth of every Learner.
          </p>
        </div>
      </footer>
    </div>
  );
}
