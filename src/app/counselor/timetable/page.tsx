'use client';

import { useState, useEffect, useMemo } from 'react';
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
  CalendarDays,
  Calendar,
  CalendarCheck2,
  User,
  Filter,
} from 'lucide-react';
import SessionModal from '@/components/counselor/SessionModal';
import { CounselingSession, Student } from '@/types/database.types';

type FilterTab = 'upcoming' | 'today' | 'tomorrow' | 'week' | 'past';

function getDateKey(isoDate: string) {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getRelativeDateInfo(isoDate: string) {
  const target = new Date(isoDate);
  const now = new Date();

  const targetDateOnly = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round((targetDateOnly.getTime() - todayDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      label: 'Today',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      isToday: true,
      isTomorrow: false,
      isUpcoming: true,
      diffDays,
    };
  }
  if (diffDays === 1) {
    return {
      label: 'Tomorrow',
      badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      isToday: false,
      isTomorrow: true,
      isUpcoming: true,
      diffDays,
    };
  }
  if (diffDays === -1) {
    return {
      label: 'Yesterday',
      badgeClass: 'bg-muted text-muted-foreground border-border',
      isToday: false,
      isTomorrow: false,
      isUpcoming: false,
      diffDays,
    };
  }
  if (diffDays < -1) {
    return {
      label: `${Math.abs(diffDays)} days ago`,
      badgeClass: 'bg-muted text-muted-foreground border-border',
      isToday: false,
      isTomorrow: false,
      isUpcoming: false,
      diffDays,
    };
  }
  if (diffDays <= 7) {
    return {
      label: `In ${diffDays} days`,
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      isToday: false,
      isTomorrow: false,
      isUpcoming: true,
      diffDays,
    };
  }
  return {
    label: target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    badgeClass: 'bg-accent text-accent-foreground border-border',
    isToday: false,
    isTomorrow: false,
    isUpcoming: true,
    diffDays,
  };
}

export default function CounselorTimetablePage() {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingStubsCount, setPendingStubsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('upcoming');

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

  // Filter sessions based on active tab
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return sessions.filter((session) => {
      const sessionDate = new Date(session.scheduled_at);
      const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
      const diffDays = Math.round((sessionDateOnly.getTime() - todayDateOnly.getTime()) / (1000 * 60 * 60 * 24));

      if (activeFilter === 'today') return diffDays === 0;
      if (activeFilter === 'tomorrow') return diffDays === 1;
      if (activeFilter === 'week') return diffDays >= 0 && diffDays <= 7;
      if (activeFilter === 'past') return diffDays < 0 || session.status === 'completed';
      // 'upcoming': all scheduled sessions from today onward (or not completed)
      return diffDays >= 0 && session.status !== 'completed';
    });
  }, [sessions, activeFilter]);

  // Group filtered sessions by date
  const groupedSessions = useMemo(() => {
    const groups: { [dateKey: string]: { date: Date; sessions: CounselingSession[] } } = {};

    filteredSessions.forEach((session) => {
      const key = getDateKey(session.scheduled_at);
      if (!groups[key]) {
        groups[key] = {
          date: new Date(session.scheduled_at),
          sessions: [],
        };
      }
      groups[key].sessions.push(session);
    });

    // Sort group dates chronologically
    return Object.keys(groups)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((key) => groups[key]);
  }, [filteredSessions]);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-gabay-green/20 text-[11px] font-semibold mb-1 shadow-xs">
            <Clock className="w-3 h-3 text-gabay-green" />
            <span>Today: {todayStr}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Counseling Schedule & Timetable
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage upcoming appointments, tomorrow&apos;s schedule, and weekly counseling caseload.
          </p>
        </div>

        {/* Header Actions - Mobile Optimized */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchTimetable}
            disabled={loading}
            className="h-9 px-3 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            title="Refresh Schedule"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsScheduleOpen(true)}
            className="h-9 px-3.5 sm:px-4 rounded-xl bg-gabay-green hover:bg-gabay-green-600 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Action Required: Incomplete Stubs Banner */}
      {pendingStubsCount > 0 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">
                Action Required: {pendingStubsCount} Incomplete Student {pendingStubsCount === 1 ? 'Stub' : 'Stubs'}
              </div>
              <p className="text-[11px] opacity-90 leading-tight">
                Stubs dispatched by LFO require face photo capture before enrollment clearance.
              </p>
            </div>
          </div>

          <Link
            href="/counselor/students?status=stub"
            className="h-8 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition shrink-0 active:scale-95 shadow-xs"
          >
            <span>Complete</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Filter Tabs Bar - Mobile Touch Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar p-1 bg-card border border-border rounded-2xl shadow-xs">
        {[
          { id: 'upcoming', label: 'All Upcoming' },
          { id: 'today', label: 'Today' },
          { id: 'tomorrow', label: 'Tomorrow' },
          { id: 'week', label: 'Next 7 Days' },
          { id: 'past', label: 'Completed / Past' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as FilterTab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-gabay-green text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grouped Timetable Stream */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-card rounded-2xl border border-border">
          <Loader2 className="w-6 h-6 animate-spin text-gabay-green" />
          <span className="text-xs">Loading scheduled sessions...</span>
        </div>
      ) : groupedSessions.length === 0 ? (
        <div className="p-8 sm:p-12 text-center text-muted-foreground bg-card rounded-3xl border border-border space-y-3 shadow-xs">
          <CalendarCheck2 className="w-10 h-10 text-muted-foreground/60 mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">No Sessions Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              There are no appointments matching the &quot;{activeFilter}&quot; view.
            </p>
          </div>
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gabay-green hover:bg-gabay-green-600 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule a Session</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedSessions.map((group) => {
            const dateStr = group.date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            const rel = getRelativeDateInfo(group.date.toISOString());

            return (
              <div key={getDateKey(group.date.toISOString())} className="space-y-2.5">
                {/* Date Group Header Banner */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gabay-green" />
                    <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
                      {dateStr}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${rel.badgeClass}`}
                    >
                      {rel.label}
                    </span>
                  </div>

                  <span className="text-[11px] text-muted-foreground">
                    {group.sessions.length} {group.sessions.length === 1 ? 'session' : 'sessions'}
                  </span>
                </div>

                {/* Session Cards for this Date */}
                <div className="space-y-2.5">
                  {group.sessions.map((session) => {
                    const timeFormatted = new Date(session.scheduled_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const isCompleted = session.status === 'completed';

                    return (
                      <div
                        key={session.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                          isCompleted
                            ? 'bg-muted/40 border-border opacity-85'
                            : 'bg-card border-border hover:border-gabay-green/40'
                        }`}
                      >
                        {/* Time & Student Details */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
                          {/* Expanded Time Pill */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-accent-foreground border border-gabay-green/25 shrink-0 shadow-xs self-start sm:self-center">
                            <Clock className="w-3.5 h-3.5 text-gabay-green shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-foreground whitespace-nowrap tracking-tight font-mono">
                              {timeFormatted}
                            </span>
                          </div>

                          {/* Student Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center flex-wrap gap-1.5">
                              <Link
                                href={`/counselor/students/${session.student_id}`}
                                className="text-xs sm:text-sm font-bold text-foreground hover:text-gabay-green transition truncate"
                              >
                                {session.student?.first_name} {session.student?.last_name}
                              </Link>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
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
                                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[9px] font-bold border border-rose-500/25">
                                  Stub
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {session.student?.grade_level
                                ? `Grade ${session.student.grade_level} - ${session.student.section || 'General'}`
                                : 'Demographics Pending'}{' '}
                              • LRN: <span className="font-mono text-foreground font-semibold">{session.student?.lrn || 'Pending'}</span>
                            </div>

                            {session.summary_notes && (
                              <p className="text-[11px] text-muted-foreground italic mt-0.5 line-clamp-1">
                                &quot;{session.summary_notes}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border shrink-0 self-end sm:self-auto">
                          {session.status !== 'completed' ? (
                            <button
                              onClick={() => handleUpdateStatus(session.id, 'completed')}
                              disabled={updatingId === session.id}
                              className="h-8 px-2.5 sm:px-3 rounded-lg bg-accent hover:bg-gabay-green hover:text-white border border-gabay-green/30 text-gabay-green text-xs font-semibold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              <span>Done</span>
                            </button>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Completed</span>
                            </span>
                          )}

                          <Link
                            href={`/counselor/students/${session.student_id}`}
                            className="h-8 px-2.5 sm:px-3 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                          >
                            <span>Profile</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Session Modal */}
      <SessionModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={fetchTimetable}
        students={students}
      />
    </div>
  );
}
