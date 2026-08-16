import Link from 'next/link';
import { ShieldCheck, HeartHandshake, UserCheck, KeyRound, ArrowRight, Sparkles, Smartphone, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white selection:bg-blue-500 selection:text-white">
      {/* Header / Brand Nav */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20">
            <HeartHandshake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-300">
              GabaySJNHS
            </h1>
            <p className="text-xs text-blue-300/80 font-medium">San Jose National High School</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/15 backdrop-blur border border-white/10 transition active:scale-95"
          >
            Staff Portal
          </Link>
          <Link
            href="/officer/login"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition active:scale-95 flex items-center gap-1.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>Officer PIN</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 sm:py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Department of Education - DepEd Guidance System</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight mb-6">
          Empowering Student Well-being & Guidance Management
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          A mobile-first Progressive Web App digitizing physical counseling notes with OCR, managing disciplinary records, and streamlining enrollment identity verification.
        </p>

        {/* Dual Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group active:scale-98"
          >
            <span>Staff Google Sign-In</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/officer/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Enrollment Officer Login</span>
          </Link>
        </div>
      </section>

      {/* 4-Tier Role Architecture Preview Grid */}
      <section className="w-full max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Counselor Card */}
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur hover:bg-white/[0.07] transition group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Guidance Counselor</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Daily scheduled timetable landing, student face photo capture, and OCR handwriting digitization.
            </p>
            <div className="flex items-center text-xs text-blue-400 font-medium gap-1">
              <span>Counselor Workspace</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* LFO Card */}
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur hover:bg-white/[0.07] transition group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Learner Formation (LFO)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Student stub creation, counselor dispatching, and exclusive disciplinary violation CRUD.
            </p>
            <div className="flex items-center text-xs text-amber-400 font-medium gap-1">
              <span>Disciplinary Hub</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Enrollment Officer Card */}
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur hover:bg-white/[0.07] transition group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Enrollment Officer</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Seasonal PIN login, 10-hour strict sessions, student photo ID verification, and clearance checks.
            </p>
            <div className="flex items-center text-xs text-emerald-400 font-medium gap-1">
              <span>Clearance Station</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* IT Admin Card */}
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur hover:bg-white/[0.07] transition group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">System Admin</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Google OAuth Approval Queue, role assignments, PIN credential issuance, and audit log inspection.
            </p>
            <div className="flex items-center text-xs text-purple-400 font-medium gap-1">
              <span>Admin Console</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Feature badges */}
        <div className="mt-8 pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Zero-Cost Architecture</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Mobile-First Camera PWA</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>PostgreSQL Row Level Security</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Free OCR.Space Handwriting API</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 text-center text-xs text-slate-500">
        <p>© 2026 San Jose National High School. All rights reserved. DepEd Region IV-A CALABARZON.</p>
      </footer>
    </main>
  );
}
