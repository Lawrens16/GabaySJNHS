'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Loader2, Check } from 'lucide-react';
import { Student, SessionType } from '@/types/database.types';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  students: Student[];
  preselectedStudentId?: string;
}

export default function SessionModal({
  isOpen,
  onClose,
  onSuccess,
  students,
  preselectedStudentId,
}: SessionModalProps) {
  const [studentId, setStudentId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [sessionType, setSessionType] = useState<SessionType>('routine');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize studentId whenever modal opens or students list updates
  useEffect(() => {
    if (isOpen) {
      if (preselectedStudentId) {
        setStudentId(preselectedStudentId);
      } else if (students && students.length > 0) {
        setStudentId(students[0].id);
      }
      setErrorMsg(null);
    }
  }, [isOpen, preselectedStudentId, students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveStudentId = studentId || preselectedStudentId || students[0]?.id;

    if (!effectiveStudentId || !scheduledDate || !scheduledTime) {
      setErrorMsg('Please select a student and set the schedule date and time.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

      const res = await fetch('/api/counselor/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: effectiveStudentId,
          scheduledAt,
          sessionType,
          summaryNotes: summaryNotes.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to schedule counseling session.');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border text-foreground rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center border border-gabay-green/25 shadow-xs">
              <Calendar className="w-5 h-5 text-gabay-green" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Schedule Counseling Session</h3>
              <p className="text-xs text-muted-foreground">Add appointment to Daily Timetable</p>
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
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Student */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Select Assigned Student *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-xs font-medium focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
            >
              {students.length === 0 ? (
                <option value="">No assigned students found</option>
              ) : (
                students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} {s.grade_level ? `(Gr. ${s.grade_level})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gabay-green" />
                <span>Date *</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gabay-green" />
                <span>Time *</span>
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-xl bg-card border border-border text-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
              />
            </div>
          </div>

          {/* Session Category */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Session Category
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
              className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-xs font-medium focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
            >
              <option value="routine">Routine Check-in</option>
              <option value="academic">Academic & Study Habits</option>
              <option value="behavioral">Behavioral / Peer Guidance</option>
              <option value="intake">Initial Intake Evaluation</option>
              <option value="crisis">Crisis Intervention</option>
              <option value="follow_up">Follow-Up Session</option>
            </select>
          </div>

          {/* Pre-session Notes */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Session Objective / Agenda (Optional)
            </label>
            <textarea
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder="e.g. Discuss quarterly progress, evaluate study plan..."
              rows={2}
              className="w-full p-3 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || students.length === 0}
              className="h-10 px-5 rounded-xl bg-gabay-green hover:bg-gabay-green-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Add to Timetable</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
