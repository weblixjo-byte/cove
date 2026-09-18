"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useBrand } from "@/components/BrandProvider";
import confetti from "canvas-confetti";
import {
  ScanLine,
  Hash,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Gift,
  RefreshCw,
  X,
  Camera,
  Delete,
  User,
  Plus,
  Receipt,
  Check,
  ChevronLeft,
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
  const [usernameInput, setUsernameInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // POS Workflow State
  const [activeMode, setActiveMode] = useState<"pin" | "qr">("pin");
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [pinQuery, setPinQuery] = useState("");
  const [qrQuery, setQrQuery] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [identifiedCustomer, setIdentifiedCustomer] = useState<POSCustomer | null>(null);

  // Active Transaction Tab: "credit" or "redeem"
  const [actionTab, setActionTab] = useState<"credit" | "redeem">("credit");

  // Bill & Transaction State
  const [billAmount, setBillAmount] = useState<string>("");
  const [transactLoading, setTransactLoading] = useState(false);
  const [transactError, setTransactError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  // Redemption State
  const [redeemPoints, setRedeemPoints] = useState<string>("80");
  const [rewardTitle, setRewardTitle] = useState<string>("فلات وايت فاخر");
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
          username: data.user.username || "sajji",
          branchName: data.user.branchName || "الفرع الرئيسي",
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
          username: usernameInput.trim(),
          staffPin: pinInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCashier(data.user);
      } else {
        setLoginError(data.error || "اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (err: any) {
      setLoginError(err.message || "حدث خطأ في الاتصال بالخادم");
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
        setLookupError(data.error || "لم يتم العثور على الزبون. تأكد من صحة الرمز.");
        setIdentifiedCustomer(null);
      }
    } catch (e: any) {
      setLookupError(e.message || "خطأ في البحث عن الزبون");
      setIdentifiedCustomer(null);
    } finally {
      setLookupLoading(false);
    }
  };

  // Handle tactile on-screen keypad press
  const handleKeypadPress = (digit: string) => {
    if (pinQuery.length >= 6) return;
    const newPin = pinQuery + digit;
    setPinQuery(newPin);
    if (newPin.length === 6) {
      performLookup(newPin);
    }
  };

  const handleKeypadBackspace = () => {
    setPinQuery((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setPinQuery("");
    setLookupError(null);
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
    setRedeemError(null);
    setReceipt(null);
    setActionTab("credit");
  };

  // Credit Points on Bill
  const handleCreditPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifiedCustomer) return;

    const amount = parseFloat(billAmount);
    if (isNaN(amount) || amount <= 0) {
      setTransactError("يرجى إدخال قيمة فاتورة صحيحة أكبر من 0");
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
        setTransactError(data.error || "فشلت عملية إضافة النقاط");
      }
    } catch (err: any) {
      setTransactError(err.message || "خطأ في الاتصال بالخادم");
    } finally {
      setTransactLoading(false);
    }
  };

  // Redeem Points
  const handleRedeemPoints = async () => {
    if (!identifiedCustomer) return;
    const pts = parseInt(redeemPoints);
    if (isNaN(pts) || pts <= 0) {
      setRedeemError("يرجى تحديد عدد نقاط صحيح للاستبدال");
      return;
    }

    if (pts > identifiedCustomer.pointsBalance) {
      setRedeemError(`رصيد الزبون لا يكفي (${identifiedCustomer.pointsBalance} نقطة متوفرة)`);
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
          rewardTitle: rewardTitle || "خصم على الطلب",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReceipt(data.receipt);
        confetti({ particleCount: 40, spread: 50 });
      } else {
        setRedeemError(data.error || "فشلت عملية استبدال المكافأة");
      }
    } catch (e: any) {
      setRedeemError(e.message || "خطأ في الاتصال بالخادم");
    } finally {
      setRedeemLoading(false);
    }
  };

  // Calculate live preview of points for current bill
  const calculatedPoints =
    billAmount && !isNaN(parseFloat(billAmount))
      ? Math.floor(parseFloat(billAmount) * (config.pointsPerUnit || 10))
      : 0;

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#FAF5F2] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-[#3F1215] animate-spin" />
      </div>
    );
  }

  // ==========================================
  // Cashier Login View (Mobile-First Arabic)
  // ==========================================
  if (!cashier) {
    return (
      <div className="min-h-screen bg-[#FAF5F2] flex flex-col justify-between p-4 sm:p-6 select-none font-sans" dir="rtl">
        <div className="max-w-sm w-full mx-auto my-auto py-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#3F1215] flex items-center justify-center mx-auto mb-3 shadow-md border border-[#3F1215]/20 overflow-hidden p-0.5">
              <img src="/logo.png" alt="Cove" className="w-full h-full object-cover rounded-xl" />
            </div>
            <h1 className="text-2xl font-bold text-[#2B0B0D] mb-1">
              شاشة الكاشير
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              نظام نقاط البيع والولاء • Cove POS
            </p>
          </div>

          <div className="bg-white border border-[#EBD3C8] rounded-3xl p-6 sm:p-7 shadow-xs">
            {loginError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleCashierLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2B0B0D] mb-1.5">
                  اسم المستخدم للكاشير
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="مثال: sajji"
                  className="w-full px-3.5 py-3 rounded-xl border border-[#EBD3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215] bg-[#FAF5F2]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B0B0D] mb-1.5">
                  رمز المرور السري
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-3 rounded-xl border border-[#EBD3C8] text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215] bg-[#FAF5F2]/40"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl bg-[#3F1215] text-[#FEECE2] text-sm font-bold hover:bg-[#2B0B0D] transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
              >
                {loginLoading ? "جاري تسجيل الدخول..." : "فتح نقطة البيع"}
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-500 py-4 flex items-center justify-center gap-4">
          <Link href="/admin" className="hover:text-[#3F1215] font-medium transition-colors">
            لوحة الإدارة
          </Link>
          <span className="text-neutral-300">•</span>
          <Link href="/customer" className="hover:text-[#3F1215] font-medium transition-colors">
            بطاقة الزبون
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // Cashier POS Checkout Interface (Mobile-First Arabic)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FAF5F2] flex flex-col justify-between select-none font-sans" dir="rtl">
      {/* Top Header - Super Compact & Clean on Mobile */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#EBD3C8] px-3.5 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-20 shadow-xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          {/* Cashier Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#3F1215] flex items-center justify-center text-white shrink-0 overflow-hidden p-0.5 border border-[#3F1215]/20">
              <img src="/logo.png" alt="Cove" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-[#2B0B0D] truncate">
                  كاشير {config.storeName}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="متصل" />
              </div>
              <span className="text-[11px] text-neutral-500 block truncate">
                الكاشير: {cashier.name}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={resetPOS}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#EBD3C8] bg-white hover:bg-[#FDF4F0] text-xs font-semibold text-[#2B0B0D] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#3F1215]" />
              <span className="text-xs">تصفير</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 rounded-xl text-neutral-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* POS Main Screen */}
      <main className="max-w-2xl mx-auto w-full px-3.5 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-start">
        {/* ============================================================== */}
        {/* STEP 1: Fast Customer Identification (Mobile Touch First)    */}
        {/* ============================================================== */}
        {!identifiedCustomer && (
          <div className="w-full max-w-md mx-auto space-y-3.5">
            {/* Mode Switcher Buttons */}
            <div className="grid grid-cols-2 gap-2 bg-neutral-200/50 p-1 rounded-2xl border border-[#EBD3C8]/60">
              <button
                type="button"
                onClick={() => {
                  setActiveMode("pin");
                  setLookupError(null);
                }}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeMode === "pin"
                    ? "bg-[#3F1215] text-[#FEECE2] shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Hash className="w-4 h-4" />
                <span>رمز الزبون (PIN)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode("qr");
                  setShowCameraScanner(true);
                  setLookupError(null);
                }}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeMode === "qr"
                    ? "bg-[#3F1215] text-[#FEECE2] shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>مسح الـ QR للكاميرا</span>
              </button>
            </div>

            {/* Error Message */}
            {lookupError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 text-right">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-medium">{lookupError}</span>
              </div>
            )}

            {/* MODE 1: 6-DIGIT PIN WITH OPTIONAL TACTILE NUMPAD */}
            {activeMode === "pin" && (
              <div className="bg-white border border-[#EBD3C8] rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="text-center">
                  <span className="text-xs font-semibold text-neutral-500 block mb-1">
                    أدخل رمز الزبون المكون من 6 أرقام
                  </span>

                  {/* 6 Digit Display Boxes */}
                  <div className="flex justify-center gap-2 my-2 dir-ltr">
                    {[0, 1, 2, 3, 4, 5].map((idx) => {
                      const char = pinQuery[idx];
                      return (
                        <div
                          key={idx}
                          className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold font-mono transition-all ${
                            char
                              ? "border-[#3F1215] bg-[#FDF4F0] text-[#3F1215]"
                              : idx === pinQuery.length
                              ? "border-[#3F1215] bg-white animate-pulse"
                              : "border-[#EBD3C8] bg-[#FAF5F2]/50 text-neutral-300"
                          }`}
                        >
                          {char || "•"}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tactile On-Screen Numpad for Mobile Fast Entry */}
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeypadPress(num)}
                      disabled={lookupLoading}
                      className="h-12 sm:h-13 rounded-2xl bg-[#FAF5F2] hover:bg-[#FDF4F0] active:scale-95 border border-[#EBD3C8] text-[#2B0B0D] font-bold text-lg font-mono flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleKeypadClear}
                    className="h-12 sm:h-13 rounded-2xl bg-[#FAF5F2] hover:bg-neutral-100 active:scale-95 border border-[#EBD3C8] text-neutral-500 font-semibold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    تصفير
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress("0")}
                    disabled={lookupLoading}
                    className="h-12 sm:h-13 rounded-2xl bg-[#FAF5F2] hover:bg-[#FDF4F0] active:scale-95 border border-[#EBD3C8] text-[#2B0B0D] font-bold text-lg font-mono flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleKeypadBackspace}
                    className="h-12 sm:h-13 rounded-2xl bg-[#FAF5F2] hover:bg-red-50 active:scale-95 border border-[#EBD3C8] text-neutral-600 hover:text-red-600 font-bold flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Button */}
                <button
                  type="button"
                  onClick={() => performLookup(pinQuery)}
                  disabled={lookupLoading || pinQuery.length < 6}
                  className="w-full py-3.5 rounded-2xl bg-[#3F1215] text-[#FEECE2] text-sm font-bold hover:bg-[#2B0B0D] transition-all disabled:opacity-40 cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-98"
                >
                  {lookupLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>جاري البحث عن الزبون...</span>
                    </>
                  ) : (
                    <>
                      <span>البحث بالرمز</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* MODE 2: QR SCANNER BUTTON & MANUAL TOKEN */}
            {activeMode === "qr" && (
              <div className="bg-white border border-[#EBD3C8] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#FDF4F0] border border-[#EBD3C8] text-[#3F1215] flex items-center justify-center mx-auto">
                  <ScanLine className="w-8 h-8 animate-pulse" />
                </div>

                <div>
                  <h3 className="font-bold text-[#2B0B0D] text-sm sm:text-base mb-1">
                    مسح الرمز الشريطي QR
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    افتح كاميرا الهاتف لمسح بطاقة الزبون مباشرة أو أدخل الرمز يدوياً.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCameraScanner(true)}
                  className="w-full py-4 px-4 rounded-2xl bg-[#3F1215] hover:bg-[#2B0B0D] text-[#FEECE2] text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-[#FEECE2]" />
                  <span>فتح الكاميرا للمسح المباشر</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#EBD3C8]"></div>
                  <span className="shrink mx-3 text-neutral-400 text-[11px]">أو لصق الرمز يدوياً</span>
                  <div className="flex-grow border-t border-[#EBD3C8]"></div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrQuery}
                    onChange={(e) => setQrQuery(e.target.value)}
                    placeholder="رمز الـ QR المكتوب..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                  />
                  <button
                    type="button"
                    onClick={() => performLookup(qrQuery)}
                    disabled={lookupLoading || !qrQuery}
                    className="px-4 py-2.5 rounded-xl bg-[#3F1215] text-[#FEECE2] text-xs font-bold hover:bg-[#2B0B0D] transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    {lookupLoading ? "تحقق..." : "تأكيد"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: Customer Identified - Mobile-Optimized Action Screen */}
        {/* ============================================================== */}
        {identifiedCustomer && !receipt && (
          <div className="w-full max-w-lg mx-auto space-y-4">
            {/* Customer Profile Card */}
            <div className="bg-white border border-[#EBD3C8] rounded-3xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF4F0] border border-[#EBD3C8] flex items-center justify-center text-[#3F1215] text-xl font-bold shrink-0">
                    {identifiedCustomer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-[#2B0B0D] truncate">
                        {identifiedCustomer.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          identifiedCustomer.tier === "Gold"
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : identifiedCustomer.tier === "Silver"
                            ? "bg-slate-100 text-slate-800 border-slate-300"
                            : "bg-[#FDF4F0] text-[#3F1215] border-[#EBD3C8]"
                        }`}
                      >
                        {identifiedCustomer.tier}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5 truncate">
                      {identifiedCustomer.phone} • رمز: {identifiedCustomer.pin}
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetPOS}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-[#FAF5F2] transition-colors shrink-0"
                  title="تغيير الزبون"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Balance Bar */}
              <div className="bg-[#FAF5F2] border border-[#EBD3C8]/80 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-500 block">رصيد النقاط الحالي</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#3F1215] font-mono">
                      {identifiedCustomer.pointsBalance}
                    </span>
                    <span className="text-xs text-neutral-500 font-semibold">نقطة</span>
                  </div>
                </div>
                <div className="text-left bg-white px-3 py-1.5 rounded-xl border border-[#EBD3C8]/70 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 block font-medium">قيمة الخصم النقدي</span>
                  <span className="text-xs font-bold text-[#3F1215] font-mono">
                    {formatCurrency(identifiedCustomer.currencyValue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Switcher: Credit Points vs. Redeem Reward */}
            <div className="grid grid-cols-2 gap-2 bg-neutral-200/50 p-1 rounded-2xl border border-[#EBD3C8]/60">
              <button
                type="button"
                onClick={() => {
                  setActionTab("credit");
                  setTransactError(null);
                }}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  actionTab === "credit"
                    ? "bg-[#3F1215] text-[#FEECE2] shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>إضافة نقاط (فاتورة)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionTab("redeem");
                  setRedeemError(null);
                }}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  actionTab === "redeem"
                    ? "bg-[#3F1215] text-[#FEECE2] shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>استبدال مكافأة</span>
              </button>
            </div>

            {/* TAB A: CREDIT POINTS ON BILL */}
            {actionTab === "credit" && (
              <div className="bg-white border border-[#EBD3C8] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-[#2B0B0D] mb-1">
                    قيمة الفاتورة الإجمالية
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    يحصل الزبون على {config.pointsPerUnit || 10} نقاط مقابل كل 1.000 {config.currency}.
                  </p>
                </div>

                {transactError && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{transactError}</span>
                  </div>
                )}

                <form onSubmit={handleCreditPoints} className="space-y-4">
                  {/* Bill Amount Input with clean embedded RTL currency */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      المبلغ المطلوب ({config.currency})
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.05"
                        min="0.05"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        placeholder="0.000"
                        className="w-full pl-16 pr-4 py-3.5 rounded-2xl border-2 border-[#EBD3C8] text-2xl font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215] bg-[#FAF5F2]/30 text-left dir-ltr"
                        autoFocus
                        required
                      />
                      <span className="absolute left-3 px-2.5 py-1 rounded-xl bg-[#FAF5F2] border border-[#EBD3C8] text-xs font-bold text-[#3F1215] font-mono pointer-events-none">
                        {config.currency}
                      </span>
                    </div>

                    {/* Quick Amount Add Chips for Mobile Cashier */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {[0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            const current = parseFloat(billAmount) || 0;
                            setBillAmount((current + val).toFixed(3));
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-[#FAF5F2] hover:bg-[#FDF4F0] active:scale-95 border border-[#EBD3C8] text-[#2B0B0D] text-xs font-mono font-bold transition-all cursor-pointer"
                        >
                          +{val.toFixed(3)}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setBillAmount("")}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 border border-neutral-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        مسح
                      </button>
                    </div>
                  </div>

                  {/* Real-time points preview */}
                  <div className="p-3.5 bg-[#FDF4F0] border border-[#EBD3C8] rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B0B0D]">
                      <Sparkles className="w-4 h-4 text-[#3F1215]" />
                      <span>النقاط المكتسبة للزبون:</span>
                    </div>
                    <span className="text-base font-black font-mono text-[#3F1215]">
                      +{calculatedPoints} نقطة
                    </span>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={resetPOS}
                      className="px-4 py-3 rounded-2xl border border-[#EBD3C8] text-neutral-600 hover:bg-[#FAF5F2] text-xs font-bold transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>

                    <button
                      type="submit"
                      disabled={transactLoading || !billAmount || parseFloat(billAmount) <= 0}
                      className="flex-1 py-3.5 rounded-2xl bg-[#3F1215] hover:bg-[#2B0B0D] text-[#FEECE2] text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
                    >
                      {transactLoading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                          <span>جاري تسجيل العملية...</span>
                        </>
                      ) : (
                        <>
                          <span>تأكيد وإضافة النقاط</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB B: REDEEM REWARD / DISCOUNT */}
            {actionTab === "redeem" && (
              <div className="bg-white border border-[#EBD3C8] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-[#2B0B0D] mb-1">
                    استبدال مكافأة أو خصم مباشر
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    خصم نقاط من رصيد الزبون مقابل مشروب أو خصم على الفاتورة.
                  </p>
                </div>

                {redeemError && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{redeemError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      اختر المكافأة أو سبب الخصم
                    </label>
                    <select
                      value={rewardTitle}
                      onChange={(e) => {
                        setRewardTitle(e.target.value);
                        if (e.target.value === "فلات وايت فاخر") setRedeemPoints("80");
                        if (e.target.value === "كيوتو كولد برو") setRedeemPoints("120");
                        if (e.target.value === "كرواسون فستق طازج") setRedeemPoints("90");
                        if (e.target.value === `خصم نقدي بقيمة 1.000 ${config.currency}`) setRedeemPoints("100");
                      }}
                      className="w-full px-3.5 py-3 rounded-xl border border-[#EBD3C8] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 bg-[#FAF5F2]/40"
                    >
                      <option value="فلات وايت فاخر">فلات وايت / لاتيه فاخر (80 نقطة)</option>
                      <option value="كيوتو كولد برو">كيوتو كولد برو بارد (120 نقطة)</option>
                      <option value="كرواسون فستق طازج">كرواسون فستق طازج (90 نقطة)</option>
                      <option value={`خصم نقدي بقيمة 1.000 ${config.currency}`}>خصم نقدي 1.000 {config.currency} (100 نقطة)</option>
                      <option value="خصم مخصص">خصم نقاط يدوي مخصص</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      النقاط المراد خصمها
                    </label>
                    <input
                      type="number"
                      value={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-[#EBD3C8] text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 bg-[#FAF5F2]/40"
                      required
                    />
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={resetPOS}
                      className="px-4 py-3 rounded-2xl border border-[#EBD3C8] text-neutral-600 hover:bg-[#FAF5F2] text-xs font-bold transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>

                    <button
                      type="button"
                      onClick={handleRedeemPoints}
                      disabled={
                        redeemLoading ||
                        !redeemPoints ||
                        parseInt(redeemPoints) <= 0 ||
                        parseInt(redeemPoints) > identifiedCustomer.pointsBalance
                      }
                      className="flex-1 py-3.5 rounded-2xl bg-[#3F1215] hover:bg-[#2B0B0D] text-[#FEECE2] text-sm font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm active:scale-98 flex items-center justify-center gap-2"
                    >
                      {redeemLoading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                          <span>جاري الخصم...</span>
                        </>
                      ) : (
                        <>
                          <span>تأكيد استبدال المكافأة</span>
                          <Gift className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: Transaction Success Receipt Modal                     */}
        {/* ============================================================== */}
        {receipt && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#EBD3C8] rounded-3xl p-5 sm:p-7 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-[#FDF4F0] border-2 border-[#EBD3C8] text-[#3F1215] flex items-center justify-center mx-auto mb-3 shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-[#3F1215]" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#2B0B0D] mb-1">
                تمت العملية بنجاح!
              </h3>
              <p className="text-xs text-neutral-500 mb-4 font-mono">
                رقم الإيصال: #{receipt.referenceCode}
              </p>

              <div className="bg-[#FAF5F2] border border-[#EBD3C8] rounded-2xl p-4 mb-5 text-right space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">الزبون:</span>
                  <span className="font-bold text-[#2B0B0D]">{receipt.customerName}</span>
                </div>

                {receipt.billAmount && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">قيمة الفاتورة:</span>
                    <span className="font-mono font-bold text-[#2B0B0D]">
                      {receipt.billAmount.toFixed(3)} {receipt.currency}
                    </span>
                  </div>
                )}

                {receipt.pointsEarned ? (
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                    <span>النقاط المضافة:</span>
                    <span className="font-mono">+{receipt.pointsEarned} نقطة</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-neutral-800 font-bold bg-neutral-100 px-2 py-1 rounded-lg">
                    <span>النقاط المخصومة:</span>
                    <span className="font-mono">-{receipt.pointsRedeemed} نقطة</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#EBD3C8] flex justify-between font-extrabold text-sm">
                  <span className="text-[#2B0B0D]">الرصيد الجديد:</span>
                  <span className="font-mono text-[#3F1215]">{receipt.newBalance} نقطة</span>
                </div>

                {receipt.tierUpgraded && (
                  <div className="p-2 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-center font-bold mt-2">
                    🌟 تمت ترقية فئة الزبون إلى {receipt.tier}!
                  </div>
                )}
              </div>

              <button
                onClick={resetPOS}
                className="w-full py-3.5 rounded-2xl bg-[#3F1215] hover:bg-[#2B0B0D] text-[#FEECE2] text-sm font-bold transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>الزبون التالي في الدور</span>
                <ArrowLeft className="w-4 h-4" />
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

      {/* Mobile-Friendly Footer */}
      <footer className="border-t border-[#EBD3C8]/60 bg-white py-2.5 px-4 text-center text-[11px] text-neutral-400">
        نظام كوف لنقاط البيع • مزامنة فورية مع تطبيق الزبون
      </footer>
    </div>
  );
}
