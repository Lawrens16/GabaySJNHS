'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ShieldAlert, ArrowLeft, Loader2, Delete, UserCheck, Sparkles } from 'lucide-react';
import GabayLogo from '@/components/brand/GabayLogo';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function OfficerLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleKeyClick = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Please enter your Assigned Username.');
      return;
    }
    if (pin.length !== 6) {
      setErrorMsg('Please enter your complete 6-digit PIN.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch('/api/auth/officer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Authentication failed. Check your username and PIN.');
        setLoading(false);
        return;
      }

      // Success -> Redirect to officer search dashboard
      router.push('/officer/search');
    } catch {
      setErrorMsg('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground transition-colors">
      <div className="w-full max-w-md space-y-4">
        {/* Top bar with back link & theme switch */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <ThemeToggle />
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <GabayLogo size="md" showSubtitle={false} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Enrollment Officer Station
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Seasonal Clearance & Student Photo Verification
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Officer Station Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. eo_santos"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full h-11 px-4 rounded-xl bg-muted/60 border border-border text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gabay-green transition"
              />
            </div>

            {/* PIN Bubbles Display */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                6-Digit Security PIN
              </label>
              <div className="flex justify-center gap-2.5 sm:gap-3 py-2">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const hasDigit = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-10 h-12 rounded-xl border flex items-center justify-center text-lg font-bold transition-all ${
                        hasDigit
                          ? 'border-gabay-green bg-accent text-gabay-green shadow-xs scale-105'
                          : 'border-border bg-muted/60 text-muted-foreground'
                      }`}
                    >
                      {hasDigit ? '•' : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Numeric Keypad (Optimized for Touch Screen & Mobile) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyClick(digit)}
                  className="h-12 rounded-xl bg-card hover:bg-muted active:bg-gabay-green active:text-white border border-border text-base font-semibold text-foreground transition active:scale-95 flex items-center justify-center cursor-pointer shadow-xs"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground text-xs font-medium transition active:scale-95 flex items-center justify-center cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('0')}
                className="h-12 rounded-xl bg-card hover:bg-muted active:bg-gabay-green active:text-white border border-border text-base font-semibold text-foreground transition active:scale-95 flex items-center justify-center cursor-pointer shadow-xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground transition active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || pin.length !== 6 || !username.trim()}
              className="w-full h-12 mt-2 rounded-xl bg-gabay-green hover:bg-gabay-green-600 disabled:opacity-50 text-white font-semibold text-sm transition shadow-md shadow-gabay-green/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Station Access...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate Station (10h Shift)</span>
                </>
              )}
            </button>
          </form>

          {/* Session Disclaimer */}
          <p className="text-[11px] text-muted-foreground text-center mt-5 leading-relaxed">
            🔒 Session expires strictly after 10 hours. All lookups are audited with your Station ID.
          </p>

          {/* Switch to Google Staff Login */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <Link
              href="/login"
              className="text-xs text-gabay-navy dark:text-blue-400 hover:underline font-medium transition"
            >
              Faculty & Staff (Google Sign In) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
