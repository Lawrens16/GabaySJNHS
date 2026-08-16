'use client';

import Link from 'next/link';
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AccessDeniedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          You do not have permission to access this area of the GabaySJNHS system. If you believe this is an error, please contact the System Administrator.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition flex items-center justify-center gap-2 active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full h-11 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 font-semibold text-xs transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Current Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
