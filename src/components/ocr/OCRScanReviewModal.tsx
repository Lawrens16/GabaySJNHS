'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  X,
  Loader2,
  Eye,
  Edit3,
  Calendar,
  Save,
  RotateCcw,
  RefreshCw,
  Info
} from 'lucide-react';
import { SessionType } from '@/types/database.types';

interface OCRScanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  previewUrl: string | null;
  studentName?: string;
  onSaveNote: (data: {
    imageFile: File;
    ocrRaw: string;
    counselorEdited: string;
    sessionType: SessionType;
  }) => Promise<void>;
  onRetake: () => void;
}

export default function OCRScanReviewModal({
  isOpen,
  onClose,
  imageFile,
  previewUrl,
  studentName = 'Student',
  onSaveNote,
  onRetake,
}: OCRScanReviewModalProps) {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrRawText, setOcrRawText] = useState('');
  const [editedText, setEditedText] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('routine');
  const [saving, setSaving] = useState(false);
  const [ocrFailedNotice, setOcrFailedNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'image'>('review');

  useEffect(() => {
    if (isOpen && imageFile) {
      runOCR(imageFile);
    }
  }, [isOpen, imageFile]);

  const runOCR = async (file: File) => {
    setOcrLoading(true);
    setOcrFailedNotice(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Automated OCR service could not process handwriting.');
      }

      const text = data.rawText || '';
      setOcrRawText(text);
      setEditedText(text || '');
      setOcrFailedNotice(null);
    } catch (err: any) {
      console.warn('OCR note warning:', err);
      setOcrFailedNotice(
        'Automated handwriting recognition service encountered a delay or is temporarily unreachable. You can click "Retry OCR", or continue by typing notes manually and saving the picture directly.'
      );
    } finally {
      setOcrLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!imageFile) return;

    try {
      setSaving(true);

      const finalNoteText = editedText.trim() || '[Handwritten Document Scan Attached]';

      await onSaveNote({
        imageFile,
        ocrRaw: ocrRawText,
        counselorEdited: finalNoteText,
        sessionType,
      });

      onClose();
    } catch {
      // Ignored
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !previewUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-card border border-border text-foreground rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center border border-gabay-green/25 shadow-xs">
              <FileText className="w-5 h-5 text-gabay-green" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Digitize Counseling Note</h2>
              <p className="text-xs text-muted-foreground">
                Student: <span className="text-foreground font-semibold">{studentName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden border-b border-border bg-muted/40 p-1">
          <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'review'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Note Transcript</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'image'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original Scan</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Original Scanned Image */}
          <div
            className={`flex-col space-y-3 ${
              activeTab === 'image' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Original Physical Note
              </span>
              <button
                type="button"
                onClick={onRetake}
                className="text-xs text-gabay-green hover:underline flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retake Photo</span>
              </button>
            </div>

            <div className="relative flex-1 min-h-[260px] bg-muted/40 rounded-2xl border border-border overflow-hidden flex items-center justify-center p-2 group">
              <img
                src={previewUrl}
                alt="Original Scanned Note"
                className="max-h-[460px] w-auto object-contain rounded-lg shadow-xs"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur text-[10px] text-white">
                Scan Preview
              </div>
            </div>
          </div>

          {/* Right Column: OCR Text Review & Manual Editing */}
          <div
            className={`flex-col space-y-4 ${
              activeTab === 'review' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Disclaimer Alert */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <span className="font-bold">Handwritten Note Digitization</span>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  Please review and edit the transcript against your handwritten notes. You can freely type or refine observations.
                </p>
              </div>
            </div>

            {/* OCR Fallback Notice if OCR service was unreachable with Retry button */}
            {ocrFailedNotice && (
              <div className="p-3.5 rounded-2xl bg-accent text-accent-foreground border border-gabay-green/25 text-xs flex flex-col gap-2.5 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 mt-0.5 shrink-0 text-gabay-green" />
                  <p className="text-[11px] leading-relaxed">
                    {ocrFailedNotice}
                  </p>
                </div>
                {imageFile && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={ocrLoading}
                      onClick={() => runOCR(imageFile)}
                      className="h-8 px-3 rounded-lg bg-gabay-green hover:bg-gabay-green-600 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${ocrLoading ? 'animate-spin' : ''}`} />
                      <span>{ocrLoading ? 'Retrying OCR...' : 'Retry OCR Transcription'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Session Category Select */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gabay-green" />
                <span>Session Category</span>
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionType)}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gabay-green transition"
              >
                <option value="routine">Routine Check-in</option>
                <option value="intake">Initial Intake Evaluation</option>
                <option value="behavioral">Behavioral / Peer Guidance</option>
                <option value="academic">Academic & Performance Counseling</option>
                <option value="crisis">Crisis Intervention</option>
                <option value="follow_up">Follow-Up Session</option>
              </select>
            </div>

            {/* Transcribed Textarea */}
            <div className="flex-1 flex flex-col min-h-[200px]">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-gabay-green" />
                  <span>Transcribed Notes (Editable)</span>
                </label>
                <div className="flex items-center gap-2">
                  {imageFile && !ocrLoading && (
                    <button
                      type="button"
                      onClick={() => runOCR(imageFile)}
                      className="text-[11px] text-gabay-green hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry OCR</span>
                    </button>
                  )}
                  {ocrLoading && (
                    <span className="text-[11px] text-gabay-green flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Reading handwriting...</span>
                    </span>
                  )}
                </div>
              </div>

              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="Type or edit session observations here (or leave blank to save the photo directly)..."
                disabled={ocrLoading}
                rows={7}
                className="w-full flex-1 p-3.5 rounded-2xl bg-card border border-border text-foreground placeholder-muted-foreground text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-gabay-green transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-card border-t border-border flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onRetake}
            className="h-11 px-4 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Retake Photo</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCommit}
              disabled={ocrLoading || saving}
              className="h-11 px-6 rounded-xl bg-gabay-green hover:bg-gabay-green-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm active:scale-95 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Student File...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Note to File</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
