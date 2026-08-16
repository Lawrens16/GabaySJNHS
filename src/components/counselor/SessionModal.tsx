'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Plus, Loader2, Check } from 'lucide-react';
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
  const [studentId, setStudentId] = useState(preselectedStudentId || (students[0]?.id || ''));
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [sessionType, setSessionType] = useState<SessionType>('routine');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !scheduledDate || !scheduledTime) {
      setErrorMsg('Please select a student and schedule date/time.');
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
          studentId,
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
      setErrorMsg('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Schedule Counseling Session</h3>
              <p className="text-xs text-slate-400">Add appointment to Daily Timetable</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Student */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Assigned Student *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} {s.grade_level ? `(Gr. ${s.grade_level})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Date *</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Time *</span>
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Session Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Session Category
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Agenda / Meeting Objectives (Optional)
            </label>
            <textarea
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder="e.g. Discuss quarterly grade drop in Math, evaluate peer conflict..."
              rows={2}
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-blue-600/30 cursor-pointer"
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
