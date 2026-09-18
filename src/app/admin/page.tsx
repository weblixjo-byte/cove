"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useBrand } from "@/components/BrandProvider";
import {
  LayoutDashboard,
  Settings,
  Gift,
  Users,
  Send,
  Coffee,
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  Check,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  X,
  Languages,
} from "lucide-react";
import { ITenantConfig, IReward, IUser, ITransaction } from "@/lib/types";

// Bilingual Dictionary for Admin Console
const i18n = {
  en: {
    langToggle: "العربية",
    superAdmin: "Super Admin",
    portalSubtitle: "Executive Portal",
    adminEmail: "Administrator Email",
    password: "Password",
    signIn: "Sign In to Admin",
    authenticating: "Authenticating...",
    defaultCredentials: "Default Credentials:",
    returnHome: "Return to Homepage Overview",
    navAnalytics: "Analytics & Metrics",
    navBranding: "White-Label & Rules",
    navRewards: "Rewards Catalogue",
    navCashiers: "Cashier Staff",
    navBroadcast: "Broadcast Center",
    signOut: "Sign Out",
    home: "Home",
    analyticsTitle: "Loyalty Performance & Metrics",
    analyticsSubtitle: "Real-time financial volume and customer retention tracking.",
    refreshData: "Refresh Data",
    cardRevenue: "Loyalty Revenue",
    cardRevenueSub: (txs: number) => `Tracked via ${txs} visits`,
    cardIssued: "Points Issued",
    cardIssuedSub: "Earned across store orders",
    cardRedeemed: "Points Redeemed",
    cardRedeemedSub: "Claimed for coffee & treats",
    cardMembers: "Member Base",
    cardMembersSub: "Active enrolled customers",
    topCustomers: "Top Loyal Customers",
    byLifetime: "By Lifetime Points",
    liveActivity: "Live Activity Stream",
    auditTrail: "Audit Trail",
    noTransactions: "No recorded transactions yet.",
    pts: "pts",
    bal: "Bal",
    brandingTitle: "White-Label Identity & Loyalty Rules",
    brandingSubtitle: "Instantly rebrand this application for any coffee shop or retail store.",
    savedSuccess: "White-label configurations saved and active across all customer and POS screens!",
    storeName: "Store Name",
    tagline: "Store Tagline / Slogan",
    currency: "Store Currency Symbol",
    welcomeBonus: "Signup Welcome Bonus (Points)",
    pointsPerUnit: "Earning Ratio (Points per 1.000 Currency)",
    pointsPerUnitHelp: (curr: string) => `e.g. 10 means spending 1 ${curr} earns 10 points.`,
    discountPer100: (curr: string) => `Redemption Rate (${curr} discount per 100 pts)`,
    discountPer100Help: (curr: string) => `e.g. 1.00 means 100 points = 1.000 ${curr} discount.`,
    themePalette: "Theme Palette (Editorial Minimalist)",
    primaryColor: "Primary Color",
    accentColor: "Action Accent Color",
    saveBranding: "Save White-Label Rules",
    savingBranding: "Saving Configuration...",
    rewardsTitle: "Rewards Catalogue",
    rewardsSubtitle: "Manage redeemable items and point costs for your customers.",
    addReward: "Add Reward",
    tblRewardTitle: "Reward Title",
    tblCategory: "Category",
    tblPointsCost: "Points Cost",
    tblRedemptions: "Redemptions",
    tblStatus: "Status",
    tblActions: "Actions",
    active: "Active",
    disabled: "Disabled",
    addRewardModalTitle: "Add Catalogue Reward",
    titleLabel: "Title",
    descriptionLabel: "Description",
    cancel: "Cancel",
    createReward: "Create Reward",
    deleteConfirm: "Are you sure you want to remove this reward?",
    cashiersTitle: "Cashier & Terminal Accounts",
    cashiersSubtitle: "Authorize register staff and manage terminal access PINs.",
    addCashier: "Add Cashier",
    tblStaffMember: "Staff Member",
    tblUsername: "Username",
    tblBranch: "Branch",
    tblPin: "POS PIN",
    authorized: "Authorized",
    suspended: "Suspended",
    deactivate: "Deactivate",
    reactivate: "Re-activate",
    addCashierModalTitle: "Create Cashier Account",
    fullName: "Full Name",
    usernameForPOS: "Username (for POS login)",
    createAccount: "Create Account",
    broadcastTitle: "Customer Broadcast Center",
    broadcastSubtitle: "Send in-app notifications and promotional loyalty points boosts to all members.",
    announcementTitle: "Announcement Title",
    notificationMessage: "Notification Message",
    optionalBonus: "Optional Bonus Points Gift (Points credited to every member)",
    bonusHelp: "Set to 0 for a standard announcement without a points grant.",
    sendBroadcast: "Send Broadcast to All Members",
    sendingBroadcast: "Dispatching Broadcast...",
    broadcastSuccessMsg: (bonusCount?: number, bonus?: string) =>
      `Broadcast sent successfully! ${bonusCount ? `+${bonus} points credited to ${bonusCount} members.` : ""}`,
  },
  ar: {
    langToggle: "English",
    superAdmin: "المدير العام",
    portalSubtitle: "البوابة الإدارية التنفيذية",
    adminEmail: "البريد الإلكتروني للمسؤول",
    password: "كلمة المرور",
    signIn: "تسجيل الدخول للوحة التحكم",
    authenticating: "جاري التحقق...",
    defaultCredentials: "بيانات الدخول التجريبية:",
    returnHome: "العودة إلى الصفحة الرئيسية",
    navAnalytics: "التحليلات والمؤشرات",
    navBranding: "الهوية وقواعد الولاء",
    navRewards: "كتالوج المكافآت",
    navCashiers: "طاقم الكاشير",
    navBroadcast: "مركز الإشعارات والرسائل",
    signOut: "تسجيل الخروج",
    home: "الرئيسية",
    analyticsTitle: "أداء برنامج الولاء والمؤشرات المالية",
    analyticsSubtitle: "متابعة فورية لحجم المبيعات وحركة النقاط ونشاط الزبائن.",
    refreshData: "تحديث البيانات",
    cardRevenue: "إجمالي المبيعات المسجلة",
    cardRevenueSub: (txs: number) => `من خلال ${txs} عملية شراء`,
    cardIssued: "النقاط الممنوحة",
    cardIssuedSub: "مكتسبة من طلبات الزبائن",
    cardRedeemed: "النقاط المستبدلة",
    cardRedeemedSub: "تم استبدالها بقهوة ومكافآت",
    cardMembers: "قاعدة الأعضاء",
    cardMembersSub: "زبائن مسجلين نشطين",
    topCustomers: "أكثر الزبائن ولاءً",
    byLifetime: "حسب إجمالي النقاط المكتسبة",
    liveActivity: "سجل العمليات المباشر",
    auditTrail: "سجل التدقيق المالي",
    noTransactions: "لا توجد عمليات مسجلة حتى الآن.",
    pts: "نقطة",
    bal: "الرصيد",
    brandingTitle: "إعدادات الهوية والعلامة التجارية وقواعد الولاء",
    brandingSubtitle: "أعد تخصيص التطبيق فوراً ليتناسب مع أي كافيه أو متجر تجزئة.",
    savedSuccess: "تم حفظ إعدادات الهوية بنجاح وتطبيقها فوراً على شاشات الزبائن ونقاط البيع!",
    storeName: "اسم المتجر / الكافيه",
    tagline: "الشعار اللفظي للمتجر (Slogan)",
    currency: "رمز العملة",
    welcomeBonus: "نقاط الترحيب عند تسجيل زبون جديد",
    pointsPerUnit: "معامل كسب النقاط (نقاط لكل 1 وحدة نقدية)",
    pointsPerUnitHelp: (curr: string) => `مثال: 10 تعني أن إنفاق 1 ${curr} يمنح الزبون 10 نقاط.`,
    discountPer100: (curr: string) => `قيمة الخصم بالـ (${curr}) لكل 100 نقطة`,
    discountPer100Help: (curr: string) => `مثال: 1.00 تعني أن 100 نقطة تمنح خصماً بقيمة 1.000 ${curr}.`,
    themePalette: "لوحة ألوان الهوية البصرية (Editorial Minimalist)",
    primaryColor: "اللون الأساسي (Primary)",
    accentColor: "لون التفاعل والإبراز (Accent)",
    saveBranding: "حفظ إعدادات الهوية",
    savingBranding: "جاري حفظ التعديلات...",
    rewardsTitle: "كتالوج المكافآت",
    rewardsSubtitle: "إدارة العناصر والمشروبات القابلة للاستبدال وتكلفة النقاط لكل منها.",
    addReward: "إضافة مكافأة جديدة",
    tblRewardTitle: "اسم المكافأة",
    tblCategory: "التصنيف",
    tblPointsCost: "تكلفة النقاط",
    tblRedemptions: "مرات الاستبدال",
    tblStatus: "الحالة",
    tblActions: "الإجراءات",
    active: "مفعل",
    disabled: "معطل",
    addRewardModalTitle: "إضافة مكافأة جديدة للكتالوج",
    titleLabel: "اسم المكافأة",
    descriptionLabel: "الوصف",
    cancel: "إلغاء",
    createReward: "حفظ المكافأة",
    deleteConfirm: "هل أنت متأكد من رغبتك في حذف هذه المكافأة؟",
    cashiersTitle: "حسابات طاقم الكاشير ونقاط البيع",
    cashiersSubtitle: "إدارة صلاحيات موظفي الصندوق وتعيين الرموز السرية (PIN) لأجهزة الـ POS.",
    addCashier: "إضافة كاشير جديد",
    tblStaffMember: "اسم الموظف",
    tblUsername: "اسم المستخدم",
    tblBranch: "الفرع",
    tblPin: "رمز الدخول (PIN)",
    authorized: "مفعل",
    suspended: "موقوف",
    deactivate: "إيقاف",
    reactivate: "إعادة تفعيل",
    addCashierModalTitle: "إنشاء حساب كاشير جديد",
    fullName: "الاسم الكامل",
    usernameForPOS: "اسم المستخدم (لتسجيل الدخول في الكاشير)",
    createAccount: "إنشاء الحساب",
    broadcastTitle: "مركز الإرسال والإعلانات العامة للزبائن",
    broadcastSubtitle: "إرسال إشعارات مباشرة داخل التطبيق مع إمكانية منح نقاط ولاء مجانية لكافة الأعضاء فوراً.",
    announcementTitle: "عنوان الإشعار أو العرض",
    notificationMessage: "نص الرسالة أو الإشعار",
    optionalBonus: "منحة نقاط ولاء مجانية إضافية (تُضاف تلقائياً لكل زبون مسجل)",
    bonusHelp: "اتركها 0 لإرسال إشعار عادي بدون إضافة نقاط مجانية.",
    sendBroadcast: "إرسال الإشعار لجميع الزبائن",
    sendingBroadcast: "جاري إرسال الإشعار والمنحة...",
    broadcastSuccessMsg: (bonusCount?: number, bonus?: string) =>
      `تم إرسال الإشعار بنجاح! ${bonusCount ? `وتمت إضافة +${bonus} نقطة مجانية لـ ${bonusCount} زبون.` : ""}`,
  },
};

interface MetricsData {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  activeCustomerCount: number;
  totalRevenueVolume: number;
  totalTransactions: number;
  cashierCount: number;
  rewardsCount: number;
  topCustomers: IUser[];
  recentTransactions: ITransaction[];
}

export default function AdminPage() {
  const { config, refreshConfig, formatCurrency } = useBrand();

  // Language State: 'ar' or 'en'
  const [lang, setLang] = useState<"en" | "ar">("ar");

  // Authentication State
  const [admin, setAdmin] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Login Form State
  const [emailInput, setEmailInput] = useState("admin@covecoffee.com");
  const [passwordInput, setPasswordInput] = useState("admin123");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"analytics" | "branding" | "rewards" | "cashiers" | "broadcast">("analytics");

  // Analytics State
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Branding Settings Form State
  const [brandForm, setBrandForm] = useState<Partial<ITenantConfig>>({});
  const [savingBrand, setSavingBrand] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);

  // Rewards State
  const [rewardsList, setRewardsList] = useState<IReward[]>([]);
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newReward, setNewReward] = useState({
    title: "",
    description: "",
    pointsRequired: 100,
    category: "Drinks",
    stock: 999,
  });

  // Cashiers State
  const [cashiersList, setCashiersList] = useState<any[]>([]);
  const [showAddCashierModal, setShowAddCashierModal] = useState(false);
  const [newCashier, setNewCashier] = useState({
    name: "",
    username: "",
    branchName: "Downtown Flagship",
    staffPin: "1234",
  });

  // Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastBonus, setBroadcastBonus] = useState<string>("0");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem("cove_admin_lang") as "en" | "ar" | null;
    if (saved) {
      setLang(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const next = lang === "ar" ? "en" : "ar";
    setLang(next);
    localStorage.setItem("cove_admin_lang", next);
  };

  const t = i18n[lang];

  // Check Admin Session
  const checkAdminSession = async () => {
    try {
      setLoadingSession(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.authenticated && data.user.role === "super_admin") {
        setAdmin(data.user);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoadingSession(false);
    }
  };

  // Load Analytics
  const loadMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Load Rewards
  const loadRewards = async () => {
    try {
      const res = await fetch("/api/admin/rewards");
      const data = await res.json();
      if (data.success) setRewardsList(data.rewards);
    } catch (e) {
      console.error(e);
    }
  };

  // Load Cashiers
  const loadCashiers = async () => {
    try {
      const res = await fetch("/api/admin/cashiers");
      const data = await res.json();
      if (data.success) setCashiersList(data.cashiers);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkAdminSession();
  }, []);

  useEffect(() => {
    if (admin) {
      loadMetrics();
      loadRewards();
      loadCashiers();
      setBrandForm({
        storeName: config.storeName,
        tagline: config.tagline,
        currency: config.currency,
        pointsPerUnit: config.pointsPerUnit,
        discountPer100Pts: config.discountPer100Pts,
        welcomeBonusPts: config.welcomeBonusPts,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor,
      });
    }
  }, [admin, config]);

  // Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "super_admin",
          email: emailInput,
          password: passwordInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdmin(data.user);
      } else {
        setLoginError(data.error || "Invalid administrator credentials");
      }
    } catch (err: any) {
      setLoginError(err.message || "Network error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAdmin(null);
  };

  // Save White-Label Branding Settings
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBrand(true);
    setBrandSaved(false);

    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshConfig();
        setBrandSaved(true);
        setTimeout(() => setBrandSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingBrand(false);
    }
  };

  // Add Reward
  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReward),
      });
      if (res.ok) {
        setShowAddRewardModal(false);
        setNewReward({ title: "", description: "", pointsRequired: 100, category: "Drinks", stock: 999 });
        await loadRewards();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Reward
  const handleDeleteReward = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await fetch(`/api/admin/rewards?id=${id}`, { method: "DELETE" });
      await loadRewards();
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Reward Active State
  const handleToggleReward = async (id: string, current: boolean) => {
    try {
      await fetch("/api/admin/rewards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      await loadRewards();
    } catch (e) {
      console.error(e);
    }
  };

  // Create Cashier
  const handleCreateCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/cashiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCashier),
      });
      if (res.ok) {
        setShowAddCashierModal(false);
        setNewCashier({ name: "", username: "", branchName: "Downtown Flagship", staffPin: "1234" });
        await loadCashiers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Cashier Active State
  const handleToggleCashier = async (id: string, current: boolean) => {
    try {
      await fetch("/api/admin/cashiers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      await loadCashiers();
    } catch (e) {
      console.error(e);
    }
  };

  // Send Broadcast Notification
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSending(true);
    setBroadcastSuccess(null);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          bonusPoints: parseInt(broadcastBonus) || 0,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastSuccess(t.broadcastSuccessMsg(data.bonusCreditedTo, broadcastBonus));
        setBroadcastTitle("");
        setBroadcastMessage("");
        setBroadcastBonus("0");
        await loadMetrics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBroadcastSending(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
      </div>
    );
  }

  // Admin Login Screen with Language Switcher
  if (!admin) {
    return (
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between p-6 transition-all"
      >
        {/* Language Toggle Top Bar */}
        <div className="max-w-sm w-full mx-auto flex justify-end">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors shadow-2xs"
          >
            <Languages className="w-3.5 h-3.5 text-neutral-500" />
            <span>{t.langToggle}</span>
          </button>
        </div>

        <div className="max-w-sm w-full mx-auto my-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
              <LayoutDashboard className="w-7 h-7 text-neutral-300" />
            </div>
            <h1 className="text-2xl font-serif font-medium text-neutral-900 mb-1">
              {config.storeName}
            </h1>
            <p className="text-xs text-neutral-500">{t.portalSubtitle}</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-7 shadow-sm">
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  {t.adminEmail}
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@covecoffee.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  {t.password}
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 mt-2"
              >
                {loginLoading ? t.authenticating : t.signIn}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
              <span className="text-[11px] font-mono text-neutral-400 block mb-1">
                {t.defaultCredentials}
              </span>
              <p className="text-xs font-mono text-neutral-700" dir="ltr">
                admin@covecoffee.com / admin123
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-400 py-4">
          <Link href="/" className="hover:text-neutral-700 underline">
            {t.returnHome}
          </Link>
        </div>
      </div>
    );
  }

  // Super Admin Layout (Bilingual RTL / LTR Supported)
  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row transition-all"
    >
      {/* Editorial Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-neutral-200 flex flex-col justify-between p-5 md:min-h-screen flex-shrink-0">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-neutral-100">
            <div className="w-9 h-9 rounded-xl bg-[#2C221E] flex items-center justify-center text-white flex-shrink-0">
              <Coffee className="w-4 h-4 text-[#E6D5C7]" />
            </div>
            <div className="truncate">
              <span className="font-semibold text-sm text-neutral-900 block leading-tight truncate">
                {config.storeName}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                {t.superAdmin}
              </span>
            </div>
          </div>

          {/* Language Switcher Pill */}
          <div className="mb-4 px-2">
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Languages className="w-3.5 h-3.5 text-neutral-500" />
                <span>{lang === "ar" ? "اللغة الحالية: العربية" : "Current: English"}</span>
              </div>
              <span className="text-[11px] font-semibold text-[#1A5336] underline">
                {t.langToggle}
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "analytics"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>{t.navAnalytics}</span>
            </button>

            <button
              onClick={() => setActiveTab("branding")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "branding"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>{t.navBranding}</span>
            </button>

            <button
              onClick={() => setActiveTab("rewards")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "rewards"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <Gift className="w-4 h-4 flex-shrink-0" />
              <span>{t.navRewards}</span>
            </button>

            <button
              onClick={() => setActiveTab("cashiers")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "cashiers"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{t.navCashiers}</span>
            </button>

            <button
              onClick={() => setActiveTab("broadcast")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "broadcast"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <Send className="w-4 h-4 flex-shrink-0" />
              <span>{t.navBroadcast}</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-neutral-100 space-y-2 mt-4 md:mt-0">
          <div className="px-2">
            <span className="text-xs font-medium text-neutral-900 block truncate">
              {admin.name}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono block truncate" dir="ltr">
              {admin.email}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/"
              className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              {t.home}
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.signOut}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-6 lg:p-10 max-w-6xl overflow-y-auto">
        {/* TAB 1: ANALYTICS & METRICS */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-medium text-neutral-900">
                  {t.analyticsTitle}
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {t.analyticsSubtitle}
                </p>
              </div>

              <button
                onClick={loadMetrics}
                disabled={loadingMetrics}
                className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 flex items-center gap-2 self-start transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? "animate-spin" : ""}`} />
                {t.refreshData}
              </button>
            </div>

            {/* Metrics Cards Grid (Editorial rounded-2xl, clean Line Icons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Revenue Volume */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-400 mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider">{t.cardRevenue}</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-serif text-neutral-900" dir="ltr">
                  {formatCurrency(metrics?.totalRevenueVolume || 0)}
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  {t.cardRevenueSub(metrics?.totalTransactions || 0)}
                </span>
              </div>

              {/* Card 2: Points Issued */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-400 mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider">{t.cardIssued}</span>
                  <TrendingUp className="w-4 h-4 text-[#1A5336]" />
                </div>
                <div className="text-2xl font-bold font-serif text-neutral-900" dir="ltr">
                  +{metrics?.totalPointsIssued.toLocaleString() || 0}
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block font-mono">
                  {t.cardIssuedSub}
                </span>
              </div>

              {/* Card 3: Points Redeemed */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-400 mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider">{t.cardRedeemed}</span>
                  <Award className="w-4 h-4 text-[#C87D55]" />
                </div>
                <div className="text-2xl font-bold font-serif text-neutral-900" dir="ltr">
                  -{metrics?.totalPointsRedeemed.toLocaleString() || 0}
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block font-mono">
                  {t.cardRedeemedSub}
                </span>
              </div>

              {/* Card 4: Active Customer Base */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-400 mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider">{t.cardMembers}</span>
                  <Users className="w-4 h-4 text-neutral-700" />
                </div>
                <div className="text-2xl font-bold font-serif text-neutral-900" dir="ltr">
                  {metrics?.activeCustomerCount || 0}
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block font-mono">
                  {t.cardMembersSub}
                </span>
              </div>
            </div>

            {/* Top Customers Leaderboard & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leaderboard */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-100 flex items-center justify-between">
                  <span>{t.topCustomers}</span>
                  <span className="text-xs font-mono text-neutral-400 font-normal">{t.byLifetime}</span>
                </h3>

                <div className="divide-y divide-neutral-100">
                  {metrics?.topCustomers.map((cust, idx) => (
                    <div key={cust._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-xs font-mono text-neutral-400 text-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-neutral-900">{cust.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-neutral-100 text-neutral-600">
                              {cust.tier}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400 font-mono" dir="ltr">
                            {cust.phone}
                          </span>
                        </div>
                      </div>

                      <div className={lang === "ar" ? "text-left" : "text-right"}>
                        <span className="text-xs font-bold font-mono text-neutral-900 block" dir="ltr">
                          {cust.lifetimePoints} {t.pts}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono" dir="ltr">
                          {t.bal}: {cust.pointsBalance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions Feed */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-100 flex items-center justify-between">
                  <span>{t.liveActivity}</span>
                  <span className="text-xs font-mono text-neutral-400 font-normal">{t.auditTrail}</span>
                </h3>

                {metrics?.recentTransactions.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-6 text-center">{t.noTransactions}</p>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {metrics?.recentTransactions.map((tx) => (
                      <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-medium ${
                                tx.type === "EARN"
                                  ? "bg-emerald-50 text-[#1A5336]"
                                  : "bg-amber-50 text-amber-800"
                              }`}
                            >
                              {tx.type}
                            </span>
                            <span className="font-semibold text-neutral-900">{tx.customerName}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono block">
                            {tx.referenceCode} • {tx.branchName || "Main"}
                          </span>
                        </div>

                        <div className={lang === "ar" ? "text-left" : "text-right"}>
                          <span
                            dir="ltr"
                            className={`font-mono font-bold block ${
                              tx.points > 0 ? "text-emerald-700" : "text-neutral-800"
                            }`}
                          >
                            {tx.points > 0 ? `+${tx.points}` : tx.points} {t.pts}
                          </span>
                          {tx.billAmount && (
                            <span className="text-[10px] text-neutral-400 font-mono block" dir="ltr">
                              {tx.billAmount.toFixed(3)} {config.currency}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WHITE-LABEL & RULES CONFIGURATION */}
        {activeTab === "branding" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-medium text-neutral-900">
                {t.brandingTitle}
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                {t.brandingSubtitle}
              </p>
            </div>

            <form onSubmit={handleSaveBrand} className="bg-white border border-neutral-200 rounded-3xl p-7 shadow-xs space-y-6">
              {brandSaved && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#1A5336] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{t.savedSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    {t.storeName}
                  </label>
                  <input
                    type="text"
                    value={brandForm.storeName || ""}
                    onChange={(e) => setBrandForm({ ...brandForm, storeName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    {t.tagline}
                  </label>
                  <input
                    type="text"
                    value={brandForm.tagline || ""}
                    onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    {t.currency}
                  </label>
                  <input
                    type="text"
                    value={brandForm.currency || ""}
                    onChange={(e) => setBrandForm({ ...brandForm, currency: e.target.value })}
                    placeholder="e.g. KWD, USD, SAR, AED"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-mono focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    {t.welcomeBonus}
                  </label>
                  <input
                    type="number"
                    value={brandForm.welcomeBonusPts || 0}
                    onChange={(e) =>
                      setBrandForm({ ...brandForm, welcomeBonusPts: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-mono focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    {t.pointsPerUnit}
                  </label>
                  <input
                    type="number"
                    value={brandForm.pointsPerUnit || 10}
                    onChange={(e) =>
                      setBrandForm({ ...brandForm, pointsPerUnit: parseFloat(e.target.value) || 10 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-mono focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    {t.pointsPerUnitHelp(brandForm.currency || "KWD")}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    {t.discountPer100(brandForm.currency || "KWD")}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={brandForm.discountPer100Pts || 1.0}
                    onChange={(e) =>
                      setBrandForm({ ...brandForm, discountPer100Pts: parseFloat(e.target.value) || 1.0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-mono focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    {t.discountPer100Help(brandForm.currency || "KWD")}
                  </span>
                </div>
              </div>

              {/* Brand Palette Settings */}
              <div className="pt-4 border-t border-neutral-100">
                <span className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
                  {t.themePalette}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">{t.primaryColor}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandForm.primaryColor || "#2C221E"}
                        onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-neutral-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={brandForm.primaryColor || "#2C221E"}
                        onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">{t.accentColor}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandForm.accentColor || "#1A5336"}
                        onChange={(e) => setBrandForm({ ...brandForm, accentColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-neutral-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={brandForm.accentColor || "#1A5336"}
                        onChange={(e) => setBrandForm({ ...brandForm, accentColor: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingBrand}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingBrand ? t.savingBranding : t.saveBranding}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: REWARDS CATALOGUE MANAGEMENT */}
        {activeTab === "rewards" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-medium text-neutral-900">
                  {t.rewardsTitle}
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {t.rewardsSubtitle}
                </p>
              </div>

              <button
                onClick={() => setShowAddRewardModal(true)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addReward}
              </button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 font-mono text-neutral-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-5 text-start">{t.tblRewardTitle}</th>
                      <th className="py-3 px-4 text-start">{t.tblCategory}</th>
                      <th className="py-3 px-4 text-start">{t.tblPointsCost}</th>
                      <th className="py-3 px-4 text-start">{t.tblRedemptions}</th>
                      <th className="py-3 px-4 text-start">{t.tblStatus}</th>
                      <th className="py-3 px-5 text-end">{t.tblActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {rewardsList.map((reward) => (
                      <tr key={reward._id} className="hover:bg-neutral-50/50">
                        <td className="py-3.5 px-5">
                          <span className="font-semibold text-neutral-900 block">{reward.title}</span>
                          <span className="text-[11px] text-neutral-400 line-clamp-1">{reward.description}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-600">{reward.category}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-900" dir="ltr">
                          {reward.pointsRequired} {t.pts}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-500">{reward.redemptionCount || 0}</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleReward(reward._id, reward.isActive)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              reward.isActive
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-neutral-100 text-neutral-500 border-neutral-200"
                            }`}
                          >
                            {reward.isActive ? t.active : t.disabled}
                          </button>
                        </td>
                        <td className="py-3.5 px-5 text-end">
                          <button
                            onClick={() => handleDeleteReward(reward._id)}
                            className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                            title="Delete Reward"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CASHIER STAFF ACCOUNTS */}
        {activeTab === "cashiers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-medium text-neutral-900">
                  {t.cashiersTitle}
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {t.cashiersSubtitle}
                </p>
              </div>

              <button
                onClick={() => setShowAddCashierModal(true)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addCashier}
              </button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 font-mono text-neutral-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-5 text-start">{t.tblStaffMember}</th>
                      <th className="py-3 px-4 text-start">{t.tblUsername}</th>
                      <th className="py-3 px-4 text-start">{t.tblBranch}</th>
                      <th className="py-3 px-4 text-start">{t.tblPin}</th>
                      <th className="py-3 px-4 text-start">{t.tblStatus}</th>
                      <th className="py-3 px-5 text-end">{t.tblActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {cashiersList.map((c) => (
                      <tr key={c.id} className="hover:bg-neutral-50/50">
                        <td className="py-3.5 px-5 font-semibold text-neutral-900">{c.name}</td>
                        <td className="py-3.5 px-4 font-mono text-neutral-600" dir="ltr">{c.username}</td>
                        <td className="py-3.5 px-4 text-neutral-600">{c.branchName}</td>
                        <td className="py-3.5 px-4 font-mono tracking-wider font-bold text-neutral-700" dir="ltr">
                          {c.staffPin}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              c.isActive
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-neutral-100 text-neutral-500 border-neutral-200"
                            }`}
                          >
                            {c.isActive ? t.authorized : t.suspended}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-end">
                          <button
                            onClick={() => handleToggleCashier(c.id, c.isActive)}
                            className="text-neutral-500 hover:text-neutral-900 text-xs underline"
                          >
                            {c.isActive ? t.deactivate : t.reactivate}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BROADCAST CENTER */}
        {activeTab === "broadcast" && (
          <div className="max-w-xl space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-medium text-neutral-900">
                {t.broadcastTitle}
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                {t.broadcastSubtitle}
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="bg-white border border-neutral-200 rounded-3xl p-7 shadow-xs space-y-5">
              {broadcastSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#1A5336] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{broadcastSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                  {t.announcementTitle}
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder={lang === "ar" ? "مثال: خصم مضاعف لنهاية الأسبوع بفرع المارينا" : "e.g. Weekend Double Points Weekend at Marina Branch"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900/10"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                  {t.notificationMessage}
                </label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder={lang === "ar" ? "اكتب تفاصيل الإعلان هنا..." : "Write your customer announcement here..."}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900/10"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                  {t.optionalBonus}
                </label>
                <input
                  type="number"
                  value={broadcastBonus}
                  onChange={(e) => setBroadcastBonus(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-mono focus:ring-2 focus:ring-neutral-900/10"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  {t.bonusHelp}
                </span>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  type="submit"
                  disabled={broadcastSending}
                  className="px-6 py-2.5 rounded-xl bg-[#1A5336] hover:bg-[#14422B] text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  {broadcastSending ? t.sendingBroadcast : t.sendBroadcast}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: ADD NEW REWARD */}
      {showAddRewardModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-md w-full shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-neutral-900">{t.addRewardModalTitle}</h3>
              <button onClick={() => setShowAddRewardModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">{t.titleLabel}</label>
                <input
                  type="text"
                  value={newReward.title}
                  onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                  placeholder={lang === "ar" ? "مثال: قهوة مقطرة كيمكس" : "e.g. Single Origin Pour-Over"}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">{t.descriptionLabel}</label>
                <input
                  type="text"
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  placeholder={lang === "ar" ? "إيحاءات الفواكه والمكسرات" : "Notes of jasmine and peach"}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">{t.tblPointsCost}</label>
                  <input
                    type="number"
                    value={newReward.pointsRequired}
                    onChange={(e) =>
                      setNewReward({ ...newReward, pointsRequired: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">{t.tblCategory}</label>
                  <select
                    value={newReward.category}
                    onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                  >
                    <option value="Drinks">{lang === "ar" ? "مشروبات" : "Drinks"}</option>
                    <option value="Food">{lang === "ar" ? "مأكولات ومخبوزات" : "Food"}</option>
                    <option value="Beans">{lang === "ar" ? "حبوب قهوة" : "Beans"}</option>
                    <option value="Merchandise">{lang === "ar" ? "أكواب ومنتجات" : "Merchandise"}</option>
                    <option value="Special">{lang === "ar" ? "عروض خاصة" : "Special"}</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRewardModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-600 hover:bg-neutral-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800"
                >
                  {t.createReward}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CASHIER */}
      {showAddCashierModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-md w-full shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-neutral-900">{t.addCashierModalTitle}</h3>
              <button onClick={() => setShowAddCashierModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCashier} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">{t.fullName}</label>
                <input
                  type="text"
                  value={newCashier.name}
                  onChange={(e) => setNewCashier({ ...newCashier, name: e.target.value })}
                  placeholder="e.g. Abdullah Al-Ghanim"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">{t.usernameForPOS}</label>
                <input
                  type="text"
                  value={newCashier.username}
                  onChange={(e) => setNewCashier({ ...newCashier, username: e.target.value })}
                  placeholder="e.g. cashier3"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-mono"
                  dir="ltr"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">{t.tblBranch}</label>
                  <input
                    type="text"
                    value={newCashier.branchName}
                    onChange={(e) => setNewCashier({ ...newCashier, branchName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">{t.tblPin}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newCashier.staffPin}
                    onChange={(e) => setNewCashier({ ...newCashier, staffPin: e.target.value })}
                    placeholder="1234"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-mono text-center tracking-widest"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCashierModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-600 hover:bg-neutral-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800"
                >
                  {t.createAccount}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
