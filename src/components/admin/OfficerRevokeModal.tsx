'use client';

import { useState } from 'react';
import { AlertTriangle, Power, X, Loader2, Radio } from 'lucide-react';
import { EnrollmentOfficer } from '@/types/database.types';

interface OfficerRevokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  officer: EnrollmentOfficer | null;
  onConfirmRevoke: (officerId: string) => Promise<void>;
}

export default function OfficerRevokeModal({
  isOpen,
  onClose,
  officer,
  onConfirmRevoke,
}: OfficerRevokeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !officer) return null;

  // Calculate if the officer is currently in an active 10-hour session
  const lastLoginTime = officer.last_login_at ? new Date(officer.last_login_at).getTime() : 0;
  const elapsedMs = Date.now() - lastLoginTime;
  const tenHoursMs = 10 * 3600 * 1000;
  const isLiveSession = officer.is_active && lastLoginTime > 0 && elapsedMs < tenHoursMs;

  const minutesAgo = Math.floor(elapsedMs / (60 * 1000));
  const hoursAgo = Math.floor(minutesAgo / 60);

  const formattedLoginTime =
    hoursAgo > 0 ? `${hoursAgo}h ${minutesAgo % 60}m ago` : `${minutesAgo}m ago`;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirmRevoke(officer.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border-2 border-red-500 dark:border-red-600 ring-4 ring-red-500/10 text-foreground rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-red-200 dark:border-red-900 flex items-center justify-between bg-red-50 dark:bg-red-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/80 text-red-600 dark:text-red-300 flex items-center justify-center border border-red-300 dark:border-red-700">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-sm font-bold text-red-700 dark:text-red-300">
              {isLiveSession ? 'Revoke Active Station Pass' : 'Revoke Officer Access'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Officer Info Card */}
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-1">
            <div className="text-sm font-bold text-foreground">{officer.full_name}</div>
            <div className="text-xs font-mono text-gabay-navy dark:text-blue-400">
              @{officer.username}
            </div>
          </div>

          {/* Active Live Session Warning Banner */}
          {isLiveSession ? (
            <div className="p-4 rounded-xl bg-red-100/80 dark:bg-red-950/70 border-2 border-red-500 dark:border-red-500 text-xs space-y-2 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-extrabold text-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                <span>Active Live Session in Progress</span>
              </div>
              <p className="text-red-800 dark:text-red-200 font-medium leading-relaxed">
                This Enrollment Officer logged into a station{' '}
                <strong className="underline">{formattedLoginTime}</strong> and their 10-hour pass is currently in use.
              </p>
              <div className="text-[11px] text-red-700 dark:text-red-300 bg-red-200/60 dark:bg-red-900/60 p-2 rounded-lg font-semibold">
                Revoking access will immediately disconnect this station session and terminate any active student clearance verification.
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs space-y-1.5">
              <p className="font-bold text-red-700 dark:text-red-300">
                This will revoke this officer&apos;s credentials and block station login.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can restore their access anytime by clicking &quot;Restore&quot; in the passes list.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-card border-t border-border flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-9 px-4 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Revoking...</span>
              </>
            ) : (
              <>
                <Power className="w-3.5 h-3.5" />
                <span>Confirm Revocation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
