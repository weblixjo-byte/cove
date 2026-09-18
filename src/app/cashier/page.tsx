"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useBrand } from "@/components/BrandProvider";
import confetti from "canvas-confetti";
import {
  ScanLine,
  Hash,
  Coffee,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowRight,
  Sparkles,
  User,
  CreditCard,
  Gift,
  RefreshCw,
  X,
  Store,
  ChevronRight,
  Camera,
} from "lucide-react";
import QrCameraScanner from "@/components/QrCameraScanner";

interface POSCustomer {
  id: string;
  name: string;
  phone: string;
  pin: string;
  tier: string;
  pointsBalance: number;
  lifetimePoints: number;
  currencyValue: number;
  currency: string;
  pointsPerUnit: number;
}

interface ReceiptData {
  referenceCode: string;
  customerName: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  oldBalance: number;
  newBalance: number;
  billAmount?: number;
  currency: string;
  tier: string;
  tierUpgraded?: boolean;
}

export default function CashierPage() {
  const { config, formatCurrency } = useBrand();

  // Cashier session state
  const [cashier, setCashier] = useState<{
    id: string;
    name: string;
    username: string;
    branchName: string;
  } | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Cashier login form state
  const [usernameInput, setUsernameInput] = useState("sajji");
  const [pinInput, setPinInput] = useState("2026");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // POS Workflow State
  const [activeMode, setActiveMode] = useState<"pin" | "qr" | "redeem">("pin");
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [pinQuery, setPinQuery] = useState("");
  const [qrQuery, setQrQuery] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [identifiedCustomer, setIdentifiedCustomer] = useState<POSCustomer | null>(null);

  // Bill & Transaction State
  const [billAmount, setBillAmount] = useState<string>("");
  const [transactLoading, setTransactLoading] = useState(false);
  const [transactError, setTransactError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  // Redemption State
  const [redeemPoints, setRedeemPoints] = useState<string>("80");
  const [rewardTitle, setRewardTitle] = useState<string>("Artisan Flat White");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // Check current session
  const checkSession = async () => {
    try {
      setLoadingSession(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.authenticated && (data.user.role === "cashier" || data.user.role === "super_admin")) {
        setCashier({
          id: data.user.id,
          name: data.user.name,
          username: data.user.username || "Staff",
          branchName: data.user.branchName || "Downtown Flagship",
        });
      } else {
        setCashier(null);
      }
    } catch {
      setCashier(null);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Cashier Login
  const handleCashierLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "cashier",
          username: usernameInput,
          staffPin: pinInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCashier(data.user);
      } else {
        setLoginError(data.error || "Authentication failed");
      }
    } catch (err: any) {
      setLoginError(err.message || "Network error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCashier(null);
    resetPOS();
  };

  // Fast Customer Lookup
  const performLookup = async (query: string) => {
    if (!query || query.trim().length < 4) return;
    setLookupError(null);
    setLookupLoading(true);

    try {
      const res = await fetch("/api/pos/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIdentifiedCustomer(data.customer);
      } else {
        setLookupError(data.error || "Customer not found");
        setIdentifiedCustomer(null);
      }
    } catch (e: any) {
      setLookupError(e.message || "Lookup error");
      setIdentifiedCustomer(null);
    } finally {
      setLookupLoading(false);
    }
  };

  // Handle scanned QR from live camera
  const handleQrScan = (decodedData: string) => {
    setShowCameraScanner(false);
    setQrQuery(decodedData);
    performLookup(decodedData);
  };

  // Reset POS for next customer
  const resetPOS = () => {
    setIdentifiedCustomer(null);
    setBillAmount("");
    setPinQuery("");
    setQrQuery("");
    setLookupError(null);
    setTransactError(null);
    setReceipt(null);
  };

  // Credit Points on Bill
  const handleCreditPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifiedCustomer) return;

    const amount = parseFloat(billAmount);
    if (isNaN(amount) || amount <= 0) {
      setTransactError("Please enter a valid bill amount greater than 0");
      return;
    }

    setTransactLoading(true);
    setTransactError(null);

    try {
      const res = await fetch("/api/pos/transact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: identifiedCustomer.id,
          billAmount: amount,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReceipt(data.receipt);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } else {
        setTransactError(data.error || "Failed to process transaction");
      }
    } catch (err: any) {
      setTransactError(err.message || "Network error");
    } finally {
      setTransactLoading(false);
    }
  };

  // Redeem Points
  const handleRedeemPoints = async () => {
    if (!identifiedCustomer) return;
    const pts = parseInt(redeemPoints);
    if (isNaN(pts) || pts <= 0) {
      setRedeemError("Invalid points to redeem");
      return;
    }

    setRedeemLoading(true);
    setRedeemError(null);

    try {
      const res = await fetch("/api/pos/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: identifiedCustomer.id,
          pointsToRedeem: pts,
          rewardTitle: rewardTitle || "Counter Discount",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReceipt(data.receipt);
        confetti({ particleCount: 40, spread: 50 });
      } else {
        setRedeemError(data.error || "Redemption failed");
      }
    } catch (e: any) {
      setRedeemError(e.message || "Network error");
    } finally {
      setRedeemLoading(false);
    }
  };

  // Calculate live preview of points for current bill
  const calculatedPoints = billAmount && !isNaN(parseFloat(billAmount))
    ? Math.floor(parseFloat(billAmount) * (config.pointsPerUnit || 10))
    : 0;

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-[#1A5336] animate-spin" />
      </div>
    );
  }

  // Cashier Login View
  if (!cashier) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between px-4 py-6 sm:p-6 overflow-y-auto">
        <div className="max-w-sm w-full mx-auto my-auto py-4">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#1A5336] text-white flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
              <ScanLine className="w-7 h-7 text-emerald-200" />
            </div>
            <h1 className="text-2xl font-serif font-medium text-neutral-900 mb-1">
              Cashier Terminal
            </h1>
            <p className="text-xs text-neutral-500">{config.storeName} • POS Verification</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 shadow-sm">
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleCashierLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Cashier Username / اسم المستخدم
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="sajji or ahmad"
                  className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 focus:border-[#1A5336]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  4-Digit Terminal PIN / رمز الدخول
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 focus:border-[#1A5336]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl bg-[#1A5336] text-white text-sm font-semibold hover:bg-[#14422B] transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
              >
                {loginLoading ? "Verifying PIN..." : "Open POS Terminal"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-neutral-100">
              <span className="text-[11px] uppercase tracking-wider font-mono text-neutral-400 block mb-2">
                Authorized Cashiers / حسابات الكاشير:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setUsernameInput("sajji");
                    setPinInput("2026");
                  }}
                  className="p-2.5 rounded-xl border border-neutral-200 text-left hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-semibold block text-neutral-900">Sajji</span>
                  <span className="text-neutral-500 font-mono text-[11px]">PIN: 2026</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsernameInput("ahmad");
                    setPinInput("1111");
                  }}
                  className="p-2.5 rounded-xl border border-neutral-200 text-left hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-semibold block text-neutral-900">Ahmad</span>
                  <span className="text-neutral-500 font-mono text-[11px]">PIN: 1111</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-400 py-4">
          <Link href="/" className="hover:text-neutral-700 underline">
            Return to Homepage Overview
          </Link>
        </div>
      </div>
    );
  }

  // Cashier POS Checkout Interface
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-neutral-200 px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1A5336] flex items-center justify-center text-white shrink-0 shadow-xs">
              <ScanLine className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs sm:text-sm text-neutral-900 truncate">
                  {config.storeName} POS
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#1A5336] font-medium shrink-0">
                  Active
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 block truncate max-w-[130px] sm:max-w-none">
                Staff: {cashier.name} • {cashier.branchName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={resetPOS}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Terminal</span>
              <span className="sm:hidden">Reset</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* POS Content Body */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex-1">
        {/* STEP 1: Fast Customer Identification (Dual Large Actions) */}
        {!identifiedCustomer && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-serif font-medium text-neutral-900 mb-1 sm:mb-2">
                Identify Customer / البحث عن الزبون
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                وجه الكاميرا لمسح رمز الـ QR أو أدخل رمز الزبون المكون من 6 أرقام.
              </p>
            </div>

            {/* Two Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveMode("pin");
                  setLookupError(null);
                }}
                className={`p-4 sm:p-5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  activeMode === "pin"
                    ? "border-[#1A5336] bg-emerald-50/50 text-[#1A5336] shadow-xs ring-1 ring-[#1A5336]"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <Hash className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold text-xs sm:text-sm">6-Digit PIN</span>
                <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono">
                  رمز الزبون
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode("qr");
                  setShowCameraScanner(true);
                  setLookupError(null);
                }}
                className={`p-4 sm:p-5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  activeMode === "qr"
                    ? "border-[#1A5336] bg-emerald-50/50 text-[#1A5336] shadow-xs ring-1 ring-[#1A5336]"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <ScanLine className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold text-xs sm:text-sm">Scan QR Code</span>
                <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono">
                  كاميرا الـ QR
                </span>
              </button>
            </div>

            {/* Input Form based on Active Mode */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-5 sm:p-7 shadow-sm">
              {lookupError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 text-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              {activeMode === "pin" ? (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">
                    Customer 6-Digit PIN / الرمز السري المكون من 6 أرقام
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={pinQuery}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPinQuery(val);
                        if (val.length === 6) {
                          performLookup(val);
                        }
                      }}
                      placeholder="482910"
                      className="flex-1 px-3 sm:px-4 py-3 sm:py-3.5 rounded-2xl border border-neutral-200 text-center font-pin text-xl sm:text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 focus:border-[#1A5336]"
                      autoFocus
                    />
                    <button
                      onClick={() => performLookup(pinQuery)}
                      disabled={lookupLoading || pinQuery.length < 6}
                      className="px-4 sm:px-6 rounded-2xl bg-[#1A5336] text-white text-xs sm:text-sm font-semibold hover:bg-[#14422B] transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      {lookupLoading ? "Looking..." : "Lookup"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Primary Big Camera Scan Trigger */}
                  <button
                    type="button"
                    onClick={() => setShowCameraScanner(true)}
                    className="w-full py-4 px-4 rounded-2xl bg-[#1A5336] hover:bg-[#14422B] text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-emerald-300 animate-pulse" />
                    <span>تشغيل كاميرا الموبايل للمسح المباشر (Open Camera)</span>
                  </button>

                  <div className="flex items-center gap-2 my-2">
                    <div className="flex-1 h-px bg-neutral-200" />
                    <span className="text-[11px] text-neutral-400 font-mono">أو إدخال رمز الـ QR يدوياً</span>
                    <div className="flex-1 h-px bg-neutral-200" />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">
                      Scanned QR Token / Payload
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={qrQuery}
                        onChange={(e) => setQrQuery(e.target.value)}
                        placeholder="Paste or type QR token (e.g. cove_token_...)"
                        className="flex-1 px-3.5 py-3 rounded-xl border border-neutral-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 focus:border-[#1A5336]"
                      />
                      <button
                        onClick={() => performLookup(qrQuery)}
                        disabled={lookupLoading || !qrQuery}
                        className="px-4 sm:px-6 rounded-xl bg-[#1A5336] text-white text-xs font-semibold hover:bg-[#14422B] transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                      >
                        {lookupLoading ? "Scanning..." : "Verify"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* STEP 2: Customer Identified - Smooth Pop-up / Action Card */}
        {identifiedCustomer && !receipt && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Customer Details Summary Card */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-[#2C221E] font-serif text-xl font-bold">
                  {identifiedCustomer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {identifiedCustomer.name}
                    </h3>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        identifiedCustomer.tier === "Gold"
                          ? "bg-amber-50 text-amber-900 border-amber-200"
                          : identifiedCustomer.tier === "Silver"
                          ? "bg-slate-100 text-slate-800 border-slate-300"
                          : "bg-stone-50 text-stone-700 border-stone-200"
                      }`}
                    >
                      {identifiedCustomer.tier}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    {identifiedCustomer.phone} • PIN: {identifiedCustomer.pin}
                  </p>
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#2C221E] font-serif">
                    {identifiedCustomer.pointsBalance}
                  </span>
                  <span className="text-xs font-mono text-neutral-500">pts</span>
                </div>
                <span className="text-xs font-semibold text-[#1A5336] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  = {formatCurrency(identifiedCustomer.currencyValue)} discount
                </span>
              </div>
            </div>

            {/* Tab Selector: Issue Points (Default) vs. Redeem Reward */}
            <div className="flex bg-neutral-200/60 p-1 rounded-2xl text-xs font-medium">
              <button
                onClick={() => setActiveMode("pin")}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeMode !== "redeem"
                    ? "bg-white text-neutral-900 shadow-xs font-semibold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Credit Points on Bill
              </button>

              <button
                onClick={() => setActiveMode("redeem")}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeMode === "redeem"
                    ? "bg-white text-neutral-900 shadow-xs font-semibold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Gift className="w-4 h-4" />
                Redeem Reward / Discount
              </button>
            </div>

            {/* FLOW A: Direct Bill Input (Points Earning) */}
            {activeMode !== "redeem" ? (
              <div className="bg-white border border-neutral-200 rounded-3xl p-7 shadow-sm">
                <h4 className="text-sm font-semibold text-neutral-900 mb-1">
                  Input Bill Total
                </h4>
                <p className="text-xs text-neutral-500 mb-6">
                  Points are credited automatically based on store rules ({config.pointsPerUnit} pts per 1.000 {config.currency}).
                </p>

                {transactError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                    {transactError}
                  </div>
                )}

                <form onSubmit={handleCreditPoints} className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">
                      Total Ticket Amount ({config.currency})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.05"
                        min="0.1"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        placeholder="0.000"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border border-neutral-200 text-2xl sm:text-3xl font-bold font-serif focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20 focus:border-[#1A5336]"
                        autoFocus
                        required
                      />
                      <span className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 font-mono text-sm text-neutral-400">
                        {config.currency}
                      </span>
                    </div>

                    {/* Quick amount chips for fast mobile cashier input */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {[0.5, 1, 1.5, 2, 3, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            const current = parseFloat(billAmount) || 0;
                            setBillAmount((current + val).toFixed(3));
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-800 text-xs font-mono font-medium transition-all cursor-pointer"
                        >
                          +{val.toFixed(3)}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setBillAmount("")}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-50 hover:bg-red-50 active:scale-95 text-neutral-500 hover:text-red-600 text-xs font-mono font-medium transition-all cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Real-Time Points Preview */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-700">
                      Loyalty Points to Credit:
                    </span>
                    <span className="text-lg font-bold font-mono text-[#1A5336]">
                      +{calculatedPoints} Points
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetPOS}
                      className="px-5 py-3 rounded-2xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={transactLoading || !billAmount || parseFloat(billAmount) <= 0}
                      className="flex-1 py-3.5 rounded-2xl bg-[#1A5336] hover:bg-[#14422B] text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-xs"
                    >
                      {transactLoading ? "Processing Bill..." : "Credit Points & Complete"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* FLOW B: Reward Redemption / Points Deduction */
              <div className="bg-white border border-neutral-200 rounded-3xl p-7 shadow-sm">
                <h4 className="text-sm font-semibold text-neutral-900 mb-1">
                  Redeem Rewards or Cash Discount
                </h4>
                <p className="text-xs text-neutral-500 mb-6">
                  Deduct customer points for handcrafted beverages or custom bill discounts.
                </p>

                {redeemError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                    {redeemError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                      Reward or Reason
                    </label>
                    <select
                      value={rewardTitle}
                      onChange={(e) => {
                        setRewardTitle(e.target.value);
                        if (e.target.value === "Artisan Flat White") setRedeemPoints("80");
                        if (e.target.value === "Kyoto Cold Brew") setRedeemPoints("120");
                        if (e.target.value === "Pistachio Croissant") setRedeemPoints("90");
                        if (e.target.value === `Bill Discount (1.000 ${config.currency})`) setRedeemPoints("100");
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                    >
                      <option value="Artisan Flat White">Artisan Flat White / Latte (80 pts)</option>
                      <option value="Kyoto Cold Brew">Kyoto Cold Brew (120 pts)</option>
                      <option value="Pistachio Croissant">Fresh Pistachio Croissant (90 pts)</option>
                      <option value={`Bill Discount (1.000 ${config.currency})`}>Cash Discount 1.000 {config.currency} (100 pts)</option>
                      <option value="Custom Redemption">Custom Points Deduction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                      Points to Deduct
                    </label>
                    <input
                      type="number"
                      value={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                      required
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={resetPOS}
                      className="px-5 py-2.5 rounded-2xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-medium"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleRedeemPoints}
                      disabled={redeemLoading || parseInt(redeemPoints) > identifiedCustomer.pointsBalance}
                      className="flex-1 py-3 rounded-2xl bg-[#2C221E] hover:bg-[#3E322D] text-white text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      {redeemLoading ? "Redeeming..." : "Confirm Redemption"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Tactile Success Receipt Modal */}
        {receipt && (
          <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-xl text-center max-h-[90vh] overflow-y-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-[#1A5336] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-medium text-neutral-900 font-serif mb-1">
                Transaction Successful
              </h3>
              <p className="text-xs text-neutral-500 mb-6">
                Receipt reference #{receipt.referenceCode} logged.
              </p>

              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 mb-6 text-left space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Customer</span>
                  <span className="font-semibold text-neutral-900">{receipt.customerName}</span>
                </div>

                {receipt.billAmount && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Bill Total</span>
                    <span className="font-mono font-medium text-neutral-900">
                      {receipt.billAmount.toFixed(3)} {receipt.currency}
                    </span>
                  </div>
                )}

                {receipt.pointsEarned ? (
                  <div className="flex justify-between text-[#1A5336] font-semibold">
                    <span>Points Credited</span>
                    <span className="font-mono">+{receipt.pointsEarned} pts</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-neutral-800 font-semibold">
                    <span>Points Redeemed</span>
                    <span className="font-mono">-{receipt.pointsRedeemed} pts</span>
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm">
                  <span className="text-neutral-900">New Balance</span>
                  <span className="font-mono text-[#2C221E]">{receipt.newBalance} pts</span>
                </div>

                {receipt.tierUpgraded && (
                  <div className="p-2 bg-amber-50 text-amber-900 rounded-lg text-center font-medium mt-2">
                    🌟 Customer promoted to {receipt.tier} Tier!
                  </div>
                )}
              </div>

              <button
                onClick={resetPOS}
                className="w-full py-3.5 rounded-2xl bg-[#1A5336] hover:bg-[#14422B] text-white text-sm font-semibold transition-colors shadow-xs"
              >
                Next Customer in Line
              </button>
            </div>
          </div>
        )}

        {/* Live Mobile Camera QR Scanner Modal */}
        {showCameraScanner && (
          <QrCameraScanner
            onScan={handleQrScan}
            onClose={() => setShowCameraScanner(false)}
          />
        )}
      </main>

      <footer className="border-t border-neutral-200 bg-white py-4 px-6 text-center text-xs text-neutral-400">
        Cove Coffee House POS Terminal • Real-Time Transaction Engine
      </footer>
    </div>
  );
}
