'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ShieldAlert, ArrowLeft, Loader2, Delete, UserCheck } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
              <UserCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Enrollment Officer Station
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Seasonal Clearance & ID Verification Station
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Officer Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. eo_santos"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* PIN Bubbles Display */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
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
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/20 scale-105'
                          : 'border-slate-700 bg-slate-800/60 text-slate-500'
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
                  className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 active:text-white border border-slate-700 text-base font-semibold text-slate-200 transition active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 text-xs font-medium transition active:scale-95 flex items-center justify-center cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('0')}
                className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 active:text-white border border-slate-700 text-base font-semibold text-slate-200 transition active:scale-95 flex items-center justify-center cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 transition active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || pin.length !== 6 || !username.trim()}
              className="w-full h-12 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
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
          <p className="text-[11px] text-slate-500 text-center mt-5 leading-relaxed">
            🔒 Session expires strictly after 10 hours. All lookups are audited with your Station ID.
          </p>

          {/* Switch to Google Staff Login */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <Link
              href="/login"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
            >
              Core Staff (Google OAuth Sign-In) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
