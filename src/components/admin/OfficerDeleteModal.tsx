'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { EnrollmentOfficer } from '@/types/database.types';

interface OfficerDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  officer: EnrollmentOfficer | null;
  onConfirmDelete: (officerId: string) => Promise<void>;
}

export default function OfficerDeleteModal({
  isOpen,
  onClose,
  officer,
  onConfirmDelete,
}: OfficerDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !officer) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirmDelete(officer.id);
      onClose();
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
            <div className="w-9 h-9 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center border border-destructive/25">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Delete Enrollment Officer</h2>
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
          {/* Officer Info Card */}
          <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
            <div className="text-sm font-bold text-foreground">{officer.full_name}</div>
            <div className="text-xs font-mono text-gabay-navy dark:text-blue-400">
              @{officer.username}
            </div>
          </div>

          {/* Warning Notice */}
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/25 text-xs space-y-1.5">
            <p className="font-semibold text-destructive">
              This action will permanently delete this enrollment officer account.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Their station access credentials will be immediately revoked and their PIN will no longer be accepted.
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
            className="h-9 px-4 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Officer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
