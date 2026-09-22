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
  { id: "Bug / System Glitch", label: "Bug / System Glitch", desc: "Software errors, crashes, or glitches" },
  { id: "POS & Cashier Flow", label: "POS & Cashier Flow", desc: "Numpad, scanning, or bill credit/redeem" },
  { id: "Customer Card & PIN", label: "Customer Card & PIN", desc: "Pass, QR code, or customer PIN" },
  { id: "Points & Calculation", label: "Points & Calculation", desc: "Points balance or redemption rules" },
  { id: "Performance & Speed", label: "Performance & Speed", desc: "Loading latency or lag" },
  { id: "Feature Request / Other", label: "Feature Request / Other", desc: "Request improvement or inquiry" },
];

export default function AdminSupportTicket({
  storeName = "Cove Coffee House",
  onReturnToDashboard,
}: AdminSupportTicketProps) {
  // Form State matching UI Exactly
  const [category, setCategory] = useState<string>("Bug / System Glitch");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");

  // Hidden System Metadata
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
      setSubmitError("Please provide a summary of the issue.");
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setSubmitError("Please explain what happened in detail.");
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
    setCategory("Bug / System Glitch");
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

  // TICKET FORM SCREEN - Matching User Mockup Exactly with Brand Colors
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Header Row matching image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#3F1215] text-[#FEECE2] flex items-center justify-center shadow-xs shrink-0">
            <LifeBuoy className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#2B0B0D] font-serif leading-tight">
              Technical Support & Issue Tickets
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Submit bugs, POS glitches, or technical requests directly to the engineering team.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/90 text-emerald-800 text-xs font-mono flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Direct Line: info@weblix-jo.com</span>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit}>
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xs border border-[#EBD3C8] space-y-5">
          {/* FIELD 1: ISSUE CATEGORY */}
          <div>
            <label className="text-[11px] font-bold text-neutral-500 block mb-2 font-mono uppercase tracking-wider">
              ISSUE CATEGORY
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border-1.5 border-[#EBD3C8] bg-white px-4 py-3.5 text-xs sm:text-sm text-[#2B0B0D] font-mono cursor-pointer appearance-none outline-none focus:border-[#3F1215] focus:ring-2 focus:ring-[#3F1215]/10 shadow-2xs transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-neutral-900 bg-white">
                    {cat.label} &nbsp; {cat.desc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* FIELD 2: SUBJECT / SUMMARY */}
          <div>
            <label className="text-[11px] font-bold text-neutral-500 block mb-2 font-mono uppercase tracking-wider">
              SUBJECT / SUMMARY
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue or inquiry..."
              className="w-full rounded-2xl border-1.5 border-[#EBD3C8] bg-white px-4 py-3.5 text-xs sm:text-sm text-[#2B0B0D] placeholder:text-neutral-400 outline-none focus:border-[#3F1215] focus:ring-2 focus:ring-[#3F1215]/10 shadow-2xs transition-all"
              required
            />
          </div>

          {/* FIELD 3: DETAILED DESCRIPTION */}
          <div>
            <label className="text-[11px] font-bold text-neutral-500 block mb-2 font-mono uppercase tracking-wider">
              DETAILED DESCRIPTION
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain what happened in detail: steps to reproduce, customer PIN or reward code (if relevant), error messages, or what needs fixing..."
              className="w-full rounded-2xl border-1.5 border-[#EBD3C8] bg-white px-4 py-3.5 text-xs sm:text-sm text-[#2B0B0D] placeholder:text-neutral-400 outline-none focus:border-[#3F1215] focus:ring-2 focus:ring-[#3F1215]/10 shadow-2xs transition-all leading-relaxed resize-y font-sans"
              required
            />
          </div>

          {/* FIELD 4: PHONE / WHATSAPP (OPTIONAL) */}
          <div>
            <label className="text-[11px] font-bold text-neutral-500 block mb-2 font-mono uppercase tracking-wider">
              PHONE / WHATSAPP (OPTIONAL)
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+962 7X XXX XXXX"
              className="w-full rounded-2xl border-1.5 border-[#EBD3C8] bg-white px-4 py-3.5 text-xs sm:text-sm text-[#2B0B0D] placeholder:text-neutral-400 outline-none focus:border-[#3F1215] focus:ring-2 focus:ring-[#3F1215]/10 shadow-2xs transition-all font-mono"
            />
          </div>

          {/* ERROR ALERT */}
          {submitError && (
            <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* BOTTOM ROW */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-neutral-400 font-mono">
              Dispatched directly to engineering team via Web3Forms.
            </span>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#3F1215] hover:bg-[#2B0B0D] text-[#FEECE2] text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 ${
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
