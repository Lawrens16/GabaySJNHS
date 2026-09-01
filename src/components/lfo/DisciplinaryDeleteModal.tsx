'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { DisciplinaryRecord } from '@/types/database.types';

interface DisciplinaryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DisciplinaryRecord | null;
  onConfirmDelete: (recordId: string) => Promise<void>;
}

export default function DisciplinaryDeleteModal({
  isOpen,
  onClose,
  record,
  onConfirmDelete,
}: DisciplinaryDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !record) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirmDelete(record.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border-2 border-destructive/30 ring-2 ring-destructive/10 text-foreground rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-destructive/20 flex items-center justify-between bg-destructive/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center border border-destructive/30">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-sm font-bold text-destructive">Delete Disciplinary Record</h2>
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
          {/* Infraction Info */}
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-1">
            <div className="text-sm font-bold text-foreground">
              {record.student ? `${record.student.first_name} ${record.student.last_name}` : 'Student Record'}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              &quot;{record.offense_description}&quot;
            </p>
            <div className="text-[11px] font-semibold text-destructive pt-1">
              Sanction: {record.sanction_imposed}
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/25 text-xs space-y-1.5">
            <p className="font-semibold text-destructive">
              This action will permanently delete this disciplinary record.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If this infraction was holding the student&apos;s enrollment clearance, removing it will resolve the associated hold.
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
            className="h-9 px-4 rounded-xl bg-destructive hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
