'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, LogOut } from 'lucide-react';
import GabayLogo from '@/components/brand/GabayLogo';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/counselor/timetable',
      label: 'Daily Timetable (Today)',
      shortLabel: 'Timetable',
      icon: Calendar,
      isActive: pathname.startsWith('/counselor/timetable'),
    },
    {
      href: '/counselor/students',
      label: 'Assigned Students',
      shortLabel: 'Students',
      icon: Users,
      isActive: pathname.startsWith('/counselor/students'),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row pb-16 md:pb-0 transition-colors">
      {/* Desktop Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border hidden md:flex flex-col justify-between shrink-0 shadow-xs">
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <Link href="/counselor/timetable" className="flex items-center gap-2">
              <GabayLogo size="sm" showSubtitle={false} />
            </Link>
            <ThemeToggle />
          </div>

          <div className="px-4 py-2.5 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Guidance Counselor Workspace
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition ${
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
        <div className="p-4 border-t border-border">
          <div className="text-[11px] text-muted-foreground mb-3">
            <span className="font-semibold text-foreground">Confidentiality:</span> All notes and scans are private to your guidance account.
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

      {/* Mobile Top Header */}
      <header className="md:hidden bg-card/95 border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <Link href="/counselor/timetable" className="flex items-center gap-2">
          <GabayLogo size="sm" showSubtitle={false} />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-destructive font-medium px-2 py-1"
          >
            Exit
          </Link>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card/95 border-t border-border backdrop-blur-lg flex items-center justify-around h-16 px-3 z-40 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-full h-12 rounded-xl transition ${
                item.isActive
                  ? 'text-gabay-green dark:text-emerald-400 bg-gabay-green/10 dark:bg-gabay-green/20 font-bold'
                  : 'text-muted-foreground hover:text-foreground font-semibold'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition ${
                  item.isActive
                    ? 'text-gabay-green dark:text-emerald-400'
                    : 'text-muted-foreground'
                }`}
              />
              <span className="text-[10px]">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
