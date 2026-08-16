'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  FileText,
  Calendar,
  ShieldAlert,
  Plus,
  Loader2,
  Clock,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  CreditCard,
  HeartHandshake
} from 'lucide-react';
import CameraCaptureModal from '@/components/camera/CameraCaptureModal';
import OCRScanReviewModal from '@/components/ocr/OCRScanReviewModal';
import SessionModal from '@/components/counselor/SessionModal';
import { CompressionResult } from '@/lib/image-compression';
import { Student, CounselingNote, CounselingSession, DisciplinaryRecord, SessionType } from '@/types/database.types';

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = use(params);

  const [student, setStudent] = useState<Student | null>(null);
  const [notes, setNotes] = useState<CounselingNote[]>([]);
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [disciplinaryRecords, setDisciplinaryRecords] = useState<DisciplinaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scannedDoc, setScannedDoc] = useState<CompressionResult | null>(null);
  const [isOCRReviewOpen, setIsOCRReviewOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [inspectImageUrl, setInspectImageUrl] = useState<string | null>(null);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/counselor/students/${studentId}`);
      const data = await res.json();
      if (data.student) setStudent(data.student);
      if (data.notes) setNotes(data.notes);
      if (data.sessions) setSessions(data.sessions);
      if (data.disciplinaryRecords) setDisciplinaryRecords(data.disciplinaryRecords);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const handleDocCaptured = (result: CompressionResult) => {
    setScannedDoc(result);
    setIsOCRReviewOpen(true);
  };

  const handleSaveNote = async (data: {
    imageFile: File;
    ocrRaw: string;
    counselorEdited: string;
    sessionType: SessionType;
  }) => {
    const formData = new FormData();
    formData.append('image', data.imageFile);
    formData.append('studentId', studentId);
    formData.append('ocrRaw', data.ocrRaw);
    formData.append('counselorEdited', data.counselorEdited);
    formData.append('sessionType', data.sessionType);

    const res = await fetch('/api/counselor/notes', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      fetchStudentData();
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="text-xs">Loading student counseling records...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-400">
        <h2 className="text-sm font-bold text-white mb-2">Student Not Found</h2>
        <Link href="/counselor/students" className="text-xs text-blue-400 hover:underline">
          Return to Student Directory
        </Link>
      </div>
    );
  }

  const isStub = student.profile_status === 'stub';
  const hasSuspension = disciplinaryRecords.some(
    (r) => r.is_suspended && r.clearance_status !== 'cleared'
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Back Link */}
      <Link
        href="/counselor/students"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assigned Directory</span>
      </Link>

      {/* STUDENT PROFILE HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Face Photo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-950 border-2 border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-lg relative">
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={student.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-amber-400">
                <Camera className="w-8 h-8 mx-auto mb-1 opacity-70" />
                <span className="text-[9px] font-bold">NO PHOTO</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {student.first_name} {student.middle_name ? `${student.middle_name} ` : ''}{student.last_name}
              </h1>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isStub
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {student.profile_status}
              </span>

              {hasSuspension && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                  Disciplinary Hold
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <div>
                Grade: <strong>{student.grade_level || 'Pending'}</strong> • Section:{' '}
                <strong>{student.section || 'General'}</strong>
              </div>
              <div>
                LRN: <span className="font-mono text-blue-300">{student.lrn || 'Pending Photo Capture'}</span>
              </div>
              {student.birthdate && (
                <div>
                  DOB: {new Date(student.birthdate).toLocaleDateString()}
                </div>
              )}
            </div>

            {student.guardian_name && (
              <div className="text-xs text-slate-400 flex items-center gap-2 pt-0.5">
                <span>Guardian: {student.guardian_name}</span>
                {student.guardian_contact && (
                  <span className="text-blue-300 font-mono">• 📞 {student.guardian_contact}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
          {isStub ? (
            <Link
              href={`/counselor/students/${student.id}/complete-profile`}
              className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Photo & Complete</span>
            </Link>
          ) : (
            <>
              <button
                onClick={() => setIsCameraOpen(true)}
                className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Physical Note (OCR)</span>
              </button>

              <button
                onClick={() => setIsScheduleOpen(true)}
                className="h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Session</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* THREE TABS / SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: DIGITIZED NOTES & SESSIONS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Digitized Counseling Notes Section */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white">Digitized Counseling Notes & OCR Transcripts</h2>
              </div>
              <button
                onClick={() => setIsCameraOpen(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Note Scan</span>
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                No digitized notes recorded yet. Click &quot;Scan Physical Note (OCR)&quot; to photograph handwritten counseling sheets.
              </div>
            ) : (
              <div className="space-y-3.5">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition flex flex-col sm:flex-row items-start gap-4"
                  >
                    {/* Clickable Original Thumbnail */}
                    <div
                      onClick={() => setInspectImageUrl(note.image_url)}
                      className="w-full sm:w-28 h-28 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group relative shadow-md"
                    >
                      <img
                        src={note.image_url}
                        alt="Scanned Note"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Note Content */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(note.created_at).toLocaleString()}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-300 text-[10px] font-semibold">
                          OCR Verified
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {note.counselor_edited_text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session History Section */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Counseling Session History</h2>
              </div>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                No past counseling appointments recorded.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        {new Date(sess.scheduled_at).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        Category: <strong className="text-slate-300">{sess.session_type}</strong>
                        {sess.summary_notes && ` • Agenda: ${sess.summary_notes}`}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        sess.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {sess.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: READ-ONLY DISCIPLINARY HISTORY FROM LFO */}
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-xl space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <h2 className="text-sm font-bold text-white">Disciplinary History</h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Read-Only • Exclusively maintained by Learner Formation Officers
              </p>
            </div>

            {disciplinaryRecords.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
                <span className="font-semibold">Clean Disciplinary Record</span>
                <p className="text-[10px] text-slate-400 mt-0.5">No violations or suspensions recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {disciplinaryRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-[10px] tracking-wider text-rose-300">
                        {rec.offense_category} Offense
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rec.clearance_status === 'cleared'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {rec.clearance_status}
                      </span>
                    </div>

                    <p className="text-slate-300 font-medium leading-tight">
                      &quot;{rec.offense_description}&quot;
                    </p>

                    <div className="text-[11px] text-slate-400">
                      Sanction: <span className="text-amber-300">{rec.sanction_imposed}</span>
                    </div>

                    <div className="text-[10px] text-slate-500">
                      Date: {new Date(rec.incident_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Capture for Physical Notes */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureComplete={handleDocCaptured}
        mode="document"
        title="Scan Physical Handwritten Note"
      />

      {/* OCR Review & Handwriting Disclaimer Modal */}
      {scannedDoc && (
        <OCRScanReviewModal
          isOpen={isOCRReviewOpen}
          onClose={() => {
            setIsOCRReviewOpen(false);
            setScannedDoc(null);
          }}
          imageFile={scannedDoc.file}
          previewUrl={scannedDoc.previewUrl}
          studentName={`${student.first_name} ${student.last_name}`}
          onSaveNote={handleSaveNote}
          onRetake={() => {
            setIsOCRReviewOpen(false);
            setIsCameraOpen(true);
          }}
        />
      )}

      {/* Schedule Session Modal */}
      <SessionModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={fetchStudentData}
        students={[student]}
        preselectedStudentId={student.id}
      />

      {/* Image Inspection Zoom Modal */}
      {inspectImageUrl && (
        <div
          onClick={() => setInspectImageUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={inspectImageUrl}
              alt="Inspected Note Scan"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <div className="text-center mt-3 text-xs text-slate-400">
              Click anywhere to close preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
