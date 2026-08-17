'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  User,
  ShieldCheck,
  Clock,
  Eye,
  Loader2
} from 'lucide-react';
import { Student } from '@/types/database.types';

export default function OfficerStudentVerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = use(params);

  const [student, setStudent] = useState<Student | null>(null);
  const [officerName, setOfficerName] = useState('');
  const [verifiedAt, setVerifiedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [inspectPhoto, setInspectPhoto] = useState(false);

  useEffect(() => {
    async function loadVerification() {
      try {
        const res = await fetch(`/api/officer/verify/${studentId}`);
        const data = await res.json();
        if (data.student) {
          setStudent(data.student);
          setOfficerName(data.officerName || 'Officer');
          setVerifiedAt(data.verifiedAt || new Date().toISOString());
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    loadVerification();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gabay-green" />
        <span className="text-xs">Verifying student enrollment clearance & logging audit record...</span>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <h2 className="text-sm font-bold text-foreground mb-2">Student Not Found</h2>
        <Link href="/officer/search" className="text-xs text-gabay-green hover:underline">
          Return to Search
        </Link>
      </div>
    );
  }

  const activeSuspension = student.disciplinary_records?.find(
    (r) => r.is_suspended && r.clearance_status !== 'cleared'
  );

  const isStub = student.profile_status === 'stub';
  const isCleared = !activeSuspension && !isStub;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Back Link */}
      <Link
        href="/officer/search"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Search Station</span>
      </Link>

      {/* CLEARANCE STATUS HERO BANNER */}
      {isCleared ? (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                CLEARED FOR ENROLLMENT
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 font-medium">
                Identity verified. Student has zero active suspensions or holds.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider shrink-0">
            PASSED CLEARANCE
          </div>
        </div>
      ) : activeSuspension ? (
        <div className="p-6 rounded-3xl bg-destructive/10 border-2 border-destructive/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-destructive/20 text-destructive flex items-center justify-center border border-destructive/40 shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                HOLD: DISCIPLINARY SUSPENSION
              </h2>
              <p className="text-xs text-destructive mt-0.5 font-medium">
                Active disciplinary sanction in progress. Refer student and parent to the Learner Formation Officer.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-destructive/20 text-destructive border border-destructive/30 text-xs font-bold uppercase tracking-wider shrink-0">
            ENROLLMENT HOLD
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                STUB: PHOTO IDENTIFICATION REQUIRED
              </h2>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5 font-medium">
                Student face photo has not been captured yet. Refer student to their assigned Guidance Counselor.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider shrink-0">
            INCOMPLETE STUB
          </div>
        </div>
      )}

      {/* STUDENT IDENTITY & PHOTO VERIFICATION CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-md flex flex-col md:flex-row items-start gap-6">
        {/* Large Mandatory Face Photo */}
        <div
          onClick={() => student.photo_url && setInspectPhoto(true)}
          className={`w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-muted border-2 overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative group ${
            student.photo_url ? 'border-gabay-green/50 cursor-pointer' : 'border-border'
          }`}
        >
          {student.photo_url ? (
            <>
              <img
                src={student.photo_url}
                alt={student.first_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-semibold gap-1">
                <Eye className="w-4 h-4" />
                <span>Enlarge</span>
              </div>
            </>
          ) : (
            <div className="text-center p-3 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-1 opacity-50" />
              <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">NO FACE PHOTO</span>
            </div>
          )}
        </div>

        {/* Student Details Grid */}
        <div className="space-y-4 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {student.first_name} {student.middle_name ? `${student.middle_name} ` : ''}{student.last_name}
            </h1>
            <div className="text-xs text-muted-foreground font-mono mt-0.5">
              DepEd LRN: <strong className="text-gabay-green text-sm">{student.lrn || 'Pending'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-muted/50 border border-border">
              <span className="text-muted-foreground block text-[11px]">Academic Grade & Section</span>
              <strong className="text-foreground text-sm">
                {student.grade_level ? `Grade ${student.grade_level} - ${student.section || 'General'}` : 'Pending'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 border border-border">
              <span className="text-muted-foreground block text-[11px]">Gender & Date of Birth</span>
              <strong className="text-foreground text-sm">
                {student.gender || 'Not specified'} •{' '}
                {student.birthdate ? new Date(student.birthdate).toLocaleDateString() : 'N/A'}
              </strong>
            </div>

            {student.guardian_name && (
              <div className="p-3 rounded-xl bg-muted/50 border border-border sm:col-span-2">
                <span className="text-muted-foreground block text-[11px]">Parent / Guardian</span>
                <strong className="text-foreground">
                  {student.guardian_name}{' '}
                  {student.guardian_contact && `(📞 ${student.guardian_contact})`}
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISCIPLINARY RECORD DETAILS (IF ANY) */}
      {student.disciplinary_records && student.disciplinary_records.length > 0 && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 border-b border-border pb-3">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-sm font-bold text-foreground">Disciplinary History Details</h3>
          </div>

          <div className="space-y-3">
            {student.disciplinary_records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-600 dark:text-rose-400 uppercase text-[11px]">
                    {rec.offense_category} Infraction
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      rec.clearance_status === 'cleared'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {rec.clearance_status}
                  </span>
                </div>

                <p className="text-foreground font-medium leading-relaxed">
                  &quot;{rec.offense_description}&quot;
                </p>

                <div className="text-muted-foreground">
                  Sanction Imposed: <strong className="text-amber-700 dark:text-amber-300">{rec.sanction_imposed}</strong>
                </div>

                {rec.suspension_start_date && (
                  <div className="text-rose-600 dark:text-rose-400 text-[11px] font-medium">
                    Suspension Period: {new Date(rec.suspension_start_date).toLocaleDateString()} —{' '}
                    {rec.suspension_end_date ? new Date(rec.suspension_end_date).toLocaleDateString() : 'Active'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT LOGGING RECEIPT */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-gabay-green" />
          <span>Verified by Officer: <strong className="text-foreground">{officerName}</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Logged at: {new Date(verifiedAt).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Enlarged Photo Modal */}
      {inspectPhoto && student.photo_url && (
        <div
          onClick={() => setInspectPhoto(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in cursor-pointer"
        >
          <div className="relative max-w-sm">
            <img
              src={student.photo_url}
              alt={student.first_name}
              className="w-full h-auto rounded-3xl shadow-2xl border-2 border-gabay-green"
            />
            <div className="text-center mt-3 text-xs text-white/80">
              Click anywhere to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
