'use client';

import Link from 'next/link';
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function AccessDeniedPage() {
  const router = useRouter();

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
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            You do not have permission to access this area of the Gabay system. If you believe this is an error, please contact your School Administrator.
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full h-11 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-semibold text-xs transition flex items-center justify-center gap-2 active:scale-98"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full h-11 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 font-semibold text-xs transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Current Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
