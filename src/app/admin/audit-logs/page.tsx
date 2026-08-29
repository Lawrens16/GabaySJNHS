'use client';

import { useState, useEffect, useMemo } from 'react';
import { Clock, RefreshCw, Loader2, Search } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { OfficerAccessLog } from '@/types/database.types';

const PAGE_SIZE = 10;

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<OfficerAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setCurrentPage(1);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter((log) => {
      const officerName = log.officer?.full_name?.toLowerCase() || '';
      const studentName = `${log.student?.first_name || ''} ${log.student?.last_name || ''}`.toLowerCase();
      const lrn = log.student?.lrn || '';
      return officerName.includes(q) || studentName.includes(q) || lrn.includes(q);
    });
  }, [logs, search]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Enrollment Officer Audit Trail
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time record of all student profile inspections performed during enrollment clearance.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="h-10 px-3.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Filter by officer name, student name, or LRN..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Enrollment Officer</th>
                <th className="px-4 py-3">Student Inspected</th>
                <th className="px-4 py-3">Grade & Section</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-gabay-green mx-auto mb-2" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/40 transition">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{new Date(log.accessed_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      {log.officer?.full_name || 'Enrollment Officer'}
                      <span className="ml-1.5 text-[10px] text-gabay-green font-mono">
                        (@{log.officer?.username || 'officer'})
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-foreground">
                        {log.student ? `${log.student.first_name} ${log.student.last_name}` : 'Student Record'}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        LRN: {log.student?.lrn || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {log.student?.grade_level ? `Grade ${log.student.grade_level} - ${log.student.section || 'General'}` : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-gabay-green/20 text-[10px] font-semibold">
                        Identity & Clearance Check
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredLogs.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
