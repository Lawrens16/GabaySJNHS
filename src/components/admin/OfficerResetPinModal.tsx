'use client';

import { useState } from 'react';
import { KeyRound, Sparkles, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { EnrollmentOfficer } from '@/types/database.types';

interface OfficerResetPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  officer: EnrollmentOfficer | null;
  onSuccess: (officerId: string, newPin: string) => void;
}

export default function OfficerResetPinModal({
  isOpen,
  onClose,
  officer,
  onSuccess,
}: OfficerResetPinModalProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successPin, setSuccessPin] = useState<string | null>(null);

  if (!isOpen || !officer) return null;

  const handleGenerateRandomPin = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(randomPin);
    setErrorMsg(null);
  };

  const handleReset = () => {
    setPin('');
    setErrorMsg(null);
    setSuccessPin(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setErrorMsg('PIN must be exactly 6 numeric digits.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/officers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerId: officer.id,
          newPin: pin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to reset PIN.');
        return;
      }

      setSuccessPin(pin);
      onSuccess(officer.id, pin);
    } catch {
      setErrorMsg('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border text-foreground rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent text-accent-foreground flex items-center justify-center border border-gabay-green/25">
              <KeyRound className="w-5 h-5 text-gabay-green" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Reset Officer PIN</h2>
              <p className="text-[11px] text-muted-foreground">Set new 6-digit station PIN</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Officer Info Card */}
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <div className="text-sm font-bold text-foreground">{officer.full_name}</div>
            <div className="text-xs font-mono text-gabay-navy dark:text-blue-400">
              @{officer.username}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successPin ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  PIN Updated Successfully!
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  New 6-Digit PIN is active immediately:
                </p>
                <div className="mt-2 text-xl font-mono font-bold tracking-widest text-foreground bg-card border border-border py-2 px-4 rounded-lg inline-block">
                  {successPin}
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="w-full h-9 rounded-xl bg-gabay-green hover:bg-gabay-green-600 text-white text-xs font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    New 6-Digit Security PIN
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPin}
                    className="text-[11px] text-gabay-green hover:underline flex items-center gap-1 font-medium transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={pin}
                  maxLength={6}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 849201"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-base font-mono tracking-widest text-center focus:ring-2 focus:ring-gabay-green focus:outline-none transition font-bold"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="h-9 px-4 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold transition active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || pin.length !== 6}
                  className="h-9 px-4 rounded-xl bg-gabay-navy hover:bg-gabay-navy-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Save New PIN</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
