import Link from 'next/link';
import { UserPlus, ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';
import GabayLogo from '@/components/brand/GabayLogo';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function LFOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row transition-colors">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border flex md:flex-col justify-between shrink-0 shadow-xs">
        <div>
          {/* Brand */}
          <div className="p-4 md:p-5 border-b border-border flex items-center justify-between">
            <Link href="/lfo/dashboard" className="flex items-center gap-2">
              <GabayLogo size="sm" showSubtitle={false} />
            </Link>
            <ThemeToggle />
          </div>

          <div className="px-4 py-2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Learner Formation Office
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 flex md:flex-col gap-1 overflow-x-auto">
            <Link
              href="/lfo/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-muted text-foreground transition whitespace-nowrap"
            >
              <LayoutDashboard className="w-4 h-4 text-gabay-green shrink-0" />
              <span>Overview Dashboard</span>
            </Link>

            <Link
              href="/lfo/students/new"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-muted text-foreground transition whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 text-gabay-navy dark:text-blue-400 shrink-0" />
              <span>Dispatch Student Stub</span>
            </Link>

            <Link
              href="/lfo/disciplinary"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-muted text-foreground transition whitespace-nowrap"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Disciplinary Records</span>
            </Link>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-border hidden md:block">
          <div className="text-[11px] text-muted-foreground mb-3">
            <span className="font-semibold text-foreground">Formation Notice:</span> LFO maintains student stubs and campus disciplinary records.
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-destructive transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit to Main Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
