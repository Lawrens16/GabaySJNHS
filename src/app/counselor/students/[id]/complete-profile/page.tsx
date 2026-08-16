'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Camera,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  User,
  Phone,
  Calendar,
  CreditCard
} from 'lucide-react';
import CameraCaptureModal from '@/components/camera/CameraCaptureModal';
import { CompressionResult } from '@/lib/image-compression';
import { Student } from '@/types/database.types';

export default function CompleteStudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = use(params);
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [lrn, setLrn] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('Male');
  const [gradeLevel, setGradeLevel] = useState('7');
  const [section, setSection] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');

  // Mandatory Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<CompressionResult | null>(null);

  useEffect(() => {
    async function loadStudent() {
      try {
        const res = await fetch(`/api/counselor/students/${studentId}`);
        const data = await res.json();
        if (data.student) {
          setStudent(data.student);
          setGradeLevel(data.student.grade_level ? data.student.grade_level.toString() : '7');
          setSection(data.student.section || '');
          setGender(data.student.gender || 'Male');
          if (data.student.lrn) setLrn(data.student.lrn);
        }
      } catch {
        setErrorMsg('Failed to load student stub data.');
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedPhoto) {
      setErrorMsg('MANDATORY REQUIREMENT: You must capture a photo of the student’s face before completing this profile.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append('photo', capturedPhoto.file);
      formData.append('lrn', lrn);
      formData.append('birthdate', birthdate);
      formData.append('gender', gender);
      formData.append('gradeLevel', gradeLevel);
      formData.append('section', section);
      formData.append('contactNumber', contactNumber);
      formData.append('guardianName', guardianName);
      formData.append('guardianContact', guardianContact);

      const res = await fetch(`/api/counselor/students/${studentId}/complete`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to complete student profile.');
        setSaving(false);
        return;
      }

      router.push(`/counselor/students/${studentId}`);
    } catch {
      setErrorMsg('Network error occurred.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="text-xs">Loading student stub details...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto w-full space-y-6">
      {/* Back Link */}
      <Link
        href="/counselor/students"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assigned Students</span>
      </Link>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Stub Profile Completion</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Complete Profile: {student?.first_name} {student?.last_name}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Capture the mandatory student face photo for enrollment ID verification and fill out demographic details.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* MANDATORY PHOTO CAPTURE CARD */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-dashed border-amber-500/40 backdrop-blur shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Student Face Photo (Mandatory)</h3>
                <p className="text-xs text-slate-400">Required for Enrollment Officer Identity Verification</p>
              </div>
            </div>

            {capturedPhoto && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Photo Verified</span>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
            {/* Photo Preview Thumbnail */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-slate-950 border-2 border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
              {capturedPhoto ? (
                <img
                  src={capturedPhoto.previewUrl}
                  alt="Captured Student Face"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-3 text-slate-500">
                  <User className="w-10 h-10 mx-auto mb-1 opacity-50" />
                  <span className="text-[10px] uppercase font-bold text-amber-400/80">No Photo</span>
                </div>
              )}
            </div>

            {/* Shutter Trigger & Compression Stats */}
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <p className="text-xs text-slate-300 leading-relaxed">
                Position student face clearly within the camera oval guide. Photo will be automatically compressed to under 200KB WebP.
              </p>

              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center sm:justify-start gap-2 transition shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{capturedPhoto ? 'Retake Student Photo' : 'Launch Camera to Capture Photo'}</span>
              </button>

              {capturedPhoto && (
                <div className="text-[11px] text-emerald-400 font-mono">
                  Compressed: {capturedPhoto.compressedSizeKB} KB (Saved {(1 - capturedPhoto.compressedSizeKB / (capturedPhoto.originalSizeKB || 1)) * 100 | 0}%)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DEMOGRAPHIC FORM CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            Demographic & DepEd Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* LRN */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                <span>12-Digit LRN (Learner Reference Number)</span>
              </label>
              <input
                type="text"
                value={lrn}
                maxLength={12}
                onChange={(e) => setLrn(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 109283746501"
                className="w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Birthdate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Date of Birth</span>
              </label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Grade Level</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Section</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. Mabini"
                className="w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Parent / Guardian Full Name
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Elena Dela Cruz"
                className="w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Emergency Contact Number</span>
              </label>
              <input
                type="tel"
                value={guardianContact}
                onChange={(e) => setGuardianContact(e.target.value)}
                placeholder="e.g. 09171234567"
                className="w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/counselor/students"
            className="h-12 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving || !capturedPhoto}
            className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition shadow-xl shadow-emerald-600/30 active:scale-95 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Bucket & Database...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Commit & Mark Complete</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureComplete={(result) => setCapturedPhoto(result)}
        mode="avatar"
        title={`Capture Face Photo: ${student?.first_name} ${student?.last_name}`}
      />
    </div>
  );
}
