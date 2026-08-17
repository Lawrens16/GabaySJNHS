import Link from 'next/link';
import { CheckCircle2, ShieldAlert, AlertTriangle, ChevronRight, User } from 'lucide-react';
import { Student } from '@/types/database.types';

interface StudentClearanceCardProps {
  student: Student;
}

export default function StudentClearanceCard({ student }: StudentClearanceCardProps) {
  const activeSuspension = student.disciplinary_records?.find(
    (r) => r.is_suspended && r.clearance_status !== 'cleared'
  );

  const isCleared = !activeSuspension && student.profile_status === 'complete';

  return (
    <Link
      href={`/officer/student/${student.id}`}
      className="p-4 sm:p-5 rounded-3xl bg-card border border-border hover:border-gabay-green/50 transition flex items-center justify-between gap-4 group shadow-xs"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Student Face Photo (Crucial for ID verification) */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-muted border-2 border-border overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={student.first_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="text-center p-1 text-muted-foreground">
              <User className="w-6 h-6 mx-auto mb-0.5 opacity-60" />
              <span className="text-[8px] font-bold uppercase text-amber-600 dark:text-amber-400">NO PHOTO</span>
            </div>
          )}
        </div>

        {/* Student Info & Status */}
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-gabay-green transition truncate">
            {student.first_name} {student.middle_name ? `${student.middle_name} ` : ''}{student.last_name}
          </h3>

          <div className="text-xs text-muted-foreground mt-0.5 font-mono">
            LRN: <strong className="text-foreground">{student.lrn || 'Pending'}</strong>
          </div>

          <div className="text-xs text-muted-foreground mt-0.5">
            {student.grade_level ? `Grade ${student.grade_level} - ${student.section || 'General'}` : 'Grade Pending'}
          </div>

          {/* Clearance Badge */}
          <div className="mt-2">
            {isCleared ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CLEARED FOR ENROLLMENT</span>
              </span>
            ) : activeSuspension ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-destructive/15 border border-destructive/30 text-destructive text-[11px] font-bold animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>HOLD: DISCIPLINARY SUSPENSION</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>STUB: PHOTO REQUIRED</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition shrink-0" />
    </Link>
  );
}
