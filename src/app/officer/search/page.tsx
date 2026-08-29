'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, ShieldCheck, UserCheck, Loader2, AlertTriangle } from 'lucide-react';
import StudentClearanceCard from '@/components/officer/StudentClearanceCard';
import Pagination from '@/components/ui/Pagination';
import { Student } from '@/types/database.types';

const PAGE_SIZE = 6;

export default function OfficerSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStudents = async (query = '') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/officer/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to load student records. Your session may have expired.');
        setStudents([]);
      } else {
        setStudents(data.students || []);
        setCurrentPage(1); // Reset page on new query
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
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

  // Pagination
  const totalPages = Math.ceil(students.length / PAGE_SIZE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return students.slice(start, start + PAGE_SIZE);
  }, [students, currentPage]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Hero Search Box */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Student Enrollment Clearance
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
          Type the 12-digit Learner Reference Number (LRN) or Student Name to verify face identity and clearance status.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-gabay-green absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter Student LRN (e.g. 109283746501) or Full Name..."
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border-2 border-border text-foreground placeholder-muted-foreground text-sm sm:text-base focus:border-gabay-green focus:ring-4 focus:ring-gabay-green/20 focus:outline-none transition shadow-sm font-medium"
        />
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin text-gabay-green absolute right-4 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* Data Privacy & Audit Notice (Simplified) */}
      <div className="p-3.5 rounded-2xl bg-muted/60 border border-border text-xs text-muted-foreground flex items-start gap-2.5 shadow-xs">
        <ShieldCheck className="w-4 h-4 text-gabay-green mt-0.5 shrink-0" />
        <p className="leading-relaxed text-[11px]">
          🔒 <strong>Data Privacy & Individual Accountability:</strong> All student lookups performed at this station are authorized for enrollment verification and automatically recorded in the school audit log.
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/25 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-destructive leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {/* Results Stream */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
          <span>Search Results ({students.length})</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gabay-green hover:underline transition cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-card rounded-3xl border border-border">
            <Loader2 className="w-6 h-6 animate-spin text-gabay-green" />
            <span className="text-xs">Searching student records...</span>
          </div>
        ) : students.length === 0 && !errorMsg ? (
          <div className="p-12 text-center text-muted-foreground bg-card rounded-3xl border border-border shadow-xs">
            <UserCheck className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No matching students found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Check the spelling, LRN, or student name and try again. Students without LRN are recently enrolled and pending profile completion.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedStudents.map((student) => (
                <StudentClearanceCard key={student.id} student={student} />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={students.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
