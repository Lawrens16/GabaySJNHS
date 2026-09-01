'use client';

import Link from 'next/link';
import { LayoutDashboard, ShieldCheck, GraduationCap, HeartHandshake } from 'lucide-react';
import GabayLogo from '@/components/brand/GabayLogo';
import ThemeToggle from '@/components/theme/ThemeToggle';

/**
 * Role Selection page — specifically for lucille.magnetico5300@deped.gov.ph
 * who holds both Admin and LFO responsibilities. This page is a one-time
 * exception and should not be generalized or replicated.
 */
export default function RoleSelectPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-sm space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <GabayLogo size="sm" showSubtitle={false} />
          <ThemeToggle />
        </div>

        {/* Heading */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gabay-green/10 border border-gabay-green/25 text-gabay-green text-[11px] font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Multi-Role Access</span>
          </div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">
            Select Your Workspace
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You have access to multiple areas. Choose the workspace you need for this session.
          </p>
        </div>

        {/* Role Tiles */}
        <div className="space-y-3">
          {/* Admin Panel */}
          <Link
            href="/admin/approval-queue"
            className="group flex items-center gap-4 p-5 rounded-2xl bg-card border-2 border-border hover:border-gabay-green/50 hover:shadow-md transition active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center border border-gabay-green/25 group-hover:bg-gabay-green/10 transition shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-gabay-green" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground group-hover:text-gabay-green transition">
                System Administration
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Manage staff approvals, enrollment officer passes, and station audit logs.
              </div>
            </div>
            <div className="text-muted-foreground group-hover:text-gabay-green transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* LFO Dashboard */}
          <Link
            href="/lfo/dashboard"
            className="group flex items-center gap-4 p-5 rounded-2xl bg-card border-2 border-border hover:border-gabay-green/50 hover:shadow-md transition active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center border border-gabay-green/25 group-hover:bg-gabay-green/10 transition shrink-0 shadow-xs">
              <LayoutDashboard className="w-6 h-6 text-gabay-green" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground group-hover:text-gabay-green transition">
                Learner Formation Office
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Dispatch student stubs, manage disciplinary records, and track sanctions.
              </div>
            </div>
            <div className="text-muted-foreground group-hover:text-gabay-green transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Guidance Counselor Dashboard */}
          <Link
            href="/counselor/timetable"
            className="group flex items-center gap-4 p-5 rounded-2xl bg-card border-2 border-border hover:border-gabay-green/50 hover:shadow-md transition active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center border border-gabay-green/25 group-hover:bg-gabay-green/10 transition shrink-0 shadow-xs">
              <HeartHandshake className="w-6 h-6 text-gabay-green" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground group-hover:text-gabay-green transition">
                Guidance Counselor
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                View daily timetable, manage assigned students, and record counseling notes.
              </div>
            </div>
            <div className="text-muted-foreground group-hover:text-gabay-green transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          You can switch workspaces anytime via the navigation sidebar.
        </p>
      </div>
    </div>
  );
}
