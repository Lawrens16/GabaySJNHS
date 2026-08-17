'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Plus,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Loader2,
  Camera,
  Check,
  CalendarCheck
} from 'lucide-react';
import SessionModal from '@/components/counselor/SessionModal';
import { CounselingSession, Student } from '@/types/database.types';

export default function CounselorTimetablePage() {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingStubsCount, setPendingStubsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const [timetableRes, studentsRes] = await Promise.all([
        fetch('/api/counselor/timetable'),
        fetch('/api/counselor/students'),
      ]);

      const [timetableData, studentsData] = await Promise.all([
        timetableRes.json(),
        studentsRes.json(),
      ]);

      if (timetableData.sessions) setSessions(timetableData.sessions);
      if (timetableData.pendingStubsCount !== undefined) {
        setPendingStubsCount(timetableData.pendingStubsCount);
      }
      if (studentsData.students) setStudents(studentsData.students);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleUpdateStatus = async (sessionId: string, newStatus: string) => {
    setUpdatingId(sessionId);
    try {
      const res = await fetch('/api/counselor/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, status: newStatus }),
      });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus as any } : s))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Page Title & Today Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-accent-foreground border border-gabay-green/20 text-xs font-semibold mb-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-gabay-green" />
            <span>{todayStr}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Today&apos;s Counseling Timetable
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immediate daily appointments and scheduled counseling evaluations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTimetable}
            disabled={loading}
            className="h-10 px-3.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsScheduleOpen(true)}
            className="h-10 px-4 rounded-xl bg-gabay-green hover:bg-gabay-green-600 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule a Session</span>
          </button>
        </div>
      </div>

      {/* Action Required: Incomplete Stubs Banner */}
      {pendingStubsCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">
                Action Required: {pendingStubsCount} Incomplete Student {pendingStubsCount === 1 ? 'Stub' : 'Stubs'}
              </div>
              <p className="text-[11px] opacity-90 leading-tight mt-0.5">
                New stubs dispatched by LFO require mandatory student face photo capture before enrollment.
              </p>
            </div>
          </div>

          <Link
            href="/counselor/students?status=stub"
            className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 active:scale-95 shadow-xs"
          >
            <span>Complete Profiles</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Timetable Appointments Stream */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-card rounded-2xl border border-border">
            <Loader2 className="w-6 h-6 animate-spin text-gabay-green" />
            <span className="text-xs">Loading today&apos;s scheduled sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-card rounded-3xl border border-border space-y-3 shadow-xs">
            <CalendarCheck className="w-10 h-10 text-muted-foreground/60 mx-auto" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">No Appointments Scheduled for Today</h3>
              <p className="text-xs text-muted-foreground mt-1">
                You have an open schedule. Click &quot;Schedule a Session&quot; to plan a session with an assigned student.
              </p>
            </div>
            <button
              onClick={() => setIsScheduleOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gabay-green hover:bg-gabay-green-600 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule a Session</span>
            </button>
          </div>
        ) : (
          sessions.map((session) => {
            const timeFormatted = new Date(session.scheduled_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const isCompleted = session.status === 'completed';

            return (
              <div
                key={session.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                  isCompleted
                    ? 'bg-muted/40 border-border opacity-85'
                    : 'bg-card border-border hover:border-gabay-green/40'
                }`}
              >
                {/* Time & Student Details */}
                <div className="flex items-start sm:items-center gap-3.5">
                  {/* Time Badge */}
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-accent text-accent-foreground border border-gabay-green/25 shrink-0 shadow-xs">
                    <span className="text-xs font-bold text-foreground">{timeFormatted.split(' ')[0]}</span>
                    <span className="text-[10px] text-gabay-green uppercase font-semibold">
                      {timeFormatted.split(' ')[1]}
                    </span>
                  </div>

                  {/* Student Info */}
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <Link
                        href={`/counselor/students/${session.student_id}`}
                        className="text-sm font-bold text-foreground hover:text-gabay-green transition"
                      >
                        {session.student?.first_name} {session.student?.last_name}
                      </Link>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          session.session_type === 'behavioral'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                            : session.session_type === 'academic'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                        }`}
                      >
                        {session.session_type}
                      </span>

                      {session.student?.profile_status === 'stub' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-500/25">
                          Stub (No Photo)
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground mt-0.5">
                      {session.student?.grade_level
                        ? `Grade ${session.student.grade_level} - ${session.student.section || 'General'}`
                        : 'Demographics Pending'}{' '}
                      • LRN: <span className="font-mono text-foreground font-semibold">{session.student?.lrn || 'Pending'}</span>
                    </div>

                    {session.summary_notes && (
                      <p className="text-xs text-muted-foreground italic mt-1 line-clamp-1">
                        &quot;{session.summary_notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                  {session.status !== 'completed' ? (
                    <button
                      onClick={() => handleUpdateStatus(session.id, 'completed')}
                      disabled={updatingId === session.id}
                      className="h-9 px-3 rounded-xl bg-accent hover:bg-gabay-green hover:text-white border border-gabay-green/30 text-gabay-green text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  )}

                  <Link
                    href={`/counselor/students/${session.student_id}`}
                    className="h-9 px-3.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Modal */}
      <SessionModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={fetchTimetable}
        students={students}
      />
    </div>
  );
}
