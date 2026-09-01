'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import DisciplinaryRecordFormModal from '@/components/lfo/DisciplinaryRecordFormModal';
import DisciplinaryDeleteModal from '@/components/lfo/DisciplinaryDeleteModal';
import Pagination from '@/components/ui/Pagination';
import { DisciplinaryRecord, Student } from '@/types/database.types';

const PAGE_SIZE = 10;

export default function LFODisciplinaryPage() {
  const [records, setRecords] = useState<DisciplinaryRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clearanceFilter, setClearanceFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DisciplinaryRecord | null>(null);
  const [clearingId, setClearingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DisciplinaryRecord | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
      setCurrentPage(1);
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

  const handleConfirmDelete = async (recordId: string) => {
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

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter((r) => {
      const studentName = `${r.student?.first_name || ''} ${r.student?.last_name || ''}`.toLowerCase();
      const desc = r.offense_description.toLowerCase();
      const sanction = r.sanction_imposed.toLowerCase();
      return studentName.includes(q) || desc.includes(q) || sanction.includes(q);
    });
  }, [records, search]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Disciplinary & Suspension Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-500/25">
              LFO Exclusive CRUD
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Maintain campus disciplinary infractions and resolve student clearance status for enrollment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="h-10 px-3.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setSelectedRecord(null);
              setIsModalOpen(true);
            }}
            className="h-10 px-4 rounded-xl bg-gabay-navy hover:bg-gabay-navy-800 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Infraction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student name, violation, or sanction..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
          />
        </div>

        <div className="flex items-center p-1 rounded-xl bg-card border border-border w-full sm:w-auto shadow-xs">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'pending', label: '🟡 Pending' },
            { id: 'cleared', label: '🟢 Cleared' },
            { id: 'non_compliant', label: '🔴 Non-Compliant' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setClearanceFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                clearanceFilter === tab.id
                  ? 'bg-gabay-navy text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
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
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-card rounded-2xl border border-border">
            <Loader2 className="w-6 h-6 animate-spin text-gabay-green" />
            <span className="text-xs">Loading disciplinary violations...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-gabay-green mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No disciplinary records found</h3>
            <p className="text-xs text-muted-foreground mt-1">There are no infractions matching the current filter.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedRecords.map((r) => {
                const isSuspendedAndActive = r.is_suspended && r.clearance_status !== 'cleared';

                return (
                  <div
                    key={r.id}
                    className={`p-5 rounded-2xl bg-card border transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs ${
                      isSuspendedAndActive
                        ? 'border-2 border-red-400 dark:border-red-600 bg-red-50/30 dark:bg-red-950/30 shadow-sm'
                        : 'border-border hover:border-gabay-green/40'
                    }`}
                  >
                    {/* Left: Info */}
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {r.student ? `${r.student.first_name} ${r.student.last_name}` : 'Student Record'}
                        </span>
                        {r.student?.grade_level && (
                          <span className="text-xs text-muted-foreground">
                            • Grade {r.student.grade_level} - {r.student.section || 'General'}
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            r.offense_category === 'grave'
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                              : r.offense_category === 'major'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {r.offense_category} Offense
                        </span>

                        {isSuspendedAndActive && (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold border border-red-700 flex items-center gap-1 shadow-xs animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Suspension Active (Hold)</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-foreground leading-relaxed font-medium">
                        &quot;{r.offense_description}&quot;
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
                          <span>Sanction:</span> {r.sanction_imposed}
                        </div>
                        <div>
                          <span>Date:</span> {new Date(r.incident_date).toLocaleDateString()}
                        </div>
                        {r.suspension_start_date && (
                          <div className="text-red-600 dark:text-red-400 font-bold">
                            Suspension: {new Date(r.suspension_start_date).toLocaleDateString()} —{' '}
                            {r.suspension_end_date ? new Date(r.suspension_end_date).toLocaleDateString() : 'Indefinite'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border shrink-0">
                      {r.clearance_status !== 'cleared' && (
                        <button
                          onClick={() => handleQuickClear(r.id)}
                          disabled={clearingId === r.id}
                          className="h-9 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
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
                        className="h-9 px-3 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setDeleteTarget(r);
                          setIsDeleteOpen(true);
                        }}
                        title="Delete Disciplinary Record"
                        className="h-9 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-600 dark:hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white dark:hover:text-white border border-red-300 dark:border-red-800 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRecords.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Disciplinary Form Modal */}
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

      {/* Disciplinary Delete Confirmation Modal */}
      <DisciplinaryDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        record={deleteTarget}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
