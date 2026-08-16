import Link from 'next/link';
import { UserCheck, KeyRound, FileSearch, LogOut } from 'lucide-react';
import GabayLogo from '@/components/brand/GabayLogo';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function AdminLayout({
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
            <Link href="/admin/approval-queue" className="flex items-center gap-2">
              <GabayLogo size="sm" showSubtitle={false} />
            </Link>
            <ThemeToggle />
          </div>

          <div className="px-4 py-2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            System Administration
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 flex md:flex-col gap-1 overflow-x-auto">
            <Link
              href="/admin/approval-queue"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-muted text-foreground transition whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4 text-gabay-green shrink-0" />
              <span>Staff Approval Queue</span>
            </Link>

            <Link
              href="/admin/enrollment-officers"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-muted text-foreground transition whitespace-nowrap"
            >
              <KeyRound className="w-4 h-4 text-gabay-navy dark:text-blue-400 shrink-0" />
              <span>Enrollment Officer Passes</span>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-muted text-foreground transition whitespace-nowrap"
            >
              <FileSearch className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Station Audit Logs</span>
            </Link>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-border hidden md:block">
          <div className="text-[11px] text-muted-foreground mb-3">
            <span className="font-semibold text-foreground">Privacy Note:</span> System Admins manage accounts and do not access student counseling files.
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
