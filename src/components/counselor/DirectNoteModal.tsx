'use client';

import { useState } from 'react';
import { X, FileText, Loader2, Check, ShieldCheck, Tag } from 'lucide-react';
import { SessionType } from '@/types/database.types';

interface DirectNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName?: string;
  onSuccess: () => void;
}

export default function DirectNoteModal({
  isOpen,
  onClose,
  studentId,
  studentName = 'Student',
  onSuccess,
}: DirectNoteModalProps) {
  const [noteText, setNoteText] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('routine');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      setErrorMsg('Please write your counseling note content before saving.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append('studentId', studentId);
      formData.append('counselorEdited', noteText.trim());
      formData.append('ocrRaw', '');
      formData.append('sessionType', sessionType);

      const res = await fetch('/api/counselor/notes', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save counseling note.');
        setLoading(false);
        return;
      }

      setNoteText('');
      onSuccess();
      onClose();
    } catch {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border text-foreground rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center border border-gabay-green/25 shadow-xs">
              <FileText className="w-5 h-5 text-gabay-green" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Write Counseling Note</h3>
              <p className="text-xs text-muted-foreground">
                Student: <span className="text-foreground font-semibold">{studentName}</span>
              </p>
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
          {/* Session Category */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gabay-green" />
              <span>Session Category</span>
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
              className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-xs font-medium focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
            >
              <option value="routine">Routine Check-in</option>
              <option value="academic">Academic & Performance Counseling</option>
              <option value="behavioral">Behavioral / Peer Guidance</option>
              <option value="intake">Initial Intake Evaluation</option>
              <option value="crisis">Crisis Intervention</option>
              <option value="follow_up">Follow-Up Session</option>
            </select>
          </div>

          {/* Note Editor */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Counseling Notes & Observations *
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type your private session summary, student observations, action items, or recommendations here..."
              rows={7}
              required
              className="w-full p-3.5 rounded-2xl bg-card border border-border text-foreground placeholder-muted-foreground text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-gabay-green focus:outline-none transition resize-none font-sans"
            />
          </div>

          {/* Confidentiality Reminder */}
          <div className="p-3 rounded-xl bg-muted/60 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gabay-green shrink-0" />
            <span>Encrypted & private: Strictly isolated to authorized guidance counselors.</span>
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
              disabled={loading || !noteText.trim()}
              className="h-10 px-5 rounded-xl bg-gabay-green hover:bg-gabay-green-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Note...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Note to File</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
