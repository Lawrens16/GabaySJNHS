'use client';

import { useState, useEffect } from 'react';
import { FileSearch, Clock, ShieldCheck, RefreshCw, Loader2, User, Search } from 'lucide-react';
import { OfficerAccessLog } from '@/types/database.types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<OfficerAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
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

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const officerName = log.officer?.full_name?.toLowerCase() || '';
    const studentName = `${log.student?.first_name || ''} ${log.student?.last_name || ''}`.toLowerCase();
    const lrn = log.student?.lrn || '';
    return officerName.includes(q) || studentName.includes(q) || lrn.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Enrollment Officer Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time record of all student profile inspections performed during enrollment clearance.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by officer name, student name, or LRN..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Enrollment Officer</th>
                <th className="px-4 py-3">Student Inspected</th>
                <th className="px-4 py-3">Grade & Section</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto mb-2" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(log.accessed_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                      {log.officer?.full_name || 'Seasonal Officer'}
                      <span className="ml-1.5 text-[10px] text-emerald-400 font-mono">
                        (@{log.officer?.username || 'officer'})
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">
                        {log.student ? `${log.student.first_name} ${log.student.last_name}` : 'Student Record'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        LRN: {log.student?.lrn || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {log.student?.grade_level ? `Grade ${log.student.grade_level} - ${log.student.section || 'General'}` : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[10px] font-semibold">
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
    </div>
  );
}
