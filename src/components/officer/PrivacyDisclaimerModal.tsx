'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, LogOut, Check } from 'lucide-react';
import Link from 'next/link';

const SESSION_KEY = 'gabay_eo_privacy_acknowledged';

interface PrivacyDisclaimerModalProps {
  officerName?: string;
  onAcknowledge: () => void;
}

export default function PrivacyDisclaimerModal({
  officerName,
  onAcknowledge,
}: PrivacyDisclaimerModalProps) {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Show once per browser session (cleared on tab close / logout)
    const alreadyAcknowledged = sessionStorage.getItem(SESSION_KEY);
    if (!alreadyAcknowledged) {
      setVisible(true);
    } else {
      onAcknowledge();
    }
  }, [onAcknowledge]);

  const handleConfirm = () => {
    if (!checked) return;
    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(false);
    onAcknowledge();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border-2 border-gabay-navy/40 dark:border-blue-600/40 ring-4 ring-gabay-navy/10 text-foreground rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-gabay-navy/5 dark:bg-blue-950/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gabay-navy/10 dark:bg-blue-900/50 border border-gabay-navy/25 dark:border-blue-700/50 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-gabay-navy dark:text-blue-300" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gabay-navy dark:text-blue-100 leading-tight">
              Data Privacy Notice
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Enrollment Clearance Station — Republic Act No. 10173
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-xs leading-relaxed">
          {officerName && (
            <p className="text-sm font-semibold text-foreground">
              Welcome, <span className="text-gabay-green">{officerName}</span>.
            </p>
          )}

          <p className="text-muted-foreground">
            This station has access to{' '}
            <strong className="text-foreground">sensitive personal information (SPI)</strong> of
            enrolled learners, protected under{' '}
            <strong className="text-foreground">Republic Act No. 10173</strong> (Data Privacy Act of
            2012) and DepEd Order No. 52 s. 2011.
          </p>

          <ul className="space-y-2 text-muted-foreground">
            {[
              'All student lookups at this station are automatically recorded in the school audit log, linked to your account.',
              'You are strictly prohibited from photographing, screenshotting, or copying any student record displayed on this screen.',
              'A dynamic watermark identifying your station is visible on all pages and will appear in any screenshots taken.',
              'Unauthorized disclosure, sharing, or reproduction of student data is a criminal offense under RA 10173 and may result in immediate termination and prosecution.',
              'Your session expires automatically after 10 hours. Log out when leaving the station unattended.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gabay-navy dark:bg-blue-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-[11px] font-medium">
            By proceeding, you confirm you have read and understood these obligations. This acknowledgement is logged.
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => setChecked((c) => !c)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                checked
                  ? 'bg-gabay-green border-gabay-green'
                  : 'border-border group-hover:border-gabay-green/60'
              }`}
            >
              {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition">
              I understand my legal obligations under RA 10173. I will not photograph, copy, or share any student information displayed on this station.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-card border-t border-border flex items-center justify-between gap-3">
          <Link
            href="/officer/login"
            onClick={() => sessionStorage.removeItem(SESSION_KEY)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit & Logout</span>
          </Link>

          <button
            onClick={handleConfirm}
            disabled={!checked}
            className="h-10 px-6 rounded-xl bg-gabay-green hover:bg-gabay-green/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
          >
            <Check className="w-3.5 h-3.5" />
            <span>I Acknowledge & Proceed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
