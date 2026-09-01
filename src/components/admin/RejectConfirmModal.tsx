'use client';

import { useState } from 'react';
import { AlertTriangle, XCircle, X, Loader2 } from 'lucide-react';
import { Profile } from '@/types/database.types';

interface RejectConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile | null;
  onConfirmReject: (userId: string) => Promise<void>;
  actionLabel?: string;
}

export default function RejectConfirmModal({
  isOpen,
  onClose,
  user,
  onConfirmReject,
  actionLabel = 'Reject Account',
}: RejectConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirmReject(user.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border-2 border-red-500 dark:border-red-600 ring-4 ring-red-500/10 text-foreground rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-red-200 dark:border-red-900 flex items-center justify-between bg-red-50 dark:bg-red-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/80 text-red-600 dark:text-red-300 flex items-center justify-center border border-red-300 dark:border-red-700">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-sm font-bold text-red-700 dark:text-red-300">Confirm Account Rejection</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Staff Identity */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50 border border-border">
            <div className="w-11 h-11 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-bold text-gabay-green">
                  {user.full_name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-foreground truncate">{user.full_name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border-2 border-red-200 dark:border-red-900 text-xs space-y-1.5">
            <p className="font-bold text-red-700 dark:text-red-300">
              This will reject the account and block access to all school staff portals.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The rejected account can be restored later using the &quot;Allow Re-Application&quot; action in the approval queue. This action is reversible.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-card border-t border-border flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-9 px-4 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>{actionLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
