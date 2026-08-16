import Link from 'next/link';
import { ShieldCheck, UserPlus, ShieldAlert, LogOut, LayoutDashboard, HeartHandshake } from 'lucide-react';

export default function LFOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex md:flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/lfo/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight">Learner Formation</h1>
                <p className="text-[11px] text-slate-400">LFO Dispatcher & Disciplinary</p>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 flex md:flex-col gap-1 overflow-x-auto">
            <Link
              href="/lfo/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white text-slate-300 transition whitespace-nowrap"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Overview Dashboard</span>
            </Link>

            <Link
              href="/lfo/students/new"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white text-slate-300 transition whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Dispatch Student Stub</span>
            </Link>

            <Link
              href="/lfo/disciplinary"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white text-slate-300 transition whitespace-nowrap"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Disciplinary Records</span>
            </Link>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 hidden md:block">
          <div className="text-[11px] text-slate-500 mb-3">
            <span className="font-semibold text-slate-400">Confidentiality Note:</span> LFOs have exclusive CRUD over disciplinary violations and zero access to counseling notes.
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
