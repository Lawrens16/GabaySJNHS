'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  KeyRound,
  UserPlus,
  Clock,
  RefreshCw,
  Power,
  Loader2,
  Calendar,
  UserCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import OfficerProvisionModal from '@/components/admin/OfficerProvisionModal';
import OfficerDeleteModal from '@/components/admin/OfficerDeleteModal';
import OfficerResetPinModal from '@/components/admin/OfficerResetPinModal';
import Pagination from '@/components/ui/Pagination';
import { EnrollmentOfficer } from '@/types/database.types';

const PAGE_SIZE = 6;

export default function EnrollmentOfficersPage() {
  const [officers, setOfficers] = useState<EnrollmentOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<EnrollmentOfficer | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [resetPinTarget, setResetPinTarget] = useState<EnrollmentOfficer | null>(null);
  const [isResetPinOpen, setIsResetPinOpen] = useState(false);

  // Visible PINs toggle state: map of officerId -> boolean
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});

  // Local PIN store: allows immediate visibility when created/reset even before page refresh
  const [localPins, setLocalPins] = useState<Record<string, string>>({});

  // Copy status feedback: map of copyKey -> boolean
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/officers');
      const data = await res.json();
      if (data.officers) {
        setOfficers(data.officers);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleToggleActive = async (officerId: string, currentActive: boolean) => {
    setTogglingId(officerId);
    try {
      const res = await fetch('/api/admin/officers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId, isActive: !currentActive }),
      });
      if (res.ok) {
        setOfficers((prev) =>
          prev.map((o) => (o.id === officerId ? { ...o, is_active: !currentActive } : o))
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteOfficer = async (officerId: string) => {
    try {
      const res = await fetch(`/api/admin/officers?officerId=${officerId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setOfficers((prev) => prev.filter((o) => o.id !== officerId));
      }
    } catch {
      // Ignore
    }
  };

  const handlePinResetSuccess = (officerId: string, newPin: string) => {
    setLocalPins((prev) => ({ ...prev, [officerId]: newPin }));
    setVisiblePins((prev) => ({ ...prev, [officerId]: true }));
    setOfficers((prev) =>
      prev.map((o) => (o.id === officerId ? { ...o, pin_code: newPin } : o))
    );
  };

  const togglePinVisibility = (officerId: string) => {
    setVisiblePins((prev) => ({
      ...prev,
      [officerId]: !prev[officerId],
    }));
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    } catch {
      // Fallback
    }
  };

  // Copy full credential pass: username + tab + pin for instant form paste
  const handleCopyPass = async (officer: EnrollmentOfficer) => {
    const pinVal = localPins[officer.id] || officer.pin_code || '';
    const combined = pinVal ? `${officer.username}\t${pinVal}` : officer.username;
    await copyToClipboard(combined, `pass-${officer.id}`);
  };

  // Pagination calculations
  const totalPages = Math.ceil(officers.length / PAGE_SIZE) || 1;
  const paginatedOfficers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return officers.slice(start, start + PAGE_SIZE);
  }, [officers, currentPage]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Enrollment Officers
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage individualized station credentials (6-Digit PINs) with strictly audited 10-hour sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOfficers}
            disabled={loading}
            className="h-10 px-3.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsProvisionOpen(true)}
            className="h-10 px-4 rounded-xl bg-gabay-navy hover:bg-gabay-navy-800 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision Officer</span>
          </button>
        </div>
      </div>

      {/* Officers List Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-card rounded-2xl border border-border">
            <Loader2 className="w-6 h-6 animate-spin text-gabay-green" />
            <span className="text-xs">Loading officer credentials...</span>
          </div>
        ) : officers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border shadow-xs">
            <KeyRound className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No Enrollment Officers Provisioned</h3>
            <p className="text-xs text-muted-foreground mt-1">Click &quot;Provision Officer&quot; above to create a credential pass.</p>
          </div>
        ) : (
          paginatedOfficers.map((officer) => {
            const isExpired = new Date(officer.expires_at) <= new Date();
            const isPinVisible = Boolean(visiblePins[officer.id]);
            const activePin = localPins[officer.id] || officer.pin_code;
            const isPassCopied = copiedKey === `pass-${officer.id}`;
            const isUsernameCopied = copiedKey === `user-${officer.id}`;
            const isPinCopied = copiedKey === `pin-${officer.id}`;

            return (
              <div
                key={officer.id}
                className="p-5 rounded-2xl bg-card border border-border hover:border-gabay-green/40 transition flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Card Header: Avatar, Status Badge & Delete Button */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center border border-gabay-green/25 shrink-0 shadow-xs">
                      <UserCheck className="w-5 h-5 text-gabay-green" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          !officer.is_active
                            ? 'bg-destructive/15 text-destructive border border-destructive/25'
                            : isExpired
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {!officer.is_active ? 'Revoked' : isExpired ? 'Expired' : 'Active'}
                      </span>

                      {/* Delete Officer Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(officer);
                          setIsDeleteOpen(true);
                        }}
                        title="Delete Officer"
                        className="w-7 h-7 rounded-lg bg-destructive/15 hover:bg-destructive text-destructive hover:text-white border border-destructive/30 flex items-center justify-center transition active:scale-95 shadow-xs cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-foreground mb-1.5">{officer.full_name}</h3>

                  {/* Credentials Box: Username & 6-Digit PIN */}
                  <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-2 mb-3">
                    {/* Username with clean copy */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs font-mono">
                        <span className="text-muted-foreground select-none">@</span>
                        <span className="font-bold text-foreground">{officer.username}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(officer.username, `user-${officer.id}`)}
                        title="Copy Clean Username"
                        className="h-6 px-1.5 rounded bg-card hover:bg-muted border border-border text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition cursor-pointer"
                      >
                        {isUsernameCopied ? (
                          <Check className="w-3 h-3 text-gabay-green" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{isUsernameCopied ? 'Copied' : 'User'}</span>
                      </button>
                    </div>

                    {/* PIN with Eye Reveal, Copy and Reset */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-muted-foreground">PIN:</span>
                        {isPinVisible ? (
                          activePin ? (
                            <span className="text-xs font-mono font-bold tracking-widest text-foreground bg-accent/60 px-1.5 py-0.5 rounded border border-gabay-green/20">
                              {activePin}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setResetPinTarget(officer);
                                setIsResetPinOpen(true);
                              }}
                              className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                              title="Legacy pass created before PIN storage. Click to set a new PIN."
                            >
                              <span>Legacy pass • Set PIN</span>
                            </button>
                          )
                        ) : (
                          <span className="text-xs font-mono font-bold tracking-widest text-muted-foreground">
                            ••••••
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(officer.id)}
                          title={isPinVisible ? 'Hide PIN' : 'Reveal PIN'}
                          className="w-6 h-6 rounded bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
                        >
                          {isPinVisible ? (
                            <EyeOff className="w-3 h-3 text-gabay-green" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>

                        {activePin && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(activePin, `pin-${officer.id}`)}
                            title="Copy 6-Digit PIN"
                            className="h-6 px-1.5 rounded bg-card hover:bg-muted border border-border text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition cursor-pointer"
                          >
                            {isPinCopied ? (
                              <Check className="w-3 h-3 text-gabay-green" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{isPinCopied ? 'Copied' : 'PIN'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setResetPinTarget(officer);
                            setIsResetPinOpen(true);
                          }}
                          title="Reset / Change 6-Digit PIN"
                          className="w-6 h-6 rounded bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expiration and Login Info */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>Expires: {new Date(officer.expires_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>
                        Last login:{' '}
                        {officer.last_login_at
                          ? new Date(officer.last_login_at).toLocaleString()
                          : 'Never logged in'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyPass(officer)}
                    className="h-8 px-2.5 rounded-lg bg-accent text-accent-foreground border border-gabay-green/30 hover:bg-gabay-green hover:text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                    title="Copies Username and PIN separated by Tab for fast login form pasting"
                  >
                    {isPassCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-gabay-green" />
                        <span>Pass Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gabay-green" />
                        <span>Copy Pass</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleActive(officer.id, officer.is_active)}
                    disabled={togglingId === officer.id}
                    className={`h-8 px-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs ${
                      officer.is_active
                        ? 'bg-destructive/15 hover:bg-destructive text-destructive hover:text-white border border-destructive/40'
                        : 'bg-emerald-500/15 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{officer.is_active ? 'Revoke' : 'Restore'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={officers.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />

      {/* Provision Modal */}
      <OfficerProvisionModal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        onSuccess={fetchOfficers}
      />

      {/* Delete Confirmation Modal */}
      <OfficerDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        officer={deleteTarget}
        onConfirmDelete={handleDeleteOfficer}
      />

      {/* Reset PIN Modal */}
      <OfficerResetPinModal
        isOpen={isResetPinOpen}
        onClose={() => {
          setIsResetPinOpen(false);
          setResetPinTarget(null);
        }}
        officer={resetPinTarget}
        onSuccess={handlePinResetSuccess}
      />
    </div>
  );
}
