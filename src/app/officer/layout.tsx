'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Clock, LogOut, Search } from 'lucide-react';
import GabayLogo from '@/components/brand/GabayLogo';
import ThemeToggle from '@/components/theme/ThemeToggle';
import PrivacyDisclaimerModal from '@/components/officer/PrivacyDisclaimerModal';
import StationWatermark from '@/components/officer/StationWatermark';

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [officerName, setOfficerName] = useState('Enrollment Officer');
  const [officerUsername, setOfficerUsername] = useState('eo_station');
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  const isSearchActive = pathname.startsWith('/officer/search') || pathname.startsWith('/officer/student');

  const handleAcknowledge = useCallback(() => {
    setPrivacyAcknowledged(true);
  }, []);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/officer-session');
        const data = await res.json();
        if (data.authenticated) {
          setOfficerName(data.officer.name);
          setOfficerUsername(data.officer.username || 'eo_station');
          setRemainingSeconds(data.remainingSeconds);
        } else {
          router.push('/officer/login?error=session_expired');
        }
      } catch {
        // Ignore
      }
    }
    loadSession();

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
  }, [router]);

  const handleLogout = async () => {
    // Clear the session acknowledgement on explicit logout
    sessionStorage.removeItem('gabay_eo_privacy_acknowledged');
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
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors">
      {/* Data Privacy Disclaimer — shown once per session on first load */}
      <PrivacyDisclaimerModal
        officerName={officerName}
        onAcknowledge={handleAcknowledge}
      />

      {/* Dynamic Station Watermark — applied over all pages */}
      <StationWatermark officerUsername={officerUsername} />

      {/* Top Navbar */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/officer/search" className="flex items-center gap-2.5">
            <GabayLogo size="sm" showSubtitle={false} />
          </Link>

          <Link
            href="/officer/search"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition ${
              isSearchActive
                ? 'bg-gabay-green/15 dark:bg-gabay-green/20 text-gabay-green dark:text-emerald-400 font-bold border border-gabay-green/30 dark:border-gabay-green/40 shadow-xs'
                : 'text-muted-foreground hover:text-foreground font-semibold'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clearance Verification</span>
          </Link>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {remainingSeconds !== null && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
                remainingSeconds < 1800
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 animate-pulse'
                  : 'bg-muted border-border text-foreground'
              }`}
              title="Time remaining before 10-hour session cutoff"
            >
              <Clock className="w-3.5 h-3.5 text-gabay-green shrink-0" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>
          )}

          <div className="hidden md:block text-right">
            <div className="text-xs font-bold text-foreground">{officerName}</div>
            <div className="text-[10px] text-gabay-green font-semibold">Active Station</div>
          </div>

          <ThemeToggle />

          <button
            onClick={handleLogout}
            className="h-9 px-3 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area — blurred until disclaimer acknowledged */}
      <main
        className={`flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300 ${
          !privacyAcknowledged ? 'blur-sm pointer-events-none select-none' : ''
        }`}
      >
        {children}
      </main>
    </div>
  );
}
