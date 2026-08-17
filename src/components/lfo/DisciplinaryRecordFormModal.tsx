'use client';

import { useState, useEffect } from 'react';
import { X, ShieldAlert, Calendar, Check, Loader2 } from 'lucide-react';
import { DisciplinaryRecord, OffenseCategory, ClearanceStatus, Student } from '@/types/database.types';

interface DisciplinaryRecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  students: Student[];
  initialRecord?: DisciplinaryRecord | null;
  preselectedStudentId?: string;
}

export default function DisciplinaryRecordFormModal({
  isOpen,
  onClose,
  onSuccess,
  students,
  initialRecord = null,
  preselectedStudentId,
}: DisciplinaryRecordFormModalProps) {
  const [studentId, setStudentId] = useState(preselectedStudentId || '');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [offenseCategory, setOffenseCategory] = useState<OffenseCategory>('minor');
  const [offenseDescription, setOffenseDescription] = useState('');
  const [sanctionImposed, setSanctionImposed] = useState('');
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionStartDate, setSuspensionStartDate] = useState('');
  const [suspensionEndDate, setSuspensionEndDate] = useState('');
  const [clearanceStatus, setClearanceStatus] = useState<ClearanceStatus>('pending');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialRecord) {
      setStudentId(initialRecord.student_id);
      setIncidentDate(initialRecord.incident_date);
      setOffenseCategory(initialRecord.offense_category);
      setOffenseDescription(initialRecord.offense_description);
      setSanctionImposed(initialRecord.sanction_imposed);
      setIsSuspended(initialRecord.is_suspended);
      setSuspensionStartDate(initialRecord.suspension_start_date || '');
      setSuspensionEndDate(initialRecord.suspension_end_date || '');
      setClearanceStatus(initialRecord.clearance_status);
    } else {
      setStudentId(preselectedStudentId || (students[0]?.id || ''));
      setIncidentDate(new Date().toISOString().split('T')[0]);
      setOffenseCategory('minor');
      setOffenseDescription('');
      setSanctionImposed('');
      setIsSuspended(false);
      setSuspensionStartDate('');
      setSuspensionEndDate('');
      setClearanceStatus('pending');
    }
  }, [initialRecord, preselectedStudentId, students, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveStudentId = studentId || preselectedStudentId || students[0]?.id;

    if (!effectiveStudentId || !offenseDescription.trim() || !sanctionImposed.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const url = '/api/lfo/disciplinary';
      const method = initialRecord ? 'PATCH' : 'POST';
      const body = initialRecord
        ? {
            recordId: initialRecord.id,
            offenseCategory,
            offenseDescription,
            sanctionImposed,
            isSuspended,
            suspensionStartDate: isSuspended ? suspensionStartDate : null,
            suspensionEndDate: isSuspended ? suspensionEndDate : null,
            clearanceStatus,
          }
        : {
            studentId: effectiveStudentId,
            incidentDate,
            offenseCategory,
            offenseDescription,
            sanctionImposed,
            isSuspended,
            suspensionStartDate: isSuspended ? suspensionStartDate : null,
            suspensionEndDate: isSuspended ? suspensionEndDate : null,
            clearanceStatus,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save disciplinary record.');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setErrorMsg('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border text-foreground rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-7 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border shrink-0 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-500/30">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {initialRecord ? 'Edit Disciplinary Record' : 'Log Student Infraction'}
              </h3>
              <p className="text-xs text-muted-foreground">LFO Disciplinary & Suspension Tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs shrink-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Select Student */}
          {!initialRecord && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Select Student *
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} {s.grade_level ? `(Gr. ${s.grade_level} - ${s.section || ''})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Offense Category & Incident Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Offense Severity *
              </label>
              <select
                value={offenseCategory}
                onChange={(e) => setOffenseCategory(e.target.value as OffenseCategory)}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
              >
                <option value="minor">Minor Offense</option>
                <option value="major">Major Offense</option>
                <option value="grave">Grave Offense</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gabay-green" />
                <span>Incident Date *</span>
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
              />
            </div>
          </div>

          {/* Offense Description */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Violation / Incident Description *
            </label>
            <textarea
              value={offenseDescription}
              onChange={(e) => setOffenseDescription(e.target.value)}
              placeholder="Detail the specific misconduct or violation..."
              rows={3}
              required
              className="w-full p-3 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition resize-none"
            />
          </div>

          {/* Sanctions Imposed */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Sanctions / Interventions Imposed *
            </label>
            <input
              type="text"
              value={sanctionImposed}
              onChange={(e) => setSanctionImposed(e.target.value)}
              placeholder="e.g. 3-day in-school suspension, community service, parent conference"
              required
              className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
            />
          </div>

          {/* Suspension Checkbox & Dates */}
          <div className="p-3.5 rounded-2xl bg-muted/60 border border-border space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSuspended}
                onChange={(e) => setIsSuspended(e.target.checked)}
                className="w-4 h-4 rounded text-gabay-green focus:ring-gabay-green border-border"
              />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                Disciplinary Suspension (Holds Enrollment Clearance)
              </span>
            </label>

            {isSuspended && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    value={suspensionStartDate}
                    onChange={(e) => setSuspensionStartDate(e.target.value)}
                    required={isSuspended}
                    className="w-full h-9 px-3 rounded-lg bg-card border border-border text-foreground text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">End Date</label>
                  <input
                    type="date"
                    value={suspensionEndDate}
                    onChange={(e) => setSuspensionEndDate(e.target.value)}
                    required={isSuspended}
                    className="w-full h-9 px-3 rounded-lg bg-card border border-border text-foreground text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clearance Status */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Clearance Status
            </label>
            <select
              value={clearanceStatus}
              onChange={(e) => setClearanceStatus(e.target.value as ClearanceStatus)}
              className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
            >
              <option value="pending">🟡 Pending / In Progress</option>
              <option value="served">🔵 Sanctions Served</option>
              <option value="cleared">🟢 Cleared by LFO</option>
              <option value="non_compliant">🔴 Non-Compliant / Hold</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 rounded-xl bg-gabay-navy hover:bg-gabay-navy-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Record...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{initialRecord ? 'Update Record' : 'Save Disciplinary Record'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
