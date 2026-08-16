'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCheck, Clock, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [officerName, setOfficerName] = useState('Enrollment Officer');
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/officer-session');
        const data = await res.json();
        if (data.authenticated) {
          setOfficerName(data.officer.name);
          setRemainingSeconds(data.remainingSeconds);
        } else {
          router.push('/officer/login?error=session_expired');
        }
      } catch {
        // Ignore
      }
    }
    loadSession();

    // Timer countdown tick
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/officer/login?error=session_expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/officer-logout', { method: 'POST' });
    router.push('/officer/login');
  };

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <Link href="/officer/search" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Enrollment Station</h1>
            <p className="text-[11px] text-slate-400">San Jose National High School</p>
          </div>
        </Link>

        {/* Right Info: Officer badge, 10h timer, logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Remaining 10-Hour Session Timer */}
          {remainingSeconds !== null && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
                remainingSeconds < 1800
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Time remaining before 10-hour session cutoff"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>
          )}

          {/* Officer Name */}
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-white">{officerName}</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Verified Station Account</div>
          </div>

          <button
            onClick={handleLogout}
            className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
