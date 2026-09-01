'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCheck, KeyRound, FileSearch, LogOut } from 'lucide-react';
import GabayLogo from '@/components/brand/GabayLogo';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/admin/approval-queue',
      label: 'Staff Approval Queue',
      icon: UserCheck,
      isActive: pathname.startsWith('/admin/approval-queue'),
    },
    {
      href: '/admin/enrollment-officers',
      label: 'Enrollment Officer Passes',
      icon: KeyRound,
      isActive: pathname.startsWith('/admin/enrollment-officers'),
    },
    {
      href: '/admin/audit-logs',
      label: 'Station Audit Logs',
      icon: FileSearch,
      isActive: pathname.startsWith('/admin/audit-logs'),
    },
  ];

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

          <div className="px-4 py-2.5 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            System Administration
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5 flex md:flex-col gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition whitespace-nowrap ${
                    item.isActive
                      ? 'bg-gabay-green/15 dark:bg-gabay-green/20 text-gabay-green dark:text-emerald-400 font-bold border border-gabay-green/30 dark:border-gabay-green/40 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70 font-semibold border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition ${
                      item.isActive
                        ? 'text-gabay-green dark:text-emerald-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
