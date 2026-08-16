'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  UserPlus,
  ShieldAlert,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Student, DisciplinaryRecord } from '@/types/database.types';

export default function LFODashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<DisciplinaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, recordsRes] = await Promise.all([
        fetch('/api/lfo/students'),
        fetch('/api/lfo/disciplinary'),
      ]);

      const [studentsData, recordsData] = await Promise.all([
        studentsRes.json(),
        recordsRes.json(),
      ]);

      if (studentsData.students) setStudents(studentsData.students);
      if (recordsData.records) setRecords(recordsData.records);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stubsCount = students.filter((s) => s.profile_status === 'stub').length;
  const completedCount = students.filter((s) => s.profile_status === 'complete').length;
  const activeSuspensionCount = records.filter(
    (r) => r.is_suspended && r.clearance_status !== 'cleared'
  ).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Learner Formation & Disciplinary Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch student stubs to Guidance Counselors and manage campus disciplinary records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/lfo/students/new"
            className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-amber-600/30 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Dispatch Stub</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-white">{students.length}</div>
          <div className="text-xs text-slate-400 font-medium mt-1">Total Enrolled Students</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{stubsCount}</div>
          <div className="text-xs text-slate-400 font-medium mt-1">Incomplete Stubs (Counselor Action)</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">{completedCount}</div>
          <div className="text-xs text-slate-400 font-medium mt-1">Complete Profiles (Photos Verified)</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-rose-300">{activeSuspensionCount}</div>
          <div className="text-xs text-slate-400 font-medium mt-1">Active Suspensions / Holds</div>
        </div>
      </div>

      {/* Two-Column Grid: Recent Stubs vs. Recent Disciplinary Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Student Stubs */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>Recently Dispatched Stubs</span>
              </h2>
              <Link href="/lfo/students/new" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                + New Stub
              </Link>
            </div>

            <div className="space-y-2.5">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                  Loading...
                </div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No students dispatched yet.</div>
              ) : (
                students.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        {s.first_name} {s.last_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {s.grade_level ? `Grade ${s.grade_level} - ${s.section || ''}` : 'No Grade Set'}{' '}
                        • Assigned:{' '}
                        <span className="text-blue-300 font-semibold">
                          {s.assigned_counselor?.full_name || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.profile_status === 'stub'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {s.profile_status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Disciplinary Records */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Disciplinary Incidents</span>
              </h2>
              <Link href="/lfo/disciplinary" className="text-xs text-rose-400 hover:text-rose-300 font-semibold">
                Manage All →
              </Link>
            </div>

            <div className="space-y-2.5">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                  Loading...
                </div>
              ) : records.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No disciplinary violations logged.</div>
              ) : (
                records.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        {r.student ? `${r.student.first_name} ${r.student.last_name}` : 'Student'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                        {r.offense_description}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.clearance_status === 'cleared'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : r.is_suspended
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {r.is_suspended && r.clearance_status !== 'cleared' ? 'Suspended' : r.clearance_status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
