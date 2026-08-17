'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { compressStudentAvatar, compressCounselingNoteScan, CompressionResult } from '@/lib/image-compression';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureComplete: (result: CompressionResult) => void;
  mode: 'avatar' | 'document';
  title?: string;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCaptureComplete,
  mode,
  title = mode === 'avatar' ? 'Capture Student Face Photo' : 'Scan Physical Handwritten Note',
}: CameraCaptureModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>(
    mode === 'avatar' ? 'user' : 'environment'
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [compressing, setCompressing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Direct camera stream unavailable. You can upload or snap a photo using the file picker below.');
    }
  }, [facingMode, stream]);

  // Initialize camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const processCompression = async (file: File) => {
    setCompressing(true);
    try {
      let result: CompressionResult;
      if (mode === 'avatar') {
        result = await compressStudentAvatar(file);
      } else {
        result = await compressCounselingNoteScan(file);
      }
      setCompressionResult(result);
    } finally {
      setCompressing(false);
    }
  };

  const takeSnapshot = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `${mode}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedSnapshot(canvas.toDataURL('image/jpeg'));
      await processCompression(file);
    }, 'image/jpeg', 0.95);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setCapturedSnapshot(objectUrl);
    await processCompression(file);
  };

  const handleRetake = () => {
    setCapturedSnapshot(null);
    setCompressionResult(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (!compressionResult) return;
    stopCamera();
    onCaptureComplete(compressionResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border text-foreground rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {mode === 'avatar' ? 'Face photo for student profile' : 'Handwritten counseling sheet'}
            </p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Capture Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] max-h-[460px] overflow-hidden">
          {!capturedSnapshot ? (
            <>
              {/* Live Video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Mode Framing Overlays */}
              {mode === 'avatar' ? (
                // Oval Headshot Framing Overlay
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-52 h-64 sm:w-60 sm:h-72 border-2 border-dashed border-gabay-green/90 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] flex items-center justify-center">
                    <div className="text-[11px] text-white bg-black/70 px-2.5 py-1 rounded-full border border-gabay-green/40">
                      Center Student Face
                    </div>
                  </div>
                </div>
              ) : (
                // Document Boundary Framing Overlay
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  <div className="w-full h-full max-w-sm max-h-80 border-2 border-amber-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] flex flex-col justify-between p-3">
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-amber-300" />
                      <div className="w-4 h-4 border-t-2 border-r-2 border-amber-300" />
                    </div>
                    <div className="self-center text-[11px] text-amber-200 bg-black/70 px-3 py-1 rounded-full border border-amber-400/30">
                      Align Handwritten Sheet Inside Frame
                    </div>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-b-2 border-l-2 border-amber-300" />
                      <div className="w-4 h-4 border-b-2 border-r-2 border-amber-300" />
                    </div>
                  </div>
                </div>
              )}

              {/* Camera Switcher */}
              <button
                onClick={toggleCamera}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition active:scale-90 cursor-pointer"
                title="Switch Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          ) : (
            // Preview of Captured Snapshot
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <img
                src={capturedSnapshot}
                alt="Captured Snapshot"
                className="max-h-[440px] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          )}

          {/* Camera Error Fallback Message */}
          {cameraError && !capturedSnapshot && (
            <div className="absolute inset-x-4 bottom-4 p-3 rounded-xl bg-card/95 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* Compression Statistics Badge */}
        {compressionResult && (
          <div className="px-5 py-2.5 bg-muted/60 border-t border-border flex items-center justify-between text-xs text-muted-foreground shrink-0">
            <div className="flex items-center gap-1.5 text-gabay-green font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Optimized WebP</span>
            </div>
            <div>
              <span className="line-through text-muted-foreground/70">{compressionResult.originalSizeKB} KB</span>{' '}
              → <strong className="text-foreground font-bold">{compressionResult.compressedSizeKB} KB</strong>{' '}
              <span className="text-[10px] text-gabay-green">
                ({Math.round((1 - compressionResult.compressedSizeKB / (compressionResult.originalSizeKB || 1)) * 100)}% saved)
              </span>
            </div>
          </div>
        )}

        {/* Controls Footer */}
        <div className="p-4 sm:p-5 bg-card border-t border-border flex items-center justify-between gap-3 shrink-0">
          {!capturedSnapshot ? (
            <>
              {/* File Picker Fallback */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture={facingMode === 'user' ? 'user' : 'environment'}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 px-4 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload / Snap</span>
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={takeSnapshot}
                className="w-14 h-14 rounded-full bg-gabay-green hover:bg-gabay-green-600 text-white shadow-md flex items-center justify-center ring-4 ring-gabay-green/25 transition active:scale-90 cursor-pointer"
              >
                <Camera className="w-7 h-7" />
              </button>

              <div className="w-24" />
            </>
          ) : (
            <>
              {/* Retake Button */}
              <button
                type="button"
                onClick={handleRetake}
                className="h-11 px-4 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake</span>
              </button>

              {/* Confirm / Use Button */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={compressing || !compressionResult}
                className="h-11 px-6 rounded-xl bg-gabay-green hover:bg-gabay-green-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{compressing ? 'Compressing...' : 'Use Photo'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
