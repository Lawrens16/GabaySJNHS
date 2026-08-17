'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Camera,
  ChevronRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Student } from '@/types/database.types';

export default function CounselorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/counselor/students?status=${statusFilter}`);
      const data = await res.json();
      if (data.students) setStudents(data.students);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const name = `${s.first_name} ${s.last_name}`.toLowerCase();
    const lrn = s.lrn || '';
    return name.includes(q) || lrn.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Assigned Student Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your counseling caseload, complete student photo stubs, and review records.
          </p>
        </div>

        <button
          onClick={fetchStudents}
          disabled={loading}
          className="h-10 px-3.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assigned student by name or LRN..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
          />
        </div>

        <div className="flex items-center p-1 rounded-xl bg-card border border-border w-full sm:w-auto shadow-xs">
          {[
            { id: 'all', label: 'All Students' },
            { id: 'stub', label: '🟡 Stubs (Action Required)' },
            { id: 'complete', label: '🟢 Complete Profiles' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-gabay-green text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-card rounded-2xl border border-border">
            <Loader2 className="w-6 h-6 animate-spin text-gabay-green" />
            <span className="text-xs">Loading assigned student records...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="col-span-full p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border shadow-xs">
            <Users className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No students found</h3>
            <p className="text-xs text-muted-foreground mt-1">There are no assigned students matching this filter.</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isStub = student.profile_status === 'stub';
            const hasSuspension = student.disciplinary_records?.some(
              (r) => r.is_suspended && r.clearance_status !== 'cleared'
            );

            return (
              <div
                key={student.id}
                className="p-5 rounded-2xl bg-card border border-border hover:border-gabay-green/40 transition flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Avatar & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.first_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <Camera className="w-5 h-5" />
                          <span className="text-[9px] font-bold mt-0.5">NO PHOTO</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isStub
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {student.profile_status}
                      </span>

                      {hasSuspension && (
                        <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-[10px] font-bold border border-destructive/30">
                          Disciplinary Hold
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name & Academic info */}
                  <h3 className="text-sm font-bold text-foreground mb-0.5">
                    {student.first_name} {student.last_name}
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    {student.grade_level ? `Grade ${student.grade_level} - ${student.section || 'General'}` : 'Grade Pending'}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground mt-1">
                    LRN: {student.lrn || 'Pending Completion'}
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-5 pt-3 border-t border-border flex items-center gap-2">
                  {isStub ? (
                    <Link
                      href={`/counselor/students/${student.id}/complete-profile`}
                      className="w-full h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Capture Photo & Complete</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/counselor/students/${student.id}`}
                      className="w-full h-9 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs"
                    >
                      <span>Open Counseling File</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
