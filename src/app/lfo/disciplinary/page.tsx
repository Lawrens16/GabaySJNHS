'use client';

import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';
import DisciplinaryRecordFormModal from '@/components/lfo/DisciplinaryRecordFormModal';
import { DisciplinaryRecord, Student } from '@/types/database.types';

export default function LFODisciplinaryPage() {
  const [records, setRecords] = useState<DisciplinaryRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clearanceFilter, setClearanceFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DisciplinaryRecord | null>(null);
  const [clearingId, setClearingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, studentsRes] = await Promise.all([
        fetch(`/api/lfo/disciplinary?clearance=${clearanceFilter}`),
        fetch('/api/lfo/students'),
      ]);

      const [recordsData, studentsData] = await Promise.all([
        recordsRes.json(),
        studentsRes.json(),
      ]);

      if (recordsData.records) setRecords(recordsData.records);
      if (studentsData.students) setStudents(studentsData.students);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clearanceFilter]);

  const handleQuickClear = async (recordId: string) => {
    setClearingId(recordId);
    try {
      const res = await fetch('/api/lfo/disciplinary', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          clearanceStatus: 'cleared',
        }),
      });
      if (res.ok) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === recordId ? { ...r, clearance_status: 'cleared', is_suspended: false } : r
          )
        );
      }
    } finally {
      setClearingId(null);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this disciplinary record?')) return;
    try {
      const res = await fetch(`/api/lfo/disciplinary?recordId=${recordId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== recordId));
      }
    } catch {
      // Ignore
    }
  };

  const filteredRecords = records.filter((r) => {
    const q = search.toLowerCase();
    const studentName = `${r.student?.first_name || ''} ${r.student?.last_name || ''}`.toLowerCase();
    const desc = r.offense_description.toLowerCase();
    const sanction = r.sanction_imposed.toLowerCase();
    return studentName.includes(q) || desc.includes(q) || sanction.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Disciplinary & Suspension Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30">
              LFO Exclusive CRUD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maintain campus disciplinary infractions and resolve student clearance status for enrollment.
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

          <button
            onClick={() => {
              setSelectedRecord(null);
              setIsModalOpen(true);
            }}
            className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-amber-600/30 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Infraction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, violation, or sanction..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'pending', label: '🟡 Pending' },
            { id: 'cleared', label: '🟢 Cleared' },
            { id: 'non_compliant', label: '🔴 Non-Compliant' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setClearanceFilter(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                clearanceFilter === tab.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Disciplinary Records Grid / List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-slate-900/50 rounded-2xl border border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Loading disciplinary violations...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">No disciplinary records found</h3>
            <p className="text-xs text-slate-500 mt-1">There are no infractions matching the current filter.</p>
          </div>
        ) : (
          filteredRecords.map((r) => {
            const isSuspendedAndActive = r.is_suspended && r.clearance_status !== 'cleared';

            return (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur hover:border-slate-700 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-bold text-white">
                      {r.student ? `${r.student.first_name} ${r.student.last_name}` : 'Student Record'}
                    </span>
                    {r.student?.grade_level && (
                      <span className="text-xs text-slate-400">
                        • Grade {r.student.grade_level} - {r.student.section || 'General'}
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.offense_category === 'grave'
                          ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                          : r.offense_category === 'major'
                          ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {r.offense_category} Offense
                    </span>

                    {isSuspendedAndActive && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Suspension Active (Hold)</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    &quot;{r.offense_description}&quot;
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5 text-amber-300/90 font-medium">
                      <span>Sanction:</span> {r.sanction_imposed}
                    </div>
                    <div>
                      <span>Date:</span> {new Date(r.incident_date).toLocaleDateString()}
                    </div>
                    {r.suspension_start_date && (
                      <div className="text-rose-300/80">
                        Suspension: {new Date(r.suspension_start_date).toLocaleDateString()} —{' '}
                        {r.suspension_end_date ? new Date(r.suspension_end_date).toLocaleDateString() : 'Indefinite'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800 shrink-0">
                  {r.clearance_status !== 'cleared' && (
                    <button
                      onClick={() => handleQuickClear(r.id)}
                      disabled={clearingId === r.id}
                      className="h-9 px-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Grant Clearance</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedRecord(r);
                      setIsModalOpen(true);
                    }}
                    className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-300 transition flex items-center justify-center cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      <DisciplinaryRecordFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        onSuccess={fetchData}
        students={students}
        initialRecord={selectedRecord}
      />
    </div>
  );
}
