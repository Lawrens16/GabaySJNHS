'use client';

import { useState, useEffect } from 'react';
import {
  KeyRound,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Clock,
  RefreshCw,
  Power,
  Loader2,
  Calendar,
  UserCheck
} from 'lucide-react';
import OfficerProvisionModal from '@/components/admin/OfficerProvisionModal';
import { EnrollmentOfficer } from '@/types/database.types';

export default function EnrollmentOfficersPage() {
  const [officers, setOfficers] = useState<EnrollmentOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Seasonal Enrollment Officers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage individualized station credentials (6-Digit PINs) with strictly audited 10-hour sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOfficers}
            disabled={loading}
            className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsProvisionOpen(true)}
            className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-purple-600/30 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision Officer</span>
          </button>
        </div>
      </div>

      {/* Officers List Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-slate-900/50 rounded-2xl border border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-xs">Loading officer credentials...</span>
          </div>
        ) : officers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
            <KeyRound className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">No Enrollment Officers Provisioned</h3>
            <p className="text-xs text-slate-500 mt-1">Click &quot;Provision Officer&quot; above to create a seasonal credential pass.</p>
          </div>
        ) : (
          officers.map((officer) => {
            const isExpired = new Date(officer.expires_at) <= new Date();
            const isActive = officer.is_active && !isExpired;

            return (
              <div
                key={officer.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        !officer.is_active
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isExpired
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {!officer.is_active ? 'Revoked' : isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-0.5">{officer.full_name}</h3>
                  <div className="text-xs font-mono text-emerald-400 bg-slate-800/80 px-2 py-1 rounded-md inline-block mb-3 border border-slate-700">
                    @{officer.username}
                  </div>

                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Expires: {new Date(officer.expires_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Last login:{' '}
                        {officer.last_login_at
                          ? new Date(officer.last_login_at).toLocaleString()
                          : 'Never logged in'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Killswitch Action */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Access Switch:</span>
                  <button
                    onClick={() => handleToggleActive(officer.id, officer.is_active)}
                    disabled={togglingId === officer.id}
                    className={`h-8 px-3 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                      officer.is_active
                        ? 'bg-rose-950/40 hover:bg-rose-900 border border-rose-800 text-rose-300'
                        : 'bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{officer.is_active ? 'Revoke Access' : 'Restore Access'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Provision Modal */}
      <OfficerProvisionModal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        onSuccess={fetchOfficers}
      />
    </div>
  );
}
