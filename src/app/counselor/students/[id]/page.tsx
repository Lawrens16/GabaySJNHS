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
  Eye,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import CameraCaptureModal from '@/components/camera/CameraCaptureModal';
import OCRScanReviewModal from '@/components/ocr/OCRScanReviewModal';
import DirectNoteModal from '@/components/counselor/DirectNoteModal';
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
  const [isDirectNoteOpen, setIsDirectNoteOpen] = useState(false);
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
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gabay-green" />
        <span className="text-xs">Loading student counseling records...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <h2 className="text-sm font-bold text-foreground mb-2">Student Not Found</h2>
        <Link href="/counselor/students" className="text-xs text-gabay-green hover:underline">
          Return to Student Caseload Directory
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
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assigned Caseload</span>
      </Link>

      {/* STUDENT PROFILE HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Face Photo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-muted border-2 border-border overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative">
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={student.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-amber-600 dark:text-amber-400">
                <Camera className="w-8 h-8 mx-auto mb-1 opacity-70" />
                <span className="text-[9px] font-bold">NO PHOTO</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {student.first_name} {student.middle_name ? `${student.middle_name} ` : ''}{student.last_name}
              </h1>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isStub
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {student.profile_status}
              </span>

              {hasSuspension && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold border border-red-700 shadow-xs">
                  Disciplinary Hold
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div>
                Grade: <strong className="text-foreground">{student.grade_level || 'Pending'}</strong> • Section:{' '}
                <strong className="text-foreground">{student.section || 'General'}</strong>
              </div>
              <div>
                LRN: <span className="font-mono text-gabay-navy dark:text-blue-400 font-semibold">{student.lrn || 'Pending Photo Capture'}</span>
              </div>
              {student.birthdate && (
                <div>
                  DOB: {new Date(student.birthdate).toLocaleDateString()}
                </div>
              )}
            </div>

            {student.guardian_name && (
              <div className="text-xs text-muted-foreground flex items-center gap-2 pt-0.5">
                <span>Guardian: <strong className="text-foreground">{student.guardian_name}</strong></span>
                {student.guardian_contact && (
                  <span className="text-gabay-navy dark:text-blue-400 font-mono">• 📞 {student.guardian_contact}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap md:flex-col gap-2 shrink-0 w-full sm:w-auto">
          {isStub ? (
            <Link
              href={`/counselor/students/${student.id}/complete-profile`}
              className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 flex-1 sm:flex-initial"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Photo & Complete</span>
            </Link>
          ) : (
            <>
              <button
                onClick={() => setIsDirectNoteOpen(true)}
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-gabay-green hover:bg-gabay-green-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer flex-1 sm:flex-initial"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Write Direct Note</span>
              </button>

              <button
                onClick={() => setIsCameraOpen(true)}
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-gabay-navy hover:bg-gabay-navy-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer flex-1 sm:flex-initial"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan Note (OCR)</span>
              </button>

              <button
                onClick={() => setIsScheduleOpen(true)}
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs flex-1 sm:flex-initial"
              >
                <Calendar className="w-3.5 h-3.5 text-gabay-green" />
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
          <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gabay-green" />
                <h2 className="text-sm font-bold text-foreground">Counseling Notes & Digitized Transcripts</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDirectNoteOpen(true)}
                  className="text-xs text-gabay-green hover:underline font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Write Note</span>
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="text-xs text-gabay-navy dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Note</span>
                </button>
              </div>
            </div>

            {notes.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground bg-muted/40 rounded-2xl border border-border">
                No counseling notes recorded yet. Click &quot;Write Direct Note&quot; or &quot;Scan Physical Note (OCR)&quot; to add a session record.
              </div>
            ) : (
              <div className="space-y-3.5">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-muted/50 border border-border hover:border-gabay-green/40 transition flex flex-col sm:flex-row items-start gap-4 shadow-xs"
                  >
                    {/* Clickable Original Thumbnail if photo exists */}
                    {note.image_url ? (
                      <div
                        onClick={() => setInspectImageUrl(note.image_url)}
                        className="w-full sm:w-28 h-28 rounded-xl bg-card border border-border overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group relative shadow-xs"
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
                    ) : (
                      <div className="w-full sm:w-14 h-14 rounded-xl bg-accent text-accent-foreground border border-gabay-green/25 flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-6 h-6 text-gabay-green" />
                      </div>
                    )}

                    {/* Note Content */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{new Date(note.created_at).toLocaleString()}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-gabay-green/20 text-[10px] font-semibold">
                          {note.image_url ? 'OCR Document Scan' : 'Direct Typed Note'}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {note.counselor_edited_text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session History Section */}
          <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gabay-green" />
                <h2 className="text-sm font-bold text-foreground">Counseling Session History</h2>
              </div>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="text-xs text-gabay-green hover:underline font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule a Session</span>
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground bg-muted/40 rounded-2xl border border-border">
                No past counseling appointments recorded.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3.5 rounded-xl bg-muted/50 border border-border flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {new Date(sess.scheduled_at).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-muted-foreground capitalize">
                        Category: <strong className="text-foreground">{sess.session_type}</strong>
                        {sess.summary_notes && ` • Agenda: ${sess.summary_notes}`}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        sess.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
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
          <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <h2 className="text-sm font-bold text-foreground">Disciplinary Record History</h2>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Read-Only • Exclusively maintained by Learner Formation Officers
              </p>
            </div>

            {disciplinaryRecords.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">Clean Disciplinary Record</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">No violations or suspensions recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {disciplinaryRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-1.5 text-xs shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-[10px] tracking-wider text-rose-600 dark:text-rose-400">
                        {rec.offense_category} Offense
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rec.clearance_status === 'cleared'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {rec.clearance_status}
                      </span>
                    </div>

                    <p className="text-foreground font-medium leading-tight">
                      &quot;{rec.offense_description}&quot;
                    </p>

                    <div className="text-[11px] text-muted-foreground">
                      Sanction: <span className="text-amber-700 dark:text-amber-300 font-semibold">{rec.sanction_imposed}</span>
                    </div>

                    <div className="text-[10px] text-muted-foreground">
                      Date: {new Date(rec.incident_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Direct Typed Note Modal */}
      <DirectNoteModal
        isOpen={isDirectNoteOpen}
        onClose={() => setIsDirectNoteOpen(false)}
        studentId={student.id}
        studentName={`${student.first_name} ${student.last_name}`}
        onSuccess={fetchStudentData}
      />

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={inspectImageUrl}
              alt="Inspected Note Scan"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <div className="text-center mt-3 text-xs text-white/80">
              Click anywhere to close preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
