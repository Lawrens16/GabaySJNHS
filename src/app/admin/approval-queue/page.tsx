'use client';

import { useState, useEffect } from 'react';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  HeartHandshake,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { Profile, UserRole, UserStatus } from '@/types/database.types';

export default function ApprovalQueuePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?status=${statusFilter}`);
      const data = await res.json();
      if (data.profiles) {
        setProfiles(data.profiles);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [statusFilter]);

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

  const filteredProfiles = profiles.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query)
    );
  });

  const pendingCount = profiles.filter((p) => p.status === 'pending').length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Staff Approval Queue
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review incoming Google OAuth accounts and assign designated school staff roles.
          </p>
        </div>

        <button
          onClick={fetchProfiles}
          disabled={loading}
          className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 w-full sm:w-auto">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === status
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-slate-900/50 rounded-2xl border border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-xs">Loading queue records...</span>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">No accounts found</h3>
            <p className="text-xs text-slate-500 mt-1">There are no {statusFilter} accounts matching your filter.</p>
          </div>
        ) : (
          filteredProfiles.map((user) => (
            <div
              key={user.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* User Identity */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-purple-400">
                      {user.full_name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{user.full_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : user.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">{user.email}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Registered: {new Date(user.created_at).toLocaleString()}
                    {user.role && <span className="ml-2 text-purple-400 font-semibold">• Role: {user.role.toUpperCase()}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                {user.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleUpdateUser(user.id, 'counselor', 'approved')}
                      disabled={actionLoadingId === user.id}
                      className="h-9 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Approve Counselor</span>
                    </button>

                    <button
                      onClick={() => handleUpdateUser(user.id, 'lfo', 'approved')}
                      disabled={actionLoadingId === user.id}
                      className="h-9 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Approve LFO</span>
                    </button>

                    <button
                      onClick={() => handleUpdateUser(user.id, 'admin', 'approved')}
                      disabled={actionLoadingId === user.id}
                      className="h-9 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Approve Admin</span>
                    </button>

                    <button
                      onClick={() => handleUpdateUser(user.id, null, 'rejected')}
                      disabled={actionLoadingId === user.id}
                      className="h-9 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  /* Change / Revoke Role */
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role || ''}
                      onChange={(e) =>
                        handleUpdateUser(
                          user.id,
                          e.target.value as UserRole,
                          user.status
                        )
                      }
                      disabled={actionLoadingId === user.id}
                      className="h-9 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="counselor">Guidance Counselor</option>
                      <option value="lfo">Learner Formation (LFO)</option>
                      <option value="admin">System Admin</option>
                    </select>

                    <button
                      onClick={() =>
                        handleUpdateUser(
                          user.id,
                          user.role,
                          user.status === 'approved' ? 'suspended' : 'approved'
                        )
                      }
                      disabled={actionLoadingId === user.id}
                      className={`h-9 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        user.status === 'approved'
                          ? 'bg-rose-950/40 hover:bg-rose-900 border border-rose-800 text-rose-300'
                          : 'bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                      }`}
                    >
                      {user.status === 'approved' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
