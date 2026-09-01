'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  ArrowLeft,
  HeartHandshake,
  Check,
  Loader2,
  Sparkles,
  CreditCard,
  Paperclip,
  X,
  FileImage,
  ImagePlus,
  StickyNote,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';

const MAX_EVIDENCE_FILES = 5;
const MAX_FILE_SIZE_MB = 5;

interface EvidenceFile {
  file: File;
  previewUrl: string;
  uploading: boolean;
  uploadedUrl: string | null;
  error: string | null;
}

export default function NewStudentStubPage() {
  const [lrn, setLrn] = useState('');
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

  // Evidence state
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const evidenceInputRef = useRef<HTMLInputElement>(null);

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

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      evidenceFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
  }, [evidenceFiles]);

  const handleEvidenceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const remaining = MAX_EVIDENCE_FILES - evidenceFiles.length;
    const toAdd = selected.slice(0, remaining);

    const newItems: EvidenceFile[] = toAdd
      .filter((file) => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setErrorMsg(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB and was skipped.`);
          return false;
        }
        if (!file.type.startsWith('image/')) {
          setErrorMsg(`File "${file.name}" is not an image and was skipped.`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        uploading: false,
        uploadedUrl: null,
        error: null,
      }));

    setEvidenceFiles((prev) => [...prev, ...newItems]);
    // Reset input so same file can be re-added if removed
    if (evidenceInputRef.current) evidenceInputRef.current.value = '';
  };

  const removeEvidence = (idx: number) => {
    setEvidenceFiles((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const uploadEvidenceToSupabase = async (): Promise<string[]> => {
    const supabase = createClient();
    const uploadedUrls: string[] = [];

    for (let i = 0; i < evidenceFiles.length; i++) {
      const item = evidenceFiles[i];
      if (item.uploadedUrl) {
        uploadedUrls.push(item.uploadedUrl);
        continue;
      }

      // Update uploading state
      setEvidenceFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, uploading: true } : f))
      );

      const ext = item.file.name.split('.').pop() || 'jpg';
      const path = `stubs/${Date.now()}_${i}.${ext}`;

      const { data, error } = await supabase.storage
        .from('student-evidence')
        .upload(path, item.file, { upsert: false, contentType: item.file.type });

      if (error) {
        setEvidenceFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, uploading: false, error: error.message } : f
          )
        );
        continue;
      }

      const { data: urlData } = supabase.storage.from('student-evidence').getPublicUrl(data.path);
      const url = urlData.publicUrl;

      setEvidenceFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, uploading: false, uploadedUrl: url } : f
        )
      );

      uploadedUrls.push(url);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter both First Name and Last Name.');
      return;
    }

    if (lrn.trim() && lrn.trim().length !== 12) {
      setErrorMsg(
        'Learner Reference Number (LRN) must be exactly 12 digits (or left blank for counselor to fill).'
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Upload evidence images to Supabase Storage first
      let evidenceUrls: string[] = [];
      if (evidenceFiles.length > 0) {
        evidenceUrls = await uploadEvidenceToSupabase();
      }

      const res = await fetch('/api/lfo/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lrn: lrn.trim() || undefined,
          firstName,
          lastName,
          middleName,
          gradeLevel,
          section,
          gender,
          assignedCounselorId,
          evidenceUrls,
          evidenceNotes: evidenceNotes.trim() || undefined,
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
      setLrn('');
      setFirstName('');
      setLastName('');
      setMiddleName('');
      setSection('');
      setEvidenceFiles([]);
      setEvidenceNotes('');

      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
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
          Create a minimal student record stub. The assigned Guidance Counselor will capture the
          face photo and complete the profile.
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* LRN Field */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-gabay-green" />
                <span>12-Digit LRN (Optional at Stub Creation)</span>
              </span>
              <span className="text-[11px] font-normal text-muted-foreground font-mono">
                {lrn.length}/12 digits
              </span>
            </label>
            <input
              type="text"
              value={lrn}
              maxLength={12}
              onChange={(e) => setLrn(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 109283746501 (leave blank if unavailable)"
              className="w-full h-11 px-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-sm font-mono focus:ring-2 focus:ring-gabay-green focus:outline-none transition"
            />
            {lrn.length > 0 && lrn.length < 12 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                LRN must be exactly 12 digits ({12 - lrn.length} remaining).
              </p>
            )}
          </div>

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

          {/* ── Evidence Section ── */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center border border-gabay-green/25">
                <Paperclip className="w-3.5 h-3.5 text-gabay-green" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Evidence Attachments</p>
                <p className="text-[11px] text-muted-foreground">
                  Attach signed guardian consent, permits, or supporting photos (up to {MAX_EVIDENCE_FILES} images, max {MAX_FILE_SIZE_MB}MB each).
                </p>
              </div>
            </div>

            {/* Evidence Previews Grid */}
            {evidenceFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                {evidenceFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted group shadow-xs"
                  >
                    <img
                      src={item.previewUrl}
                      alt={`Evidence ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Uploading overlay */}
                    {item.uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                    {/* Uploaded checkmark */}
                    {item.uploadedUrl && !item.uploading && (
                      <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {/* Error */}
                    {item.error && (
                      <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center p-1">
                        <span className="text-[9px] text-white text-center leading-tight">Upload failed</span>
                      </div>
                    )}
                    {/* Remove button */}
                    {!item.uploading && (
                      <button
                        type="button"
                        onClick={() => removeEvidence(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add more slot */}
                {evidenceFiles.length < MAX_EVIDENCE_FILES && (
                  <button
                    type="button"
                    onClick={() => evidenceInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-gabay-green/50 bg-muted/40 hover:bg-accent/50 flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <ImagePlus className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Add</span>
                  </button>
                )}
              </div>
            )}

            {/* Drop Zone (shown when no files yet) */}
            {evidenceFiles.length === 0 && (
              <button
                type="button"
                onClick={() => evidenceInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border hover:border-gabay-green/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition bg-muted/30 hover:bg-accent/30 cursor-pointer group"
              >
                <FileImage className="w-7 h-7 text-muted-foreground group-hover:text-gabay-green transition" />
                <p className="text-xs font-semibold">Click to attach evidence photos</p>
                <p className="text-[11px] text-muted-foreground">
                  Signed guardian consent, permits, etc. • JPG, PNG, WEBP • Max {MAX_FILE_SIZE_MB}MB each
                </p>
              </button>
            )}

            <input
              ref={evidenceInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleEvidenceSelect}
            />

            {/* Evidence Notes */}
            {evidenceFiles.length > 0 && (
              <div className="mt-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                  <StickyNote className="w-3.5 h-3.5 text-gabay-green" />
                  <span>Evidence Notes (Optional)</span>
                </label>
                <textarea
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Signed guardian consent for enrollment despite incomplete documents. Approved by principal."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground text-xs focus:ring-2 focus:ring-gabay-green focus:outline-none transition resize-none"
                />
              </div>
            )}
          </div>

          {/* Info Notice */}
          <div className="p-3.5 rounded-2xl bg-accent text-accent-foreground border border-gabay-green/20 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-gabay-green" />
            <p className="leading-relaxed text-[11px]">
              Once created, this student will appear in the assigned counselor&apos;s caseload as an{' '}
              <strong>Incomplete Profile Stub</strong> requiring a mandatory face photo. Evidence
              attachments will be visible to the counselor and LFO only.
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
                  <span>{evidenceFiles.length > 0 ? 'Uploading & Dispatching...' : 'Dispatching...'}</span>
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
