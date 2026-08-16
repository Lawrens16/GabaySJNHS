import Link from 'next/link';
import { Calendar, Users, HeartHandshake, LogOut, FileText, Camera } from 'lucide-react';

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Desktop Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 hidden md:flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/counselor/timetable" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight">Counselor Portal</h1>
                <p className="text-[11px] text-slate-400">San Jose NHS Guidance</p>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            <Link
              href="/counselor/timetable"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white text-slate-300 transition"
            >
              <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Daily Timetable (Today)</span>
            </Link>

            <Link
              href="/counselor/students"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white text-slate-300 transition"
            >
              <Users className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Assigned Students</span>
            </Link>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-500 mb-3">
            <span className="font-semibold text-slate-400">Confidentiality:</span> All notes and OCR scans are private to your counselor account.
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

      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-slate-900/90">
        <Link href="/counselor/timetable" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight">GabaySJNHS Counselor</span>
        </Link>

        <Link
          href="/"
          className="text-[11px] text-slate-400 hover:text-rose-300 font-medium transition"
        >
          Exit
        </Link>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>

      {/* Mobile-First Bottom Navigation Bar (PWA Standard) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg flex items-center justify-around h-16 px-2 z-40">
        <Link
          href="/counselor/timetable"
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-slate-400 hover:text-blue-400 active:text-blue-400"
        >
          <Calendar className="w-5 h-5 text-blue-400" />
          <span className="text-[10px] font-semibold">Timetable</span>
        </Link>

        <Link
          href="/counselor/students"
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-slate-400 hover:text-emerald-400 active:text-emerald-400"
        >
          <Users className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-semibold">Students</span>
        </Link>
      </nav>
    </div>
  );
}
