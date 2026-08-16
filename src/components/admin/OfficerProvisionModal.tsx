'use client';

import { useState } from 'react';
import { X, UserPlus, KeyRound, Copy, Check, Calendar, Sparkles, Loader2 } from 'lucide-react';

interface OfficerProvisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OfficerProvisionModal({
  isOpen,
  onClose,
  onSuccess,
}: OfficerProvisionModalProps) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdPass, setCreatedPass] = useState<{
    username: string;
    fullName: string;
    pin: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const generateRandomPin = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(randomPin);
  };

  const handleSuggestUsername = (name: string) => {
    setFullName(name);
    if (!username || username.startsWith('eo_')) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 10);
      if (slug) {
        setUsername(`eo_${slug}_2026`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || pin.length !== 6) {
      setErrorMsg('Please fill in Full Name, Username, and a 6-digit PIN.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch('/api/admin/officers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username,
          pin,
          expiresAt: new Date(expiresAt).toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to provision officer account.');
        setLoading(false);
        return;
      }

      setCreatedPass({
        username: data.officer.username,
        fullName: data.officer.full_name,
        pin: data.rawPin,
        expiresAt: data.officer.expires_at,
      });

      onSuccess();
    } catch {
      setErrorMsg('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPass = () => {
    if (!createdPass) return;
    const text = `GabaySJNHS Enrollment Officer Pass\nName: ${createdPass.fullName}\nStation Username: ${createdPass.username}\n6-Digit PIN: ${createdPass.pin}\nExpires: ${new Date(createdPass.expiresAt).toLocaleDateString()}\nPortal: https://gabaysjnhs.vercel.app/officer/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setFullName('');
    setUsername('');
    setPin('');
    setCreatedPass(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Provision Enrollment Officer</h3>
              <p className="text-xs text-slate-400">Generate Seasonal 6-Digit PIN Pass</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {!createdPass ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Officer Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => handleSuggestUsername(e.target.value)}
                placeholder="e.g. Maria Santos (Station 1)"
                required
                className="w-full h-11 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assigned Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. eo_santos_2026"
                required
                className="w-full h-11 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  6-Digit Security PIN
                </label>
                <button
                  type="button"
                  onClick={generateRandomPin}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition cursor-pointer"
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
                className="w-full h-11 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono tracking-widest text-center focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Seasonal Expiration Date</span>
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Issue Credentials</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Issued Credentials Pass Card */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm text-white">Station Pass Issued Successfully!</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono bg-black/40 p-3 rounded-xl border border-white/10">
                <div><span className="text-slate-400">Officer:</span> {createdPass.fullName}</div>
                <div><span className="text-slate-400">Username:</span> <strong className="text-purple-300">{createdPass.username}</strong></div>
                <div><span className="text-slate-400">6-Digit PIN:</span> <strong className="text-amber-300 text-sm tracking-widest">{createdPass.pin}</strong></div>
                <div><span className="text-slate-400">Expires:</span> {new Date(createdPass.expiresAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPass}
                className="flex-1 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Station Pass'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
