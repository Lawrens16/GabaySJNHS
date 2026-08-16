'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Sparkles,
  Eye,
  Edit3,
  Calendar,
  Save,
  RotateCcw
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'image'>('review');

  useEffect(() => {
    if (isOpen && imageFile) {
      runOCR(imageFile);
    }
  }, [isOpen, imageFile]);

  const runOCR = async (file: File) => {
    setOcrLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract text from scan.');
      }

      const text = data.rawText || '';
      setOcrRawText(text);
      setEditedText(text || 'No clear handwritten text detected. You can type counseling notes here manually.');
    } catch (err: any) {
      console.warn('OCR error:', err);
      setErrorMsg(err.message || 'OCR service was unable to parse the document. You can still type notes manually.');
      setEditedText('');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!imageFile) return;
    if (!editedText.trim()) {
      setErrorMsg('Please ensure there is text content in the note before saving.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      await onSaveNote({
        imageFile,
        ocrRaw: ocrRawText,
        counselorEdited: editedText.trim(),
        sessionType,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save counseling note.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !previewUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Digitize Counseling Note</h2>
              <p className="text-xs text-slate-400">Student: <span className="text-slate-200 font-semibold">{studentName}</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden border-b border-slate-800 bg-slate-950/50 p-1">
          <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'review'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Transcribed Note</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'image'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original Scan</span>
          </button>
        </div>

        {/* Body Content: Split View (Side-by-Side on Desktop, Tabs on Mobile) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Original Scanned Image */}
          <div
            className={`flex-col space-y-3 ${
              activeTab === 'image' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Original Physical Note
              </span>
              <button
                type="button"
                onClick={onRetake}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retake Scan</span>
              </button>
            </div>

            <div className="relative flex-1 min-h-[260px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-2 group">
              <img
                src={previewUrl}
                alt="Original Scanned Note"
                className="max-h-[460px] w-auto object-contain rounded-lg shadow-md"
              />
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur text-[10px] text-slate-300">
                Pinch / Click to inspect
              </div>
            </div>
          </div>

          {/* Right Column: OCR Text Review & Editing */}
          <div
            className={`flex-col space-y-4 ${
              activeTab === 'review' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Handwriting Accuracy Disclaimer Alert */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
              <div className="space-y-1">
                <span className="font-bold">OCR Accuracy Disclaimer</span>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Automated handwriting OCR is an AI assistant tool. Please carefully proofread and edit the transcript below against the original scan before saving.
                </p>
              </div>
            </div>

            {/* Error banner if OCR had issue */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Session Type Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Session Category</span>
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionType)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
            <div className="flex-1 flex flex-col min-h-[220px]">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Transcribed Notes (Editable)</span>
                </label>
                {ocrLoading && (
                  <span className="text-[11px] text-blue-400 flex items-center gap-1 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing handwriting OCR...</span>
                  </span>
                )}
              </div>

              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="Transcribed counseling notes will appear here. You can edit, fix typos, or add details..."
                disabled={ocrLoading}
                rows={8}
                className="w-full flex-1 p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onRetake}
            className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Retake Scan</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCommit}
              disabled={ocrLoading || saving || !editedText.trim()}
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Bucket & DB...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Digitized Note</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
