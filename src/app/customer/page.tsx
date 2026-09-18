"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useBrand } from "@/components/BrandProvider";
import confetti from "canvas-confetti";
import {
  Coffee,
  Copy,
  Check,
  Gift,
  History,
  Bell,
  LogOut,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  X,
  AlertCircle,
  User,
  Plus,
} from "lucide-react";

// Official Google Multi-Color Icon
function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

interface CustomerData {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  phone?: string;
  rawPin: string;
  formattedPin: string;
  qrSecret: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: "Member" | "Silver" | "Gold";
  currencyValue: number;
  currency: string;
}

interface TransactionItem {
  _id: string;
  type: "EARN" | "REDEEM" | "ADJUST";
  billAmount?: number;
  points: number;
  balanceAfter: number;
  rewardTitle?: string;
  referenceCode: string;
  branchName?: string;
  cashierName?: string;
  notes?: string;
  createdAt: string;
}

interface RewardItem {
  _id: string;
  title: string;
  description: string;
  pointsRequired: number;
  category: string;
  canRedeem: boolean;
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const CUSTOMER_CACHE_KEY = "cove_customer_cached";
const CUSTOMER_ID_KEY = "cove_customer_id";
const CUSTOMER_TOKEN_KEY = "cove_customer_token";
const TRANSACTIONS_CACHE_KEY = "cove_transactions_cached";

export default function CustomerPage() {
  const { config, formatCurrency } = useBrand();

  // State
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<"card" | "rewards" | "history" | "notifications">("card");
  const [copied, setCopied] = useState(false);

  // Google Authentication State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Custom Google Signup Form State (for signing up with any new Google email)
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  // Redemption state
  const [redeemingReward, setRedeemingReward] = useState<RewardItem | null>(null);
  const [claimedVoucher, setClaimedVoucher] = useState<{ code: string; title: string } | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [googleRedirecting, setGoogleRedirecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Helper for dual persistence headers
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem(CUSTOMER_TOKEN_KEY);
      const savedId = localStorage.getItem(CUSTOMER_ID_KEY);
      if (savedToken) headers["x-customer-auth"] = savedToken;
      if (savedId) headers["x-customer-id"] = savedId;
    }
    return headers;
  };

  // Fetch Dashboard Data with dual persistence fallback
  const loadDashboard = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch("/api/customer/dashboard", { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        setTransactions(data.transactions || []);
        if (typeof window !== "undefined") {
          localStorage.setItem(CUSTOMER_CACHE_KEY, JSON.stringify(data.customer));
          localStorage.setItem(CUSTOMER_ID_KEY, data.customer.id);
          if (data.transactions) {
            localStorage.setItem(TRANSACTIONS_CACHE_KEY, JSON.stringify(data.transactions));
          }
        }
      } else {
        if (typeof window !== "undefined" && !localStorage.getItem(CUSTOMER_ID_KEY)) {
          setCustomer(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Rewards
  const loadRewards = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch("/api/customer/rewards", { headers });
      const data = await res.json();
      if (data.success) {
        setRewards(data.rewards || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Notifications
  const loadNotifications = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch("/api/customer/notifications", { headers });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // 1. Instant Cache Retrieval for 0ms render & permanent login preservation
    try {
      if (typeof window !== "undefined") {
        const cachedCustomer = localStorage.getItem(CUSTOMER_CACHE_KEY);
        const cachedTxs = localStorage.getItem(TRANSACTIONS_CACHE_KEY);
        if (cachedCustomer) {
          setCustomer(JSON.parse(cachedCustomer));
          if (cachedTxs) setTransactions(JSON.parse(cachedTxs));
          setLoading(false);
        }
      }
    } catch (e) {
      console.warn("Cache load failed", e);
    }

    loadDashboard();
    loadRewards();
    loadNotifications();

    // Auto-poll for live notifications every 20 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 20000);

    // Check if redirected with OAuth error parameter
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        if (err === "google_not_configured") {
          setAuthError("لم يتم ضبط مفتاح GOOGLE_CLIENT_ID في متغيرات بيئة Vercel أو الخادم. يرجى إضافته في إعدادات البيئة بالاستضافة، أو تسجيل الدخول المباشر بالأسفل.");
        } else if (err === "token_exchange_failed") {
          setAuthError("فشل استبدال رمز تسجيل الدخول مع Google (Token Exchange). تأكد من صحة GOOGLE_CLIENT_SECRET ومطابقة Redirect URI.");
        } else if (err === "missing_credentials") {
          setAuthError("بيانات Google OAuth غير مكتملة في الاستضافة (GOOGLE_CLIENT_ID أو GOOGLE_CLIENT_SECRET).");
        } else if (err === "redirect_uri_mismatch") {
          setAuthError("رابط إعادة التوجيه Redirect URI غير مسجل في Google Cloud Console. أضف رابط موقعك + /api/auth/google/callback.");
        } else if (err === "access_denied") {
          setAuthError("تم إلغاء عملية تسجيل الدخول من شاشة Google.");
        } else {
          setAuthError(`ملاحظة تسجيل الدخول مع Google: ${err}`);
        }
      }
    }

    return () => clearInterval(interval);
  }, []);

  const handleGoogleRedirect = () => {
    setGoogleRedirecting(true);
    setAuthError(null);
    window.location.href = "/api/auth/google/login";
  };

  // Copy 6-Digit PIN
  const handleCopyPin = () => {
    if (!customer?.rawPin) return;
    navigator.clipboard.writeText(customer.rawPin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Google Sign-In & Sign-Up
  const handleGoogleAuth = async (profile: {
    name: string;
    email: string;
    avatarUrl?: string;
    googleId?: string;
  }) => {
    setGoogleError(null);
    setGoogleLoading(true);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          if (data.token) localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
          if (data.user?._id || data.user?.id) {
            localStorage.setItem(CUSTOMER_ID_KEY, data.user._id || data.user.id);
          }
        }
        setShowGoogleModal(false);
        if (data.isNewUser) {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
        await loadDashboard();
        await loadRewards();
        await loadNotifications();
      } else {
        setGoogleError(data.error || "Google authentication failed");
      }
    } catch (err: any) {
      setGoogleError(err.message || "Network error during Google sign-in");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Custom Google Sign-Up Form Submit
  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) return;
    handleGoogleAuth({
      name: customName.trim(),
      email: customEmail.toLowerCase().trim(),
      googleId: `google_${customEmail.replace(/[^a-z0-9]/g, "_")}`,
    });
  };

  // Logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    if (typeof window !== "undefined") {
      localStorage.removeItem(CUSTOMER_CACHE_KEY);
      localStorage.removeItem(CUSTOMER_ID_KEY);
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      localStorage.removeItem(TRANSACTIONS_CACHE_KEY);
    }
    setCustomer(null);
    setActiveTab("card");
  };

  // Redeem Reward
  const handleRedeem = async (reward: RewardItem) => {
    setRedeemError(null);
    setRedeemLoading(true);
    try {
      const res = await fetch("/api/customer/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: reward._id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setClaimedVoucher({ code: data.voucherCode, title: data.rewardTitle });
        setRedeemingReward(null);
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
        await loadDashboard();
        await loadRewards();
        await loadNotifications();
      } else {
        setRedeemError(data.error || "Redemption failed");
      }
    } catch (e: any) {
      setRedeemError(e.message || "Redemption error");
    } finally {
      setRedeemLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const headers = getAuthHeaders();
      await fetch("/api/customer/notifications", { method: "POST", headers });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-neutral-300 border-t-[#2C221E] animate-spin" />
          <span className="text-xs font-mono text-neutral-500">Loading your loyalty pass...</span>
        </div>
      </div>
    );
  }

  // If Not Logged In, Show Google-Only Login & Sign-Up Screen
  if (!customer) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between p-6">
        <div className="max-w-md w-full mx-auto my-auto">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#3F1215] flex items-center justify-center text-white mx-auto mb-4 shadow-md overflow-hidden p-0.5 border border-[#3F1215]">
              <img src="/logo.png" alt="Cove" className="w-full h-full object-cover rounded-xl" />
            </div>
            <h1 className="text-2xl font-serif font-medium text-[#2B0B0D] mb-1">
              {config.storeName}
            </h1>
            <p className="text-sm text-neutral-500">{config.tagline}</p>
          </div>

          {/* Login Card (Google Authentication Only) */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm text-center">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Digital Loyalty Pass
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
                Sign in or create your instant digital member pass with your Google account in one tap.
              </p>
            </div>

            {authError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col gap-1.5 text-start">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span>تنبيه تسجيل الدخول / Notice</span>
                </div>
                <p className="text-amber-800 leading-relaxed text-[11px]">{authError}</p>
              </div>
            )}

            {/* Prominent Google Sign-In Button (Official Google OAuth) */}
            <button
              type="button"
              onClick={handleGoogleRedirect}
              disabled={googleRedirecting}
              className="w-full py-3.5 px-4 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-50 active:scale-98 text-neutral-800 text-sm font-medium flex items-center justify-center gap-3 transition-all shadow-xs disabled:opacity-70 cursor-pointer"
            >
              {googleRedirecting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-neutral-400 border-t-neutral-900 animate-spin" />
                  <span className="font-medium">جاري التحويل إلى Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5" />
                  <span className="font-medium">تسجيل الدخول باستخدام Google</span>
                </>
              )}
            </button>

            <div className="mt-3.5">
              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(true);
                  setShowNewAccountForm(true);
                }}
                className="text-xs text-neutral-600 hover:text-neutral-900 underline font-medium py-1 px-2 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                أو تسجيل الدخول بالاسم والبريد الإلكتروني مباشرة
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Secure Digital Pass Authentication</span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-400 py-4 font-mono">
          © 2026 {config.storeName} • Digital Member Pass
        </div>

        {/* MODAL: Direct Account Sign-In / Registration */}
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#EBD3C8] rounded-3xl p-7 max-w-md w-full shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#3F1215] flex items-center justify-center text-white text-[10px] font-bold">
                    C
                  </div>
                  <span className="text-sm font-semibold text-neutral-800">
                    بطاقة العضوية الرقمية
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowGoogleModal(false);
                    setGoogleError(null);
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-neutral-900 font-serif">
                  تسجيل الدخول / فتح بطاقة ولاء
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  برنامج ولاء ومكافآت <strong className="text-neutral-800">{config.storeName}</strong>
                </p>
              </div>

              {googleError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{googleError}</span>
                </div>
              )}

              {/* Clean Account Form */}
              <form onSubmit={handleCustomGoogleSubmit} className="space-y-4 mb-4">
                <div className="p-3 rounded-2xl bg-[#FAF5F2] border border-[#EBD3C8] text-xs text-neutral-700 mb-2">
                  أدخل الاسم والبريد الإلكتروني للوصول إلى بطاقة الولاء الخاصة بك فوراً وحفظ نقاطك:
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="الاسم الكامل"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs font-mono focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#EBD3C8] text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={googleLoading}
                    className="flex-1 py-2.5 rounded-xl bg-[#3F1215] hover:bg-[#2B0B0D] text-[#FEECE2] text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                  >
                    {googleLoading ? "جاري الدخول..." : "متابعة الدخول للبطاقة"}
                  </button>
                </div>
              </form>

              <p className="text-center text-[11px] text-neutral-400">
                بطاقتك الرقمية تظل محفوظة ومسجلة بشكل دائم على هذا الجهاز.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Authenticated Mobile-First Customer View
  return (
    <div className="min-h-screen bg-[#FAF5F2] flex flex-col justify-between pb-12">
      {/* Top Mobile Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#EBD3C8] sticky top-0 z-20 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3F1215] flex items-center justify-center text-white overflow-hidden p-0.5 border border-[#3F1215]">
              <img src="/logo.png" alt="Cove" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <span className="font-semibold text-xs tracking-tight text-[#2B0B0D] block font-serif">
                {config.storeName}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Digital Loyalty Member</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications button */}
            <button
              onClick={() => {
                setActiveTab("notifications");
                markAllRead();
              }}
              className="relative p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#3F1215]" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 flex-1">
        {/* Real-time Notification Banner */}
        {unreadCount > 0 && notifications.length > 0 && !notifications[0].isRead && activeTab !== "notifications" && (
          <div
            onClick={() => {
              setActiveTab("notifications");
              markAllRead();
            }}
            className="mb-4 p-3.5 rounded-2xl bg-[#3F1215] text-[#FEECE2] shadow-md flex items-center justify-between gap-3 cursor-pointer hover:bg-[#2B0B0D] transition-all border border-[#3F1215] animate-pulse"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#FEECE2]/20 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-[#FEECE2]" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate text-[#FEECE2]">
                  {notifications[0].title}
                </p>
                <p className="text-[11px] text-[#FEECE2]/80 truncate">
                  {notifications[0].message}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white/15 text-[#FEECE2] flex-shrink-0">
              عرض
            </span>
          </div>
        )}

        {/* Navigation Pills */}
        <div className="flex bg-[#EED9D1]/50 p-1 rounded-xl mb-4 text-xs font-medium border border-[#EBD3C8]">
          <button
            onClick={() => setActiveTab("card")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "card"
                ? "bg-white text-[#3F1215] shadow-xs font-semibold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            My Pass
          </button>

          <button
            onClick={() => setActiveTab("rewards")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "rewards"
                ? "bg-white text-[#3F1215] shadow-xs font-semibold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            Rewards
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "history"
                ? "bg-white text-[#3F1215] shadow-xs font-semibold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Ledger
          </button>
        </div>

        {/* TAB 1: THE CENTRAL CARD (EDITORIAL MINIMALIST CARD LAYOUT) */}
        {activeTab === "card" && (
          <div className="space-y-4">
            {/* The Main Member Card */}
            <div className="bg-white border border-[#EBD3C8] rounded-3xl p-6 shadow-sm relative overflow-hidden">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase tracking-wider font-mono text-neutral-400">
                      Member Pass
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        customer.tier === "Gold"
                          ? "bg-amber-50 text-amber-900 border-amber-200"
                          : customer.tier === "Silver"
                          ? "bg-slate-100 text-slate-800 border-slate-300"
                          : "bg-stone-50 text-stone-700 border-stone-200"
                      }`}
                    >
                      {customer.tier} Tier
                    </span>
                  </div>
                  <h2 className="text-xl font-medium text-[#2B0B0D] font-serif">
                    {customer.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <GoogleIcon className="w-3.5 h-3.5" />
                    <span className="text-xs text-neutral-500 font-mono">
                      {customer.email || customer.phone || "Google Member"}
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-[#3F1215] flex items-center justify-center text-white shadow-xs overflow-hidden p-0.5 border border-[#3F1215]">
                  <img src="/logo.png" alt="Cove" className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>

              {/* QR Code Section: Pristine White Box with Subtle Shadow */}
              <div className="my-6 flex flex-col items-center justify-center">
                <div className="p-4 bg-white rounded-2xl border border-[#EBD3C8] shadow-sm flex items-center justify-center">
                  <QRCodeSVG
                    value={customer.qrSecret}
                    size={184}
                    level="H"
                    includeMargin={false}
                    fgColor="#3F1215"
                  />
                </div>
                <span className="text-[11px] text-neutral-400 font-mono mt-2 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3F1215]" />
                  Dynamic Encrypted QR
                </span>
              </div>

              {/* 6-Digit PIN: Bold Monospace with Quick Copy */}
              <div className="bg-[#FAF5F2] border border-[#EBD3C8] rounded-2xl p-4 text-center">
                <span className="text-[11px] uppercase tracking-wider font-mono text-neutral-500 block mb-1">
                  Fallback 6-Digit Counter PIN
                </span>

                <div className="flex items-center justify-center gap-3">
                  <span className="font-pin text-2xl font-bold tracking-widest text-[#2B0B0D] select-all">
                    {customer.formattedPin}
                  </span>

                  <button
                    onClick={handleCopyPin}
                    className="p-1.5 rounded-lg border border-[#EBD3C8] bg-white hover:bg-[#FDF4F0] text-neutral-600 transition-colors active:scale-95 cursor-pointer"
                    title="Copy PIN"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {copied && (
                  <span className="text-[10px] font-mono text-[#3F1215] mt-1 block">
                    Copied to clipboard!
                  </span>
                )}
              </div>

              {/* Live Points Counter */}
              <div className="mt-6 pt-5 border-t border-[#EBD3C8]/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-neutral-400 block mb-0.5">
                    Available Balance
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tracking-tight text-[#3F1215] font-serif">
                      {customer.pointsBalance}
                    </span>
                    <span className="text-xs font-mono text-neutral-500 font-medium">pts</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider font-mono text-neutral-400 block mb-0.5">
                    Cash Valuation
                  </span>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-[#FDF4F0] border border-[#EBD3C8] text-xs font-semibold text-[#3F1215]">
                    = {formatCurrency(customer.currencyValue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action: Browse Rewards Shortcut */}
            <button
              onClick={() => setActiveTab("rewards")}
              className="w-full bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl p-4 flex items-center justify-between text-left transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#C87D55] flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-medium text-neutral-900 block">
                    Redeem Coffee & Treats
                  </span>
                  <span className="text-xs text-neutral-500">
                    {rewards.filter((r) => r.canRedeem).length} rewards currently available with your balance
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        )}

        {/* TAB 2: REWARDS CATALOGUE */}
        {activeTab === "rewards" && (
          <div className="space-y-3">
            <div className="bg-white border border-neutral-200 rounded-2xl p-4 mb-2 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs text-neutral-500 font-mono">Your Balance</span>
                <span className="text-lg font-bold text-neutral-900 block font-serif">
                  {customer.pointsBalance} pts
                </span>
              </div>
              <span className="text-xs text-[#1A5336] font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                = {formatCurrency(customer.currencyValue)} discount
              </span>
            </div>

            <div className="space-y-2.5">
              {rewards.map((reward) => {
                const canAfford = customer.pointsBalance >= reward.pointsRequired;
                return (
                  <div
                    key={reward._id}
                    className={`bg-white border rounded-2xl p-4 transition-all shadow-xs ${
                      canAfford ? "border-neutral-200" : "border-neutral-200/60 opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-0.5">
                          {reward.category}
                        </span>
                        <h4 className="text-sm font-semibold text-neutral-900">{reward.title}</h4>
                      </div>
                      <span className="text-sm font-bold font-mono text-[#2C221E] px-2 py-0.5 bg-stone-100 rounded-md">
                        {reward.pointsRequired} pts
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 mb-4 line-clamp-2 leading-relaxed">
                      {reward.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      {canAfford ? (
                        <button
                          onClick={() => {
                            setRedeemingReward(reward);
                            setRedeemError(null);
                          }}
                          className="w-full py-2 rounded-xl bg-[#3F1215] hover:bg-[#2B0B0D] text-[#FEECE2] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                        >
                          Redeem Voucher
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-between text-xs text-neutral-400 font-mono py-1">
                          <span>Need {reward.pointsRequired - customer.pointsBalance} more pts</span>
                          <span>Progress: {Math.round((customer.pointsBalance / reward.pointsRequired) * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTION LEDGER */}
        {activeTab === "history" && (
          <div className="bg-white border border-[#EBD3C8] rounded-3xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#2B0B0D] mb-4 pb-2 border-b border-[#EBD3C8]/60 font-serif">
              Loyalty Activity Log
            </h3>

            {transactions.length === 0 ? (
              <div className="text-center py-10 text-neutral-400 text-xs font-mono">
                No recorded transactions yet.
              </div>
            ) : (
              <div className="divide-y divide-[#EBD3C8]/50">
                {transactions.map((tx) => (
                  <div key={tx._id} className="py-3.5 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                            tx.type === "EARN"
                              ? "bg-[#FDF4F0] text-[#3F1215] border border-[#EBD3C8]"
                              : "bg-amber-50 text-amber-900 border border-amber-200"
                          }`}
                        >
                          {tx.type}
                        </span>
                        <span className="text-xs font-mono text-neutral-400">{tx.referenceCode}</span>
                      </div>

                      <div className="text-xs font-medium text-[#2B0B0D]">
                        {tx.rewardTitle || tx.notes || "Store Purchase"}
                      </div>

                      <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {tx.branchName && `• ${tx.branchName}`}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-sm font-bold font-mono ${
                          tx.points > 0 ? "text-[#3F1215]" : "text-neutral-800"
                        }`}
                      >
                        {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                      </span>
                      <span className="text-[11px] text-neutral-400 block font-mono">
                        Bal: {tx.balanceAfter}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: IN-APP NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="bg-white border border-[#EBD3C8] rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EBD3C8]/60">
              <h3 className="text-sm font-semibold text-[#2B0B0D] font-serif">Notifications</h3>
              <button
                onClick={markAllRead}
                className="text-xs font-mono text-neutral-500 hover:text-neutral-800"
              >
                Mark all read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-10 text-neutral-400 text-xs font-mono">
                No notifications to display.
              </div>
            ) : (
              <div className="divide-y divide-[#EBD3C8]/50">
                {notifications.map((n) => (
                  <div key={n._id} className="py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#2B0B0D]">{n.title}</span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {new Date(n.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: REDEMPTION CONFIRMATION */}
      {redeemingReward && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBD3C8] rounded-3xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#2B0B0D] font-serif">Confirm Redemption</h3>
              <button
                onClick={() => setRedeemingReward(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF5F2] rounded-2xl mb-4 border border-[#EBD3C8]">
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-1">
                Reward
              </span>
              <h4 className="text-sm font-semibold text-[#2B0B0D] font-serif">{redeemingReward.title}</h4>
              <p className="text-xs text-neutral-500 mt-1">{redeemingReward.description}</p>
              <div className="mt-3 pt-3 border-t border-[#EBD3C8] flex justify-between items-center text-xs font-mono">
                <span>Cost:</span>
                <span className="font-bold text-[#3F1215]">{redeemingReward.pointsRequired} Points</span>
              </div>
            </div>

            {redeemError && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs">
                {redeemError}
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => handleRedeem(redeemingReward)}
                disabled={redeemLoading}
                className="w-full py-3 rounded-xl bg-[#3F1215] hover:bg-[#2B0B0D] text-[#FEECE2] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {redeemLoading ? "Generating Voucher..." : "Confirm & Deduct Points"}
              </button>
              <button
                onClick={() => setRedeemingReward(null)}
                className="w-full py-2 rounded-xl text-neutral-500 hover:bg-[#FAF5F2] text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLAIMED VOUCHER DISPLAY */}
      {claimedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBD3C8] rounded-3xl p-6 max-w-sm w-full shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDF4F0] border border-[#EBD3C8] text-[#3F1215] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-medium text-[#2B0B0D] mb-1 font-serif">
              Voucher Generated!
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Present this voucher reference to the barista at the counter.
            </p>

            <div className="bg-[#FAF5F2] border border-[#EBD3C8] rounded-2xl p-4 mb-5">
              <span className="text-[10px] uppercase tracking-wider font-mono text-neutral-400 block mb-1">
                {claimedVoucher.title}
              </span>
              <span className="text-2xl font-bold font-mono tracking-widest text-[#3F1215] block">
                {claimedVoucher.code}
              </span>
            </div>

            <button
              onClick={() => setClaimedVoucher(null)}
              className="w-full py-3 rounded-xl bg-[#3F1215] text-[#FEECE2] text-xs font-semibold hover:bg-[#2B0B0D] transition-colors shadow-xs cursor-pointer"
            >
              Done & Return to Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
