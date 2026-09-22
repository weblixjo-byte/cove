"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Smartphone,
  Laptop,
  Monitor,
  Sparkles,
  Info,
  Bug,
  CreditCard,
  QrCode,
  Gauge,
  HelpCircle,
  ChevronDown,
  RotateCcw,
  Check,
} from "lucide-react";

interface AdminSupportTicketProps {
  storeName?: string;
  onReturnToDashboard?: () => void;
}

const CATEGORIES = [
  { id: "Bug / System Error", label: "Bug / System Error", icon: Bug, desc: "Unexpected behavior or crash" },
  { id: "POS & Cashier Flow", label: "POS & Cashier Flow", icon: CreditCard, desc: "Numpad, scanning, or bill entry" },
  { id: "Customer Card & PIN", label: "Customer Card & PIN", icon: QrCode, desc: "Pass, QR scan, or customer PIN" },
  { id: "Points & Calculation", label: "Points & Calculation", icon: ShieldCheck, desc: "Credit or redemption discrepancy" },
  { id: "Performance & Lag", label: "Performance & Lag", icon: Gauge, desc: "Slow loading or freeze" },
  { id: "Feature Request / Other", label: "Feature / Improvement", icon: Sparkles, desc: "Request new ability or design tweak" },
];

const URGENCIES = [
  { id: "Low", label: "Low", badge: "bg-emerald-50 text-emerald-800 border-emerald-200", desc: "Cosmetic or minor suggestion" },
  { id: "Medium", label: "Medium", badge: "bg-amber-50 text-amber-800 border-amber-200", desc: "Normal issue, workaround available" },
  { id: "High", label: "High", badge: "bg-orange-50 text-orange-800 border-orange-200", desc: "Affects daily cashier or customer flow" },
  { id: "Critical", label: "Critical", badge: "bg-red-50 text-red-800 border-red-300 font-bold animate-pulse", desc: "System blocked or cannot ring bills" },
];

export default function AdminSupportTicket({
  storeName = "Cove Coffee House",
  onReturnToDashboard,
}: AdminSupportTicketProps) {
  // Form State
  const [category, setCategory] = useState<string>("Bug / System Error");
  const [urgency, setUrgency] = useState<string>("Medium");
  const [subject, setSubject] = useState<string>("");
  const [adminName, setAdminName] = useState<string>(`${storeName} Admin`);
  const [contactPhone, setContactPhone] = useState<string>("");
  const [adminEmail, setAdminEmail] = useState<string>("info@weblix-jo.com");
  const [message, setMessage] = useState<string>("");

  // Diagnostic State (Auto-Detected)
  const [diagnostics, setDiagnostics] = useState<{
    platform?: string;
    browser?: string;
    userAgent?: string;
    screenWidth?: number;
    screenHeight?: number;
    devicePixelRatio?: number;
    deviceType?: string;
    currentUrl?: string;
  }>({});

  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    timestamp: string;
  } | null>(null);

  // Auto-collect client diagnostics on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      let browser = "Unknown Browser";
      if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet";
      else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
      else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Microsoft Edge";
      else if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Safari")) browser = "Safari";

      let deviceType = "Desktop";
      if (/iPad|tablet/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
        deviceType = "iPad / Tablet";
      } else if (/Mobi|Android/i.test(ua)) {
        deviceType = "Mobile Device";
      }

      setDiagnostics({
        platform: navigator.platform || "Web",
        browser,
        userAgent: ua,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        deviceType,
        currentUrl: window.location.pathname,
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!subject.trim()) {
      setSubmitError("Please enter a short subject describing the issue.");
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      setSubmitError("Please provide a detailed explanation of the issue (at least 10 characters).");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Primary: Submit via internal server endpoint
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          category,
          urgency,
          adminName: adminName.trim() || `${storeName} Admin`,
          contactPhone: contactPhone.trim(),
          adminEmail: adminEmail.trim() || "info@weblix-jo.com",
          message,
          diagnostics,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
        setSubmittedTicket({
          id: data.ticketId || `TK-${Math.floor(100000 + Math.random() * 900000)}`,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        });
      } else {
        // 2. Fallback: Direct submission to Web3Forms API
        const fallbackTicketId = `TK-${Math.floor(100000 + Math.random() * 900000)}`;
        const fallbackRes = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: "7f0e27f4-7df7-4105-af7a-985d05cc02d1",
            subject: `[${urgency.toUpperCase()}] [#${fallbackTicketId}] ${category}: ${subject}`,
            from_name: `${adminName} (${storeName})`,
            email: adminEmail || "info@weblix-jo.com",
            message: `TICKET ID: #${fallbackTicketId}\nSTORE: ${adminName}\nPHONE: ${contactPhone}\nCATEGORY: ${category}\nURGENCY: ${urgency}\n\nISSUE DETAILS:\n${message}\n\nDIAGNOSTICS:\n${JSON.stringify(diagnostics, null, 2)}`,
          }),
        });

        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && fallbackData.success) {
          confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
          setSubmittedTicket({
            id: fallbackTicketId,
            timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          });
        } else {
          setSubmitError(data.error || fallbackData.message || "Failed to submit ticket. Please check your internet connection.");
        }
      }
    } catch (err: any) {
      console.error("Failed to send support ticket:", err);
      setSubmitError("Network error while submitting ticket. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
    setContactPhone("");
    setCategory("Bug / System Error");
    setUrgency("Medium");
    setSubmittedTicket(null);
    setSubmitError(null);
  };

  // SUCCESS STATE SCREEN
  if (submittedTicket) {
    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-10">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-[#EBD3C8] shadow-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#3F1215] text-[#FEECE2]">
              TICKET #{submittedTicket.id}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2B0B0D] font-serif">
              Support Ticket Dispatched
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Your technical incident report has been securely transmitted directly to{" "}
              <span className="font-semibold text-[#3F1215]">info@weblix-jo.com</span>. Our engineering team is reviewing the issue and full diagnostics.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF5F2] border border-[#EBD3C8] max-w-md mx-auto text-xs text-neutral-600 space-y-1.5 text-start font-mono">
            <div className="flex justify-between">
              <span className="text-neutral-400">Category:</span>
              <span className="font-semibold text-[#3F1215]">{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Priority Level:</span>
              <span className="font-semibold text-[#3F1215]">{urgency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Dispatched At:</span>
              <span className="text-neutral-700">{submittedTicket.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">SLA Response:</span>
              <span className="text-emerald-700 font-semibold">Priority Queue</span>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-[#EBD3C8] bg-white hover:bg-[#FDF4F0] text-xs font-semibold text-[#2B0B0D] transition-colors cursor-pointer"
            >
              Submit Another Ticket
            </button>
            {onReturnToDashboard && (
              <button
                type="button"
                onClick={onReturnToDashboard}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#3F1215] hover:bg-[#2B0B0D] text-[#FEECE2] text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Return to Analytics
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // TICKET FORM SCREEN
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#EBD3C8]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#3F1215] text-[#FEECE2]">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#2B0B0D] font-serif">
              Technical Support & Incident Ticket
            </h2>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
            Direct incident reporting channel to Weblix Engineering. If you encounter any technical glitch, calculation discrepancy, or have a feature tweak, submit this form and our developers will resolve it promptly.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 sm:flex-col sm:items-end">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#FDF4F0] border border-[#EBD3C8] text-[#3F1215]">
            Target: info@weblix-jo.com
          </span>
          <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active SLA Dispatch
          </span>
        </div>
      </div>

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-sm border border-[#EBD3C8] space-y-6">
          {/* STEP 1: CATEGORY SELECTION */}
          <div>
            <label className="text-xs font-bold text-[#2B0B0D] block mb-2 font-mono uppercase tracking-wider">
              1. Issue Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "border-[#3F1215] bg-[#FDF4F0] shadow-xs"
                        : "border-[#EBD3C8] bg-white/70 hover:bg-white text-neutral-600"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected
                          ? "bg-[#3F1215] text-[#FEECE2]"
                          : "bg-[#FAF5F2] text-[#3F1215]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className={`text-xs font-bold block leading-snug ${isSelected ? "text-[#2B0B0D]" : "text-neutral-800"}`}>
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-neutral-400 block leading-tight mt-0.5">
                        {cat.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: URGENCY LEVEL */}
          <div>
            <label className="text-xs font-bold text-[#2B0B0D] block mb-2 font-mono uppercase tracking-wider">
              2. Urgency Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {URGENCIES.map((lvl) => {
                const isSelected = urgency === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setUrgency(lvl.id)}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#3F1215] bg-[#3F1215] text-[#FEECE2] shadow-xs font-bold"
                        : "border-[#EBD3C8] bg-white hover:bg-[#FAF5F2] text-neutral-700 font-medium"
                    }`}
                  >
                    <span className="text-xs block">{lvl.label}</span>
                    <span className={`text-[9px] block mt-0.5 ${isSelected ? "text-neutral-300" : "text-neutral-400"}`}>
                      {lvl.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: SUBJECT & CONTACT */}
          <div className="space-y-4 pt-2 border-t border-[#EBD3C8]/60">
            <div>
              <label className="text-xs font-bold text-[#2B0B0D] block mb-1 font-mono uppercase tracking-wider">
                3. Ticket Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Cashier PIN numpad latency on iPad Air"
                className="w-full glass-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1 font-mono">
                  Store / Admin Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1 font-mono">
                  Callback Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="079xxxxxxx"
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1 font-mono">
                  Destination Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  readOnly
                  className="w-full glass-input text-xs bg-neutral-50 text-neutral-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: DETAILED DESCRIPTION */}
          <div className="pt-2 border-t border-[#EBD3C8]/60">
            <label className="text-xs font-bold text-[#2B0B0D] block mb-1 font-mono uppercase tracking-wider">
              4. Detailed Incident Description *
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what happened, what device you were using, what you expected to see, and any specific steps to reproduce the issue..."
              className="w-full glass-input font-sans text-xs leading-relaxed resize-y"
              required
            />
          </div>

          {/* AUTOMATIC DIAGNOSTICS VIEWER */}
          <div className="p-3.5 rounded-2xl bg-[#FAF5F2]/80 border border-[#EBD3C8] space-y-2">
            <button
              type="button"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="w-full flex items-center justify-between text-start cursor-pointer text-xs font-semibold text-[#3F1215]"
            >
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#3F1215]" />
                <span>Auto-Captured Environment Diagnostics ({diagnostics.deviceType || "Device"})</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDiagnostics ? "rotate-180" : ""}`} />
            </button>

            {showDiagnostics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#EBD3C8]/50 text-[10px] font-mono text-neutral-600">
                <div className="p-2 rounded-xl bg-white border border-[#EBD3C8]/60">
                  <span className="text-neutral-400 block">Browser:</span>
                  <span className="font-semibold text-neutral-800 truncate block">{diagnostics.browser}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#EBD3C8]/60">
                  <span className="text-neutral-400 block">Viewport:</span>
                  <span className="font-semibold text-neutral-800 truncate block">
                    {diagnostics.screenWidth} x {diagnostics.screenHeight}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#EBD3C8]/60">
                  <span className="text-neutral-400 block">Platform:</span>
                  <span className="font-semibold text-neutral-800 truncate block">{diagnostics.platform}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#EBD3C8]/60">
                  <span className="text-neutral-400 block">Destination:</span>
                  <span className="font-semibold text-[#3F1215] truncate block">info@weblix-jo.com</span>
                </div>
              </div>
            )}
          </div>

          {/* ERROR ALERT */}
          {submitError && (
            <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-400 font-mono">
              Delivery confirmed via Web3Forms Gateway
            </span>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#3F1215] hover:bg-[#2B0B0D] text-[#FEECE2] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                submitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#FEECE2] brand-dot-1" />
                    <div className="w-2 h-2 rounded-full bg-[#FEECE2] brand-dot-2" />
                    <div className="w-2 h-2 rounded-full bg-[#FEECE2] brand-dot-3" />
                  </div>
                  <span>Dispatching Ticket to Weblix...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Support Ticket</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
