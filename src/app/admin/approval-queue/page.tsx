'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  HeartHandshake,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Search,
  RotateCcw,
} from 'lucide-react';
import { Profile, UserRole, UserStatus } from '@/types/database.types';
import RejectConfirmModal from '@/components/admin/RejectConfirmModal';
import Pagination from '@/components/ui/Pagination';

const PAGE_SIZE = 8;

export default function ApprovalQueuePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<Profile | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectActionLabel, setRejectActionLabel] = useState('Reject Account');

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?status=${statusFilter}`);
      const data = await res.json();
      if (data.profiles) {
        setProfiles(data.profiles);
        setCurrentPage(1);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleUpdateUser = async (userId: string, role: UserRole | null, status: UserStatus) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, status }),
      });

      if (res.ok) {
        // Optimistically update list
        setProfiles((prev) =>
          prev.map((p) => (p.id === userId ? { ...p, role, status } : p))
        );
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (user: Profile, label: string) => {
    setRejectTarget(user);
    setRejectActionLabel(label);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (userId: string) => {
    await handleUpdateUser(userId, null, 'rejected');
  };

  const handleAllowReApplication = async (userId: string) => {
    await handleUpdateUser(userId, null, 'pending');
  };

  const filteredProfiles = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return profiles.filter((p) => {
      return (
        p.full_name?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query)
      );
    });
  }, [profiles, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProfiles.length / PAGE_SIZE) || 1;
  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProfiles.slice(start, start + PAGE_SIZE);
  }, [filteredProfiles, currentPage]);

  const pendingCount = profiles.filter((p) => p.status === 'pending').length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Staff Approval Queue
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Review incoming Google OAuth accounts and assign designated school staff roles.
          </p>
        </div>

        <button
          onClick={fetchProfiles}
          disabled={loading}
          className="h-10 px-3.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-card border border-border w-full sm:w-auto shadow-xs">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-gabay-green text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-card rounded-2xl border border-border">
            <Loader2 className="w-6 h-6 animate-spin text-gabay-green" />
            <span className="text-xs">Loading queue records...</span>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-gabay-green mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No accounts found</h3>
            <p className="text-xs text-muted-foreground mt-1">There are no {statusFilter} accounts matching your filter.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedProfiles.map((user) => (
                <div
                  key={user.id}
                  className="p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-gabay-green/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  {/* User Identity */}
                  <div className="flex items-center gap-3.5 min-w-0">
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">{user.full_name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                              : user.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-destructive/20 text-destructive border border-destructive/30'
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Registered: {new Date(user.created_at).toLocaleString()}
                        {user.role && <span className="ml-2 text-gabay-navy dark:text-blue-400 font-semibold">• Role: {user.role.toUpperCase()}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center flex-wrap gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    {user.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleUpdateUser(user.id, 'counselor', 'approved')}
                          disabled={actionLoadingId === user.id}
                          className="h-9 px-3 rounded-xl bg-gabay-green/15 hover:bg-gabay-green hover:text-white border border-gabay-green/30 text-gabay-green text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>Approve Counselor</span>
                        </button>

                        <button
                          onClick={() => handleUpdateUser(user.id, 'lfo', 'approved')}
                          disabled={actionLoadingId === user.id}
                          className="h-9 px-3 rounded-xl bg-gabay-navy/15 hover:bg-gabay-navy hover:text-white border border-gabay-navy/30 text-gabay-navy dark:text-blue-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Approve LFO</span>
                        </button>

                        <button
                          onClick={() => openRejectModal(user, 'Reject Account')}
                          disabled={actionLoadingId === user.id}
                          className="h-9 px-3 rounded-xl bg-destructive/15 hover:bg-destructive text-destructive hover:text-white border border-destructive/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">
                          Role: <strong className="text-foreground uppercase">{user.role || 'None'}</strong>
                        </span>

                        {user.status === 'approved' && user.role !== 'admin' && (
                          <button
                            onClick={() => openRejectModal(user, 'Revoke Access')}
                            disabled={actionLoadingId === user.id}
                            className="h-8 px-2.5 rounded-lg bg-destructive/15 hover:bg-destructive text-destructive hover:text-white border border-destructive/40 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
                          >
                            Revoke Access
                          </button>
                        )}

                        {user.status === 'rejected' && (
                          <button
                            onClick={() => handleAllowReApplication(user.id)}
                            disabled={actionLoadingId === user.id}
                            className="h-8 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Allow Re-Application</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProfiles.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Reject Confirmation Modal */}
      <RejectConfirmModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        user={rejectTarget}
        onConfirmReject={handleConfirmReject}
        actionLabel={rejectActionLabel}
      />
    </div>
  );
}
