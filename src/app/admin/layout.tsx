import Link from 'next/link';
import { UserCheck, KeyRound, ShieldAlert, FileSearch, LogOut, HeartHandshake, Shield } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation (Desktop) / Top Bar (Mobile) */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex md:flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin/approval-queue" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight">Admin Console</h1>
                <p className="text-[11px] text-slate-400">GabaySJNHS System</p>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 flex md:flex-col gap-1 overflow-x-auto">
            <Link
              href="/admin/approval-queue"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white text-slate-300 transition whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Approval Queue</span>
            </Link>

            <Link
              href="/admin/enrollment-officers"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white text-slate-300 transition whitespace-nowrap"
            >
              <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Enrollment Officers</span>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white text-slate-300 transition whitespace-nowrap"
            >
              <FileSearch className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Audit Logs</span>
            </Link>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 hidden md:block">
          <div className="text-[11px] text-slate-500 mb-3">
            <span className="font-semibold text-slate-400">Strict Privacy Mode:</span> Admins do not have access to student counseling notes.
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-rose-300 transition"
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
