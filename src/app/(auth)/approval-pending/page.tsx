'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Clock, RefreshCw, LogOut, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ApprovalPendingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email || null);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();

      if (profile && profile.status === 'approved') {
        if (profile.role === 'counselor') router.push('/counselor/timetable');
        else if (profile.role === 'lfo') router.push('/lfo/dashboard');
        else if (profile.role === 'admin') router.push('/admin/approval-queue');
        else router.push('/');
      }
    } catch {
      // Ignored
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Setup Supabase Realtime channel to listen for profile approval
    const supabase = createClient();
    const channel = supabase
      .channel('profile-status-check')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.new && (payload.new as any).status === 'approved') {
            checkStatus();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Animated Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-ping opacity-75" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Waiting for Admin Approval
        </h1>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Your Google account has been registered. The System Administrator will review your account and assign your staff role shortly.
        </p>

        {/* User Identity Card */}
        {userEmail && (
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 mb-6 flex items-center justify-between">
            <div className="text-left overflow-hidden">
              <div className="text-[10px] text-slate-400 font-medium">Logged in as:</div>
              <div className="font-semibold text-white truncate max-w-[200px]">{userEmail}</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-semibold">
              Pending
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={checkStatus}
            disabled={checking}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Status...' : 'Check Status Now'}</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Help footer */}
        <p className="mt-8 text-[11px] text-slate-500">
          Need urgent access? Please contact the San Jose NHS IT Department.
        </p>
      </div>
    </div>
  );
}
