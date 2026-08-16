'use client';

import { useState, useEffect } from 'react';
import { Search, ShieldCheck, UserCheck, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import StudentClearanceCard from '@/components/officer/StudentClearanceCard';
import { Student } from '@/types/database.types';

export default function OfficerSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/officer/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.students) setStudents(data.students);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Hero Search Box */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Student Enrollment Clearance
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Type the 12-digit Learner Reference Number (LRN) or Student Name to verify face identity and clearance status.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter Student LRN (e.g. 109283746501) or Full Name..."
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-500 text-sm sm:text-base focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none transition shadow-xl font-medium"
        />
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400 absolute right-4 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* Data Privacy & Audit Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
        <p className="leading-relaxed text-[11px]">
          🔒 <strong>Data Privacy & Individual Accountability:</strong> All student lookups performed at this station are automatically recorded in the school audit log. Counseling session contents and OCR notes are protected and hidden from enrollment stations.
        </p>
      </div>

      {/* Results Stream */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <span>Search Results ({students.length})</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-emerald-400 hover:text-emerald-300 transition"
            >
              Clear Search
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-slate-900/50 rounded-3xl border border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs">Searching student records...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-3xl border border-slate-800">
            <UserCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">No matching students found</h3>
            <p className="text-xs text-slate-500 mt-1">Check the spelling or 12-digit LRN and try again.</p>
          </div>
        ) : (
          students.map((student) => (
            <StudentClearanceCard key={student.id} student={student} />
          ))
        )}
      </div>
    </div>
  );
}
