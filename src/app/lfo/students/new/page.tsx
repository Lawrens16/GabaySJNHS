'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, ArrowLeft, HeartHandshake, Check, Loader2, Sparkles } from 'lucide-react';
import { Profile } from '@/types/database.types';

export default function NewStudentStubPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('7');
  const [section, setSection] = useState('');
  const [gender, setGender] = useState('Male');
  const [assignedCounselorId, setAssignedCounselorId] = useState('');
  const [counselors, setCounselors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCounselors() {
      try {
        const res = await fetch('/api/lfo/counselors');
        const data = await res.json();
        if (data.counselors) {
          setCounselors(data.counselors);
          if (data.counselors.length > 0) {
            setAssignedCounselorId(data.counselors[0].id);
          }
        }
      } catch {
        // Ignore
      }
    }
    loadCounselors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter both First Name and Last Name.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch('/api/lfo/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          middleName,
          gradeLevel,
          section,
          gender,
          assignedCounselorId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create student stub.');
        setLoading(false);
        return;
      }

      setSuccessMsg(`Student stub for ${firstName} ${lastName} dispatched successfully!`);
      // Reset form
      setFirstName('');
      setLastName('');
      setMiddleName('');
      setSection('');

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch {
      setErrorMsg('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full space-y-6">
      {/* Back Link */}
      <Link
        href="/lfo/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to LFO Dashboard</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Dispatch New Student Stub
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Create a minimal student record stub. The assigned Guidance Counselor will capture the face photo and complete the profile.
        </p>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Maria"
                required
                className="w-full h-11 px-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-sm focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Santos"
                required
                className="w-full h-11 px-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-sm focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Middle Name (Optional)
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="e.g. Dela Cruz"
                className="w-full h-11 px-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-sm focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-card border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Academic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Grade Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-card border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
              >
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11 (Senior High)</option>
                <option value="12">Grade 12 (Senior High)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Section (Optional)
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. Rizal, STEM-A"
                className="w-full h-11 px-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-sm focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
              />
            </div>
          </div>

          {/* Assign Guidance Counselor */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-gabay-green" />
              <span>Assign Guidance Counselor *</span>
            </label>
            <select
              value={assignedCounselorId}
              onChange={(e) => setAssignedCounselorId(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl bg-card border border-border text-foreground text-sm font-medium focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
            >
              {counselors.length === 0 ? (
                <option value="">No approved counselors found</option>
              ) : (
                counselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Info Notice */}
          <div className="p-3.5 rounded-2xl bg-accent text-accent-foreground border border-gabay-green/20 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-gabay-green" />
            <p className="leading-relaxed text-[11px]">
              Once created, this student will appear in the assigned counselor&apos;s caseload as an <strong>Incomplete Profile Stub</strong> requiring a mandatory face photo.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href="/lfo/dashboard"
              className="h-11 px-5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center transition shadow-xs"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="h-11 px-6 rounded-xl bg-gabay-navy hover:bg-gabay-navy-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm cursor-pointer active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Student Stub</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
