'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Clock, RefreshCw, LogOut, HeartHandshake, Sparkles } from 'lucide-react';
import GabayLogo from '@/components/brand/GabayLogo';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function ApprovalPendingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
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
  }, [router]);

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
  }, [checkStatus]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground transition-colors">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl text-center">
          {/* Animated Icon */}
          <div className="relative w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Clock className="w-8 h-8 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-ping opacity-75" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Awaiting Staff Approval
          </h1>

          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Your Google account has been registered. The School Administrator will review your account and assign your guidance role shortly.
          </p>

          {/* User Identity Card */}
          {userEmail && (
            <div className="p-3.5 rounded-2xl bg-muted/60 border border-border text-xs text-foreground mb-6 flex items-center justify-between">
              <div className="text-left overflow-hidden">
                <div className="text-[10px] text-muted-foreground font-medium">Logged in as:</div>
                <div className="font-semibold text-foreground truncate max-w-[200px]">{userEmail}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                Pending Review
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={checkStatus}
              disabled={checking}
              className="w-full h-11 rounded-xl bg-gabay-green hover:bg-gabay-green-600 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking Status...' : 'Check Approval Status'}</span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full h-11 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-medium text-xs transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Help footer */}
          <p className="mt-8 text-[11px] text-muted-foreground">
            San Jose National High School Guidance Office Support
          </p>
        </div>
      </div>
    </div>
  );
}
