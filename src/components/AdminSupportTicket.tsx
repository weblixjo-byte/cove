"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

interface AdminSupportTicketProps {
  storeName?: string;
  onReturnToDashboard?: () => void;
}

const CATEGORIES = [
  { id: "Bug / System Error", label: "Bug / System Error", desc: "Unexpected behavior or glitch" },
  { id: "POS & Cashier Flow", label: "POS & Cashier Flow", desc: "Numpad, scanning, or bill credit/redeem" },
  { id: "Customer Card & PIN", label: "Customer Card & PIN", desc: "Pass, QR code, or customer PIN" },
  { id: "Points & Calculation", label: "Points & Calculation", desc: "Points balance or redemption rules" },
  { id: "Performance & Speed", label: "Performance & Speed", desc: "Loading latency or lag" },
  { id: "Feature Request / Other", label: "Feature / Other", desc: "Request improvement or inquiry" },
];

export default function AdminSupportTicket({
  storeName = "Cove Coffee House",
  onReturnToDashboard,
}: AdminSupportTicketProps) {
  // Form State
  const [category, setCategory] = useState<string>("Bug / System Error");
  const [subject, setSubject] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Hidden System State (Sent in payload silently)
  const adminName = `${storeName} Admin`;
  const adminEmail = "info@weblix-jo.com";
  const urgency = "Normal";

  // Silent Background Diagnostics
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

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    timestamp: string;
  } | null>(null);

  // Auto-collect client diagnostics in background silently
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
      setSubmitError("Please enter a ticket subject.");
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setSubmitError("Please provide a description of the issue.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Primary: Submit via internal server endpoint
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          urgency,
          adminName,
          contactPhone: contactPhone.trim(),
          adminEmail,
          message: message.trim(),
          diagnostics,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setSubmittedTicket({
          id: data.ticketId || `TK-${Math.floor(100000 + Math.random() * 900000)}`,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        });
      } else {
        // 2. Fallback: Direct Web3Forms submission
        const fallbackTicketId = `TK-${Math.floor(100000 + Math.random() * 900000)}`;
        const fallbackRes = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: "7f0e27f4-7df7-4105-af7a-985d05cc02d1",
            subject: `[SUPPORT] [#${fallbackTicketId}] ${category}: ${subject.trim()}`,
            from_name: `${adminName} (${storeName})`,
            email: adminEmail,
            message: `TICKET ID: #${fallbackTicketId}\nSTORE: ${adminName}\nPHONE: ${contactPhone.trim()}\nCATEGORY: ${category}\n\nISSUE DETAILS:\n${message.trim()}\n\nDIAGNOSTICS:\n${JSON.stringify(diagnostics, null, 2)}`,
          }),
        });

        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && fallbackData.success) {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          setSubmittedTicket({
            id: fallbackTicketId,
            timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          });
        } else {
          setSubmitError(data.error || fallbackData.message || "Failed to submit ticket. Please try again.");
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
              <span className="font-semibold text-[#3F1215]">info@weblix-jo.com</span>. Our engineering team is reviewing it.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF5F2] border border-[#EBD3C8] max-w-md mx-auto text-xs text-neutral-600 space-y-1.5 text-start font-mono">
            <div className="flex justify-between">
              <span className="text-neutral-400">Category:</span>
              <span className="font-semibold text-[#3F1215]">{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Dispatched At:</span>
              <span className="text-neutral-700">{submittedTicket.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Status:</span>
              <span className="text-emerald-700 font-semibold">Received by Weblix</span>
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#EBD3C8]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#3F1215] text-[#FEECE2]">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#2B0B0D] font-serif">
              Technical Support Ticket
            </h2>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
            Direct communication channel to Weblix Engineering for issue resolution and technical assistance.
          </p>
        </div>

        <div className="shrink-0">
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200/80 px-3 py-1.5 rounded-full font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Priority Dispatch
          </span>
        </div>
      </div>

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-sm border border-[#EBD3C8] space-y-5">
          {/* CATEGORY DROPDOWN */}
          <div>
            <label className="text-xs font-bold text-[#2B0B0D] block mb-1.5 font-mono uppercase tracking-wider">
              Issue Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-select text-xs font-medium cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-neutral-900 bg-white">
                    {cat.label} — {cat.desc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-500 absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* SUBJECT & CONTACT PHONE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#2B0B0D] block mb-1.5 font-mono uppercase tracking-wider">
                Ticket Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full glass-input text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2B0B0D] block mb-1.5 font-mono uppercase tracking-wider">
                Contact Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full glass-input text-xs"
              />
            </div>
          </div>

          {/* DETAILED DESCRIPTION */}
          <div>
            <label className="text-xs font-bold text-[#2B0B0D] block mb-1.5 font-mono uppercase tracking-wider">
              Incident Description *
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full glass-input font-sans text-xs leading-relaxed resize-y"
              required
            />
          </div>

          {/* ERROR ALERT */}
          {submitError && (
            <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-2 flex justify-end">
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
                  <span>Dispatching Ticket...</span>
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
