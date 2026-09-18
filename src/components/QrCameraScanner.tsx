"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, AlertCircle, RefreshCw, Upload, CheckCircle2, Zap, ZapOff } from "lucide-react";

interface QrCameraScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

// Play pleasant confirmation beep on successful scan using Web Audio API
function playScanChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export default function QrCameraScanner({ onScan, onClose }: QrCameraScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isHandlingScanRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerId = "qr-camera-stream-container";

  // Clean stop helper
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        console.warn("Scanner cleanup notice:", e);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      setIsInitializing(true);
      setError(null);

      // Check if secure context
      if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
        setError(
          "يتطلب الوصول للكاميرا اتصالاً آمناً (HTTPS). يرجى فتح الموقع عبر رابط https:// أو استخدام خيار تحميل صورة الـ QR أدناه."
        );
        setIsInitializing(false);
        return;
      }

      try {
        // Enumerate devices if possible
        const devices = await Html5Qrcode.getCameras().catch(() => []);
        if (mounted) {
          setCameras(devices);
          if (devices.length > 0 && !activeCameraId) {
            // Find back camera if available
            const backCam = devices.find(
              (d) =>
                d.label.toLowerCase().includes("back") ||
                d.label.toLowerCase().includes("rear") ||
                d.label.toLowerCase().includes("environment")
            );
            setActiveCameraId(backCam ? backCam.id : devices[0].id);
          }
        }

        const html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 12,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.72);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0,
        };

        const cameraConfig = activeCameraId ? activeCameraId : { facingMode };

        await html5QrCode.start(
          cameraConfig,
          config,
          (decodedText) => {
            if (isHandlingScanRef.current) return;
            isHandlingScanRef.current = true;

            // Trigger feedback
            playScanChime();
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([40, 40, 80]);
            }

            setScannedResult(decodedText);

            // Stop scanner & propagate scan result
            stopScanner().finally(() => {
              onScan(decodedText);
            });
          },
          () => {
            // Frame parse failed (normal while scanning, do nothing)
          }
        );

        if (mounted) {
          setIsInitializing(false);
        }
      } catch (err: unknown) {
        console.error("Camera startup error:", err);
        if (mounted) {
          setIsInitializing(false);
          const errString = String(err).toLowerCase();
          if (errString.includes("notallowed") || errString.includes("permission")) {
            setError(
              "تم رفض إذن الوصول للكاميرا. يرجى السماح للمتصفح باستخدام الكاميرا من إعدادات الموقع، أو استخدام خيار صورة الـ QR أدناه."
            );
          } else if (errString.includes("notfound") || errString.includes("devices")) {
            setError("لم يتم العثور على كاميرا في هذا الجهاز.");
          } else {
            setError(
              "تعذر فتح الكاميرا المباشرة في المتصفح. يمكنك استخدام خيار (مسح من صورة) أدناه أو إدخال الرمز PIN المكون من 6 أرقام."
            );
          }
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [facingMode, activeCameraId]);

  // Flip camera between front & back
  const toggleFacingMode = async () => {
    await stopScanner();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Handle local image file upload (screenshot of customer QR pass)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsInitializing(true);
      setError(null);
      const html5QrCode = scannerRef.current || new Html5Qrcode(containerId);
      const decodedText = await html5QrCode.scanFile(file, true);
      playScanChime();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 40, 80]);
      }
      setScannedResult(decodedText);
      await stopScanner();
      onScan(decodedText);
    } catch (err) {
      console.warn("File scan error:", err);
      setError("لم يتم العثور على رمز QR صالح في الصورة المرفوعة. يرجى التأكد من وضوح الرمز.");
      setIsInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-neutral-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">قارئ رمز الزبون (QR Scanner)</h3>
              <p className="text-[10px] text-neutral-400">وجه الكاميرا نحو شاشة الزبون</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopScanner().finally(() => onClose());
            }}
            className="p-1.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center">
          {/* HTML5 QR Container */}
          <div
            id={containerId}
            className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
          />

          {/* Viewfinder Overlay & Scanning Laser (when active and no error) */}
          {!error && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Darkened borders */}
              <div className="relative w-64 h-64 border-2 border-emerald-400/90 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                {/* 4 Corner brackets */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Animated Laser Line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce" />
              </div>
            </div>
          )}

          {/* Initializing Loader */}
          {isInitializing && !error && (
            <div className="absolute inset-0 bg-neutral-950/80 flex flex-col items-center justify-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <span className="text-xs font-mono text-neutral-300">جاري تشغيل الكاميرا...</span>
            </div>
          )}

          {/* Success Flash Indicator */}
          {scannedResult && (
            <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center gap-2 text-white p-4 text-center animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold">تم التعرف على رمز الزبون بنجاح!</span>
              <span className="text-xs font-mono text-emerald-200 truncate max-w-xs">{scannedResult}</span>
            </div>
          )}

          {/* Error Message Card */}
          {error && (
            <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-10 h-10 rounded-full bg-red-900/40 border border-red-700 text-red-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4 max-w-xs">{error}</p>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>مسح من صورة / لقطة شاشة للـ QR</span>
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-xs text-neutral-300 flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة للكاميرا</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-3.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFacingMode}
              className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تبديل الكاميرا (أمامية / خلفية)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تبديل الكاميرا</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="مسح من صورة"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>صورة</span>
            </button>

            {/* Hidden file upload input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <button
            onClick={() => stopScanner().finally(() => onClose())}
            className="px-3 py-1.5 rounded-xl text-neutral-400 hover:text-white transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
