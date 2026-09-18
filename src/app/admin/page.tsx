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
  Search,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { ITenantConfig, IReward, IUser, ITransaction } from "@/lib/types";

// Bilingual Dictionary for Admin Console
const i18n = {
  en: {
    langToggle: "English",
    superAdmin: "Super Admin",
    portalSubtitle: "Executive Portal",
    adminEmail: "Administrator Email",
    password: "Password",
    signIn: "Sign In to Admin",
    authenticating: "Authenticating...",
    defaultCredentials: "Administrator Credentials:",
    openCashier: "Cashier POS Terminal",
    openCustomer: "Customer Pass",
    returnHome: "Open Cashier Terminal",
    navAnalytics: "Analytics & KPIs",
    navCustomers: "Customers",
    navRewards: "Rewards Catalogue",
    navCashiers: "POS Cashiers",
    navBroadcast: "Notifications",
    signOut: "Sign Out",
    home: "Cashier POS",
    analyticsTitle: "Executive Analytics & Metrics",
    analyticsSubtitle: "Real-time overview of loyalty performance, financial volume, and member activity.",
    refreshData: "Refresh Data",
    cardRevenue: "Total Revenue Volume",
    cardRevenueSub: (txs: number) => `From ${txs} total transactions`,
    cardIssued: "Points Issued",
    cardIssuedSub: "Credited for store purchases",
    cardRedeemed: "Points Redeemed",
    cardRedeemedSub: "Claimed for rewards & perks",
    cardMembers: "Active Members",
    cardMembersSub: "Registered loyalty customers",
    topCustomers: "Top Loyal Members",
    byLifetime: "Ranked by Lifetime Points",
    liveActivity: "Recent Activity Log",
    auditTrail: "Financial & Loyalty Audit",
    noTransactions: "No recorded transactions yet.",
    pts: "pts",
    bal: "Bal",
    customersTitle: "Customer Directory",
    customersSubtitle: "Complete overview of all registered members, points balances, and quick actions.",
    searchPlaceholder: "Search by name, phone, or email...",
    totalCustomers: "Total Registered Members",
    totalPointsHeld: "Points in Circulation",
    tblCustomer: "Member",
    tblPhoneEmail: "Contact",
    tblTier: "Tier",
    tblBalance: "Current Balance",
    tblLifetime: "Lifetime Points",
    tblJoined: "Joined Date",
    tblSendNotif: "Send Notice",
    rewardsTitle: "Rewards Catalogue",
    rewardsSubtitle: "Manage redeemable items, images, and point costs.",
    addReward: "Add New Reward",
    tblRewardTitle: "Reward Title",
    tblCategory: "Category",
    tblPointsCost: "Points Cost",
    tblRedemptions: "Redemptions",
    tblStatus: "Status",
    tblActions: "Actions",
    active: "Active",
    disabled: "Disabled",
    addRewardModalTitle: "Add New Reward",
    titleLabel: "Reward Title",
    descriptionLabel: "Description",
    rewardImage: "Image URL",
    rewardImageHelp: "Paste an image URL or choose a preset below",
    presets: "Quick Presets:",
    cancel: "Cancel",
    createReward: "Save Reward",
    deleteConfirm: "Are you sure you want to remove this reward?",
    cashiersTitle: "Cashier Accounts & POS Terminals",
    cashiersSubtitle: "Manage authorized staff and POS access PINs.",
    addCashier: "Add Cashier",
    tblStaffMember: "Staff Name",
    tblUsername: "Username",
    tblBranch: "Branch",
    tblPin: "PIN",
    authorized: "Active",
    suspended: "Suspended",
    deactivate: "Deactivate",
    reactivate: "Activate",
    addCashierModalTitle: "Create Cashier Account",
    fullName: "Full Name",
    usernameForPOS: "Username",
    createAccount: "Create Account",
    broadcastTitle: "Customer Broadcast & Notification Center",
    broadcastSubtitle: "Dispatch in-app notifications and promotional loyalty points boosts.",
    announcementTitle: "Announcement Title",
    notificationMessage: "Notification Message",
    optionalBonus: "Optional Bonus Points Gift",
    bonusHelp: "Set to 0 for a standard notification without a points grant.",
    audienceLabel: "Target Audience",
    audienceAll: "All Members (Broadcast)",
    audienceSingle: "Specific Member (Direct)",
    selectCustomer: "Select Customer",
    noCustomersFound: "No registered customers found",
    sendBroadcast: "Send Broadcast to All Members",
    sendToSingle: "Send Direct Notification",
    sendingBroadcast: "Dispatching Notification...",
    broadcastSuccessMsg: (bonusCount?: number, bonus?: string, recipientName?: string, pushDevices?: number) => {
      const pushNote = pushDevices && pushDevices > 0 ? ` (Real push delivered to ${pushDevices} device${pushDevices > 1 ? "s" : ""})` : "";
      return recipientName
        ? `Notification sent to ${recipientName}! ${bonusCount ? `+${bonus} bonus points credited.` : ""}${pushNote}`
        : `Broadcast sent successfully! ${bonusCount ? `+${bonus} points credited to ${bonusCount} members.` : ""}${pushNote}`;
    },
  },
  ar: {
    langToggle: "English",
    superAdmin: "Super Admin",
    portalSubtitle: "Executive Portal",
    adminEmail: "Administrator Email",
    password: "Password",
    signIn: "Sign In to Admin",
    authenticating: "Authenticating...",
    defaultCredentials: "Administrator Credentials:",
    openCashier: "Cashier POS Terminal",
    openCustomer: "Customer Pass",
    returnHome: "Open Cashier Terminal",
    navAnalytics: "Analytics & KPIs",
    navCustomers: "Customers",
    navRewards: "Rewards Catalogue",
    navCashiers: "POS Cashiers",
    navBroadcast: "Notifications",
    signOut: "Sign Out",
    home: "Cashier POS",
    analyticsTitle: "Executive Analytics & Metrics",
    analyticsSubtitle: "Real-time overview of loyalty performance, financial volume, and member activity.",
    refreshData: "Refresh Data",
    cardRevenue: "Total Revenue Volume",
    cardRevenueSub: (txs: number) => `From ${txs} total transactions`,
    cardIssued: "Points Issued",
    cardIssuedSub: "Credited for store purchases",
    cardRedeemed: "Points Redeemed",
    cardRedeemedSub: "Claimed for rewards & perks",
    cardMembers: "Active Members",
    cardMembersSub: "Registered loyalty customers",
    topCustomers: "Top Loyal Members",
    byLifetime: "Ranked by Lifetime Points",
    liveActivity: "Recent Activity Log",
    auditTrail: "Financial & Loyalty Audit",
    noTransactions: "No recorded transactions yet.",
    pts: "pts",
    bal: "Bal",
    customersTitle: "Customer Directory",
    customersSubtitle: "Complete overview of all registered members, points balances, and quick actions.",
    searchPlaceholder: "Search by name, phone, or email...",
    totalCustomers: "Total Registered Members",
    totalPointsHeld: "Points in Circulation",
    tblCustomer: "Member",
    tblPhoneEmail: "Contact",
    tblTier: "Tier",
    tblBalance: "Current Balance",
    tblLifetime: "Lifetime Points",
    tblJoined: "Joined Date",
    tblSendNotif: "Send Notice",
    rewardsTitle: "Rewards Catalogue",
    rewardsSubtitle: "Manage redeemable items, images, and point costs.",
    addReward: "Add New Reward",
    tblRewardTitle: "Reward Title",
    tblCategory: "Category",
    tblPointsCost: "Points Cost",
    tblRedemptions: "Redemptions",
    tblStatus: "Status",
    tblActions: "Actions",
    active: "Active",
    disabled: "Disabled",
    addRewardModalTitle: "Add New Reward",
    titleLabel: "Reward Title",
    descriptionLabel: "Description",
    rewardImage: "Image URL",
    rewardImageHelp: "Paste an image URL or choose a preset below",
    presets: "Quick Presets:",
    cancel: "Cancel",
    createReward: "Save Reward",
    deleteConfirm: "Are you sure you want to remove this reward?",
    cashiersTitle: "Cashier Accounts & POS Terminals",
    cashiersSubtitle: "Manage authorized staff and POS access PINs.",
    addCashier: "Add Cashier",
    tblStaffMember: "Staff Name",
    tblUsername: "Username",
    tblBranch: "Branch",
    tblPin: "PIN",
    authorized: "Active",
    suspended: "Suspended",
    deactivate: "Deactivate",
    reactivate: "Activate",
    addCashierModalTitle: "Create Cashier Account",
    fullName: "Full Name",
    usernameForPOS: "Username",
    createAccount: "Create Account",
    broadcastTitle: "Customer Broadcast & Notification Center",
    broadcastSubtitle: "Dispatch in-app notifications and promotional loyalty points boosts.",
    announcementTitle: "Announcement Title",
    notificationMessage: "Notification Message",
    optionalBonus: "Optional Bonus Points Gift",
    bonusHelp: "Set to 0 for a standard notification without a points grant.",
    audienceLabel: "Target Audience",
    audienceAll: "All Members (Broadcast)",
    audienceSingle: "Specific Member (Direct)",
    selectCustomer: "Select Customer",
    noCustomersFound: "No registered customers found",
    sendBroadcast: "Send Broadcast to All Members",
    sendToSingle: "Send Direct Notification",
    sendingBroadcast: "Dispatching Notification...",
    broadcastSuccessMsg: (bonusCount?: number, bonus?: string, recipientName?: string, pushDevices?: number) => {
      const pushNote = pushDevices && pushDevices > 0 ? ` (Real push delivered to ${pushDevices} device${pushDevices > 1 ? "s" : ""})` : "";
      return recipientName
        ? `Notification sent to ${recipientName}! ${bonusCount ? `+${bonus} bonus points credited.` : ""}${pushNote}`
        : `Broadcast sent successfully! ${bonusCount ? `+${bonus} points credited to ${bonusCount} members.` : ""}${pushNote}`;
    },
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

  // Language State: English by default
  const [lang, setLang] = useState<"en" | "ar">("en");

  // Authentication State
  const [admin, setAdmin] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Login Form State
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"analytics" | "customers" | "rewards" | "cashiers" | "broadcast">("analytics");

  // Customer Directory State
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Analytics State
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Rewards State
  const [rewardsList, setRewardsList] = useState<IReward[]>([]);
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newReward, setNewReward] = useState({
    title: "",
    description: "",
    pointsRequired: 100,
    category: "Drinks",
    imageUrl: "",
    stock: 999,
  });
  const [createRewardLoading, setCreateRewardLoading] = useState(false);
  const [createRewardError, setCreateRewardError] = useState<string | null>(null);

  // Cashiers State
  const [cashiersList, setCashiersList] = useState<any[]>([]);
  const [showAddCashierModal, setShowAddCashierModal] = useState(false);
  const [newCashier, setNewCashier] = useState({
    name: "",
    username: "",
    branchName: "Downtown Flagship",
    staffPin: "",
  });

  // Customer List for Targeted Notifications
  const [customersList, setCustomersList] = useState<{ id: string; name: string; email?: string; phone?: string; pointsBalance: number; tier?: string; lifetimePoints?: number; createdAt?: string }[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Broadcast & Targeted Notification State
  const [broadcastAudience, setBroadcastAudience] = useState<"all" | "single">("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastBonus, setBroadcastBonus] = useState<string>("0");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  // Admin Console is 100% English
  useEffect(() => {
    setLang("en");
    if (typeof window !== "undefined") {
      localStorage.setItem("cove_admin_lang", "en");
    }
  }, []);

  const t = i18n.en;

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

  // Load Customers for targeted broadcast
  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success) setCustomersList(data.customers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCustomers(false);
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
      loadCustomers();
    }
  }, [admin]);

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



  // Helper for image file upload & client-side compression to lightweight JPEG (~30-50KB)
  const handleRewardImageUpload = (file: File) => {
    if (!file) return;
    setCreateRewardError(null);
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        setNewReward((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      };
      img.onerror = () => {
        setCreateRewardError("Unable to read selected image file");
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Add Reward
  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateRewardLoading(true);
    setCreateRewardError(null);
    try {
      const res = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReward),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddRewardModal(false);
        setNewReward({ title: "", description: "", pointsRequired: 100, category: "Drinks", imageUrl: "", stock: 999 });
        await loadRewards();
      } else {
        setCreateRewardError(data.error || "Failed to save reward. Please check required fields.");
      }
    } catch (e: any) {
      console.error(e);
      setCreateRewardError(e.message || "Server connection error");
    } finally {
      setCreateRewardLoading(false);
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

  // Send Broadcast / Targeted Notification
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (broadcastAudience === "single" && !selectedCustomerId) {
      setBroadcastError("Please select a target customer");
      return;
    }

    setBroadcastSending(true);
    setBroadcastSuccess(null);
    setBroadcastError(null);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          bonusPoints: parseInt(broadcastBonus) || 0,
          audience: broadcastAudience,
          targetCustomerId: broadcastAudience === "single" ? selectedCustomerId : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastSuccess(
          t.broadcastSuccessMsg(data.bonusCreditedTo, broadcastBonus, data.recipientName, data.pushDevicesSent)
        );
        setBroadcastTitle("");
        setBroadcastMessage("");
        setBroadcastBonus("0");
        await loadMetrics();
        await loadCustomers();
      } else {
        setBroadcastError(data.error || "Failed to send notification");
      }
    } catch (e: any) {
      setBroadcastError(e.message || "Network error");
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
        dir="ltr"
        className="min-h-screen bg-[#FAF5F2] flex flex-col justify-between p-4 sm:p-6 transition-all"
      >
        <div className="max-w-sm w-full mx-auto my-auto py-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#3F1215] text-white flex items-center justify-center mx-auto mb-4 shadow-md overflow-hidden p-0.5 border border-[#3F1215]">
              <img src="/logo.png" alt="Cove" className="w-full h-full object-cover rounded-xl" />
            </div>
            <h1 className="text-2xl font-serif font-medium text-[#2B0B0D] mb-1">
              {config.storeName}
            </h1>
            <p className="text-xs text-neutral-500">{t.portalSubtitle}</p>
          </div>

          <div className="bg-white border border-[#EBD3C8] rounded-3xl p-6 sm:p-7 shadow-sm">
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#2B0B0D] mb-1.5">
                  {t.adminEmail}
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@covecoffee.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2B0B0D] mb-1.5">
                  {t.password}
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-[#3F1215] text-[#FEECE2] text-sm font-semibold hover:bg-[#2B0B0D] transition-colors disabled:opacity-50 mt-2 cursor-pointer shadow-xs active:scale-98"
              >
                {loginLoading ? t.authenticating : t.signIn}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-500 py-4 flex items-center justify-center gap-4">
          <Link href="/cashier" className="hover:text-[#3F1215] underline flex items-center gap-1">
            <Coffee className="w-3.5 h-3.5 text-[#3F1215]" />
            {t.openCashier}
          </Link>
          <span className="text-neutral-300">•</span>
          <Link href="/customer" className="hover:text-[#3F1215] underline">
            {t.openCustomer}
          </Link>
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: "analytics", label: t.navAnalytics, icon: LayoutDashboard },
    { id: "customers", label: t.navCustomers, icon: Users },
    { id: "rewards", label: t.navRewards, icon: Gift },
    { id: "cashiers", label: t.navCashiers, icon: ShieldCheck },
    { id: "broadcast", label: t.navBroadcast, icon: Send },
  ] as const;

  // Super Admin Layout (100% English, Centered & Balanced Layout)
  return (
    <div
      dir="ltr"
      className="min-h-screen bg-[#FAF5F2] flex flex-col lg:flex-row transition-all text-[#2B0B0D]"
    >
      {/* MOBILE & IPAD PORTRAIT TOP HEADER (< lg: 1024px) */}
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-[#EBD3C8] sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#3F1215] flex items-center justify-center text-white shrink-0 overflow-hidden p-0.5 border border-[#3F1215]">
              <img src="/logo.png" alt="Cove" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-sm text-[#2B0B0D] block leading-tight truncate font-serif">
                {config.storeName}
              </span>
              <span className="text-[10px] font-mono text-[#A44A3F] uppercase tracking-wider font-semibold">
                {t.superAdmin}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/cashier"
              title={t.openCashier}
              className="px-2.5 py-1.5 rounded-xl border border-[#EBD3C8] bg-white hover:bg-[#FDF4F0] text-xs font-medium text-[#2B0B0D] transition-colors flex items-center gap-1"
            >
              <Coffee className="w-3.5 h-3.5 text-[#3F1215]" />
              <span className="hidden sm:inline">{t.openCashier}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title={t.signOut}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Pills (Touch-Optimized for Mobile & iPad Portrait) */}
        <div className="px-3 py-2 border-t border-[#EBD3C8]/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#3F1215] text-[#FEECE2] shadow-xs font-semibold"
                    : "bg-[#FDF4F0] text-[#2B0B0D] hover:bg-[#EBD3C8]/50 border border-[#EBD3C8]/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FEECE2]" : "text-[#3F1215]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP & IPAD LANDSCAPE SIDEBAR (>= lg: 1024px) */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-white border-e border-[#EBD3C8] flex-col justify-between p-5 min-h-screen shrink-0 sticky top-0 h-screen">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-[#EBD3C8]/60">
            <div className="w-11 h-11 rounded-xl bg-[#3F1215] flex items-center justify-center text-white flex-shrink-0 overflow-hidden p-0.5 border border-[#3F1215]">
              <img src="/logo.png" alt="Cove" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="truncate">
              <span className="font-semibold text-sm text-[#2B0B0D] block leading-tight truncate font-serif">
                {config.storeName}
              </span>
              <span className="text-[10px] font-mono text-[#A44A3F] uppercase tracking-wider font-semibold">
                {t.superAdmin}
              </span>
            </div>
          </div>

          {/* Active Locale */}
          <div className="mb-4 px-1">
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[#EBD3C8] bg-[#FDF4F0] text-xs font-medium text-[#2B0B0D]">
              <div className="flex items-center gap-2">
                <Languages className="w-3.5 h-3.5 text-[#3F1215]" />
                <span>Language</span>
              </div>
              <span className="text-[11px] font-bold text-[#3F1215]">
                English (US)
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#3F1215] text-[#FEECE2] shadow-sm font-semibold"
                      : "text-neutral-600 hover:text-[#2B0B0D] hover:bg-[#FDF4F0]"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#FEECE2]" : "text-[#3F1215]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[#EBD3C8]/60 space-y-3">
          <div className="px-2">
            <span className="text-xs font-semibold text-[#2B0B0D] block truncate">
              {admin.name}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono block truncate" dir="ltr">
              {admin.email}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/cashier"
              className="text-xs text-[#3F1215] hover:text-[#2B0B0D] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Coffee className="w-3.5 h-3.5 text-[#3F1215]" />
              {t.openCashier}
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.signOut}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 max-w-6xl w-full mx-auto overflow-y-auto">
        {/* TAB 1: EXECUTIVE ANALYTICS & METRICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
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
                className="px-3.5 py-2 rounded-xl border border-[#EBD3C8] bg-white hover:bg-[#FAF5F2] text-xs font-medium text-[#3F1215] flex items-center gap-2 self-start transition-colors shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? "animate-spin" : ""}`} />
                <span>{t.refreshData}</span>
              </button>
            </div>

            {/* Metrics Cards Grid - Clean Minimalist Luxury */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Revenue Volume */}
              <div className="bg-white border border-[#EBD3C8] rounded-3xl p-5 shadow-xs transition-all hover:border-[#3F1215]/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium text-neutral-500">{t.cardRevenue}</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#2B0B0D] tracking-tight" dir="ltr">
                  {formatCurrency(metrics?.totalRevenueVolume || 0)}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  {t.cardRevenueSub(metrics?.totalTransactions || 0)}
                </span>
              </div>

              {/* Card 2: Points Issued */}
              <div className="bg-white border border-[#EBD3C8] rounded-3xl p-5 shadow-xs transition-all hover:border-[#3F1215]/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium text-neutral-500">{t.cardIssued}</span>
                  <div className="w-8 h-8 rounded-xl bg-[#FDF4F0] text-[#3F1215] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#3F1215] font-mono" dir="ltr">
                  +{metrics?.totalPointsIssued.toLocaleString() || 0}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block font-mono">
                  {t.cardIssuedSub}
                </span>
              </div>

              {/* Card 3: Points Redeemed */}
              <div className="bg-white border border-[#EBD3C8] rounded-3xl p-5 shadow-xs transition-all hover:border-[#3F1215]/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium text-neutral-500">{t.cardRedeemed}</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-neutral-800 font-mono" dir="ltr">
                  -{metrics?.totalPointsRedeemed.toLocaleString() || 0}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block font-mono">
                  {t.cardRedeemedSub}
                </span>
              </div>

              {/* Card 4: Active Customer Base */}
              <div className="bg-white border border-[#EBD3C8] rounded-3xl p-5 shadow-xs transition-all hover:border-[#3F1215]/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium text-neutral-500">{t.cardMembers}</span>
                  <div className="w-8 h-8 rounded-xl bg-[#FAF5F2] text-[#3F1215] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#2B0B0D]" dir="ltr">
                  {metrics?.activeCustomerCount || 0}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  {t.cardMembersSub}
                </span>
              </div>
            </div>

            {/* Clean Recent Activity & Top Customer Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Customers summary */}
              <div className="bg-white border border-[#EBD3C8] rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EBD3C8]/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#3F1215]" />
                    <h3 className="text-sm font-semibold text-[#2B0B0D]">{t.topCustomers}</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("customers")}
                    className="text-xs text-[#3F1215] hover:underline font-medium cursor-pointer"
                  >
                    View All Members →
                  </button>
                </div>

                <div className="divide-y divide-[#EBD3C8]/40">
                  {metrics?.topCustomers.slice(0, 5).map((cust, idx) => (
                    <div key={cust._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-[#FAF5F2] text-[#3F1215] text-xs font-mono font-semibold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#2B0B0D]">{cust.name}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-[#FDF4F0] text-[#3F1215] border border-[#EBD3C8]">
                              {cust.tier}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400 font-mono block" dir="ltr">
                            {cust.phone || cust.email}
                          </span>
                        </div>
                      </div>

                      <div className={lang === "ar" ? "text-left" : "text-right"}>
                        <span className="text-xs font-bold font-mono text-[#3F1215] block" dir="ltr">
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

              {/* Recent Activity Feed */}
              <div className="bg-white border border-[#EBD3C8] rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EBD3C8]/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    <h3 className="text-sm font-semibold text-[#2B0B0D]">{t.liveActivity}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">{t.auditTrail}</span>
                </div>

                {metrics?.recentTransactions.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-8 text-center">{t.noTransactions}</p>
                ) : (
                  <div className="divide-y divide-[#EBD3C8]/40">
                    {metrics?.recentTransactions.slice(0, 5).map((tx) => (
                      <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                                tx.type === "EARN"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {tx.type === "EARN" ? "Earned" : "Redeemed"}
                            </span>
                            <span className="font-semibold text-[#2B0B0D]">{tx.customerName}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono block">
                            {tx.referenceCode} • {tx.branchName || "Main"}
                          </span>
                        </div>

                        <div className={lang === "ar" ? "text-left" : "text-right"}>
                          <span
                            dir="ltr"
                            className={`font-mono font-bold block ${
                              tx.points > 0 ? "text-emerald-700" : "text-[#3F1215]"
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

        {/* TAB 2: CUSTOMERS DIRECTORY */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-medium text-neutral-900">
                  {t.customersTitle}
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {t.customersSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EBD3C8] shadow-2xs text-xs">
                  <span className="text-neutral-400 font-mono text-[11px] me-1.5">{t.totalCustomers}:</span>
                  <span className="font-bold text-[#3F1215]">{customersList.length}</span>
                </div>
                <button
                  onClick={loadCustomers}
                  disabled={loadingCustomers}
                  className="px-3.5 py-2 rounded-xl border border-[#EBD3C8] bg-white hover:bg-[#FAF5F2] text-xs font-medium text-[#3F1215] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCustomers ? "animate-spin" : ""}`} />
                  <span>{t.refreshData}</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="bg-white border border-[#EBD3C8] rounded-2xl p-3 shadow-xs flex items-center gap-2.5">
              <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full text-xs bg-transparent focus:outline-none text-[#2B0B0D] placeholder-neutral-400"
              />
              {customerSearchQuery && (
                <button
                  onClick={() => setCustomerSearchQuery("")}
                  className="text-neutral-400 hover:text-neutral-700 text-xs px-2 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Customers Table */}
            <div className="bg-white border border-[#EBD3C8] rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FDF4F0] border-b border-[#EBD3C8] text-[#3F1215] font-semibold">
                      <th className="py-3.5 px-5 text-start">{t.tblCustomer}</th>
                      <th className="py-3.5 px-4 text-start">{t.tblPhoneEmail}</th>
                      <th className="py-3.5 px-4 text-start">{t.tblTier}</th>
                      <th className="py-3.5 px-4 text-start">{t.tblBalance}</th>
                      <th className="py-3.5 px-5 text-end">{t.tblActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBD3C8]/50">
                    {customersList
                      .filter((c) => {
                        if (!customerSearchQuery.trim()) return true;
                        const q = customerSearchQuery.toLowerCase().trim();
                        return (
                          (c.name && c.name.toLowerCase().includes(q)) ||
                          (c.phone && c.phone.includes(q)) ||
                          (c.email && c.email.toLowerCase().includes(q))
                        );
                      })
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-[#FDF4F0]/40 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[#3F1215] text-[#FEECE2] font-semibold text-xs flex items-center justify-center flex-shrink-0">
                                {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                              </div>
                              <div>
                                <span className="font-semibold text-[#2B0B0D] block">{c.name}</span>
                                {c.email && (
                                  <span className="text-[11px] text-neutral-400 font-mono block" dir="ltr">
                                    {c.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-neutral-600" dir="ltr">
                            {c.phone || "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium border bg-[#FAF5F2] text-[#3F1215] border-[#EBD3C8]">
                              {c.tier || "Member"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#3F1215] font-mono">
                            {c.pointsBalance.toLocaleString()} {t.pts}
                          </td>
                          <td className="py-3.5 px-5 text-end">
                            <button
                              onClick={() => {
                                setSelectedCustomerId(c.id);
                                setBroadcastAudience("single");
                                setActiveTab("broadcast");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#FAF5F2] hover:bg-[#3F1215] text-[#3F1215] hover:text-[#FEECE2] border border-[#EBD3C8] text-[11px] font-medium transition-all flex items-center gap-1.5 ms-auto cursor-pointer shadow-2xs"
                            >
                              <Send className="w-3 h-3" />
                              <span>{t.tblSendNotif}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    {customersList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-neutral-400">
                          {t.noCustomersFound}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REWARDS CATALOGUE MANAGEMENT */}
        {activeTab === "rewards" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
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
                className="px-4 py-2 rounded-xl bg-[#3F1215] text-[#FEECE2] text-xs font-medium hover:bg-[#2B0B0D] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addReward}
              </button>
            </div>

            <div className="bg-white border border-[#EBD3C8] rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-[620px] w-full text-start text-xs">
                  <thead className="bg-[#FAF5F2] border-b border-[#EBD3C8] font-mono text-neutral-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-5 text-start">{t.tblRewardTitle}</th>
                      <th className="py-3 px-4 text-start">{t.tblCategory}</th>
                      <th className="py-3 px-4 text-start">{t.tblPointsCost}</th>
                      <th className="py-3 px-4 text-start">{t.tblRedemptions}</th>
                      <th className="py-3 px-4 text-start">{t.tblStatus}</th>
                      <th className="py-3 px-5 text-end">{t.tblActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBD3C8]/50">
                    {rewardsList.map((reward) => (
                      <tr key={reward._id} className="hover:bg-[#FDF4F0]/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            {reward.imageUrl ? (
                              <img
                                src={reward.imageUrl}
                                alt={reward.title}
                                className="w-11 h-11 rounded-xl object-cover border border-[#EBD3C8] flex-shrink-0 shadow-2xs"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-[#FAF5F2] border border-[#EBD3C8] text-[#3F1215] flex items-center justify-center flex-shrink-0">
                                <Gift className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-semibold text-[#2B0B0D] block truncate">{reward.title}</span>
                              <span className="text-[11px] text-neutral-400 line-clamp-1">{reward.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-600">{reward.category}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#3F1215]" dir="ltr">
                          {reward.pointsRequired} {t.pts}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-500">{reward.redemptionCount || 0}</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleReward(reward._id, reward.isActive)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border cursor-pointer transition-colors ${
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
                            className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
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
            <div className="flex items-center justify-between gap-4">
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
                className="px-4 py-2 rounded-xl bg-[#3F1215] text-[#FEECE2] text-xs font-medium hover:bg-[#2B0B0D] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addCashier}
              </button>
            </div>

            <div className="bg-white border border-[#EBD3C8] rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-[620px] w-full text-start text-xs">
                  <thead className="bg-[#FAF5F2] border-b border-[#EBD3C8] font-mono text-neutral-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-5 text-start">{t.tblStaffMember}</th>
                      <th className="py-3 px-4 text-start">{t.tblUsername}</th>
                      <th className="py-3 px-4 text-start">{t.tblBranch}</th>
                      <th className="py-3 px-4 text-start">{t.tblPin}</th>
                      <th className="py-3 px-4 text-start">{t.tblStatus}</th>
                      <th className="py-3 px-5 text-end">{t.tblActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBD3C8]/50">
                    {cashiersList.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FDF4F0]/50 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-[#2B0B0D]">{c.name}</td>
                        <td className="py-3.5 px-4 font-mono text-neutral-600" dir="ltr">{c.username}</td>
                        <td className="py-3.5 px-4 text-neutral-600">{c.branchName}</td>
                        <td className="py-3.5 px-4 font-mono tracking-wider font-bold text-[#3F1215]" dir="ltr">
                          {c.staffPin}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
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
                            className="text-[#3F1215] hover:text-[#2B0B0D] text-xs underline font-medium cursor-pointer"
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

        {/* TAB 5: BROADCAST / NOTIFICATION CENTER */}
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

            <form onSubmit={handleSendBroadcast} className="bg-white border border-[#EBD3C8] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
              {broadcastSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{broadcastSuccess}</span>
                </div>
              )}

              {broadcastError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{broadcastError}</span>
                </div>
              )}

              {/* Audience Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">
                  {t.audienceLabel}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBroadcastAudience("all")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                      broadcastAudience === "all"
                        ? "bg-[#3F1215] text-[#FEECE2] border-[#3F1215] shadow-xs font-semibold"
                        : "bg-[#FAF5F2] text-neutral-600 border-[#EBD3C8] hover:bg-white"
                    }`}
                  >
                    {t.audienceAll}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastAudience("single")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                      broadcastAudience === "single"
                        ? "bg-[#3F1215] text-[#FEECE2] border-[#3F1215] shadow-xs font-semibold"
                        : "bg-[#FAF5F2] text-neutral-600 border-[#EBD3C8] hover:bg-white"
                    }`}
                  >
                    {t.audienceSingle}
                  </button>
                </div>
              </div>

              {/* Single Customer Selection Dropdown */}
              {broadcastAudience === "single" && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    {t.selectCustomer}
                  </label>
                  {loadingCustomers ? (
                    <div className="p-3 text-xs text-neutral-400 font-mono">Loading customers directory...</div>
                  ) : customersList.length === 0 ? (
                    <div className="p-3 text-xs text-amber-800 bg-amber-50 rounded-xl border border-amber-200">
                      {t.noCustomersFound}
                    </div>
                  ) : (
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                      required
                    >
                      <option value="">-- {t.selectCustomer} --</option>
                      {customersList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.phone ? `(${c.phone})` : c.email ? `(${c.email})` : ""} — {c.pointsBalance} pts
                        </option>
                      ))}
                    </select>
                  )}
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
                  placeholder="Notification title or offer announcement"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
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
                  placeholder="Write notification message details here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  {t.bonusHelp}
                </span>
              </div>

              <div className="pt-4 border-t border-[#EBD3C8]/60 flex justify-end">
                <button
                  type="submit"
                  disabled={broadcastSending}
                  className="px-6 py-2.5 rounded-xl bg-[#3F1215] hover:bg-[#2B0B0D] text-[#FEECE2] text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  {broadcastSending
                    ? t.sendingBroadcast
                    : broadcastAudience === "single"
                    ? t.sendToSingle
                    : t.sendBroadcast}
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
            className="bg-white border border-[#EBD3C8] rounded-3xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#2B0B0D] font-serif">{t.addRewardModalTitle}</h3>
              <button onClick={() => setShowAddRewardModal(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createRewardError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createRewardError}</span>
              </div>
            )}

            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2B0B0D] mb-1">{t.titleLabel} *</label>
                <input
                  type="text"
                  value={newReward.title}
                  onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                  placeholder="Reward title (e.g. Flat White, Croissant...)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B0B0D] mb-1">{t.descriptionLabel} (Optional)</label>
                <input
                  type="text"
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  placeholder="Additional details or beverage tasting notes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                />
              </div>

              {/* Reward Image (File upload, live preview, presets, or URL) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#2B0B0D]">
                  Reward Image
                </label>

                {/* Current Image Preview */}
                {newReward.imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#EBD3C8] bg-[#FAF5F2] h-40 flex items-center justify-center group">
                    <img
                      src={newReward.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewReward({ ...newReward, imageUrl: "" })}
                      className="absolute top-2 end-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-xl shadow-md transition-all cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Upload from Device / Phone Button */
                  <label className="w-full py-4 px-3 rounded-2xl border-2 border-dashed border-[#EBD3C8] hover:border-[#3F1215] bg-[#FAF5F2]/50 hover:bg-[#FDF4F0] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
                    <Upload className="w-6 h-6 text-[#3F1215]" />
                    <span className="text-xs font-bold text-[#2B0B0D]">
                      Click here to upload image from your device
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      JPG or PNG (Auto-compressed and optimized)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleRewardImageUpload(file);
                      }}
                    />
                  </label>
                )}

                {/* Ready Presets */}
                <div>
                  <span className="text-[11px] font-bold text-neutral-600 block mb-1">
                    Or choose a preset with one tap:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "☕ Flat White", url: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=800&auto=format&fit=crop&q=80" },
                      { label: "🧊 Cold Brew", url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80" },
                      { label: "🥛 Spanish Latte", url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80" },
                      { label: "🥐 Croissant", url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80" },
                      { label: "🍰 Cheesecake", url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80" },
                      { label: "🍩 Doughnut", url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80" },
                      { label: "🍪 Cookies", url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80" },
                      { label: "🫘 Coffee Beans", url: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewReward({ ...newReward, imageUrl: preset.url })}
                        className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-medium ${
                          newReward.imageUrl === preset.url
                            ? "bg-[#3F1215] text-[#FEECE2] border-[#3F1215] shadow-xs"
                            : "bg-[#FAF5F2] text-neutral-700 border-[#EBD3C8] hover:bg-white"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Image URL */}
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-1">Or enter an image URL:</span>
                  <input
                    type="text"
                    value={newReward.imageUrl.startsWith("data:") ? "" : newReward.imageUrl}
                    onChange={(e) => setNewReward({ ...newReward, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-[#EBD3C8] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215] bg-[#FAF5F2]/40"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2B0B0D] mb-1">{t.tblPointsCost} *</label>
                  <input
                    type="number"
                    value={newReward.pointsRequired}
                    onChange={(e) =>
                      setNewReward({ ...newReward, pointsRequired: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B0B0D] mb-1">{t.tblCategory}</label>
                  <select
                    value={newReward.category}
                    onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                  >
                    <option value="Drinks">Beverages</option>
                    <option value="Food">Food & Pastries</option>
                    <option value="Beans">Specialty Beans</option>
                    <option value="Merchandise">Merchandise</option>
                    <option value="Special">Special Offers</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRewardModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={createRewardLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#3F1215] text-[#FEECE2] text-xs font-bold hover:bg-[#2B0B0D] transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 flex items-center gap-2"
                >
                  {createRewardLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Saving reward...</span>
                    </>
                  ) : (
                    <span>{t.createReward}</span>
                  )}
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
            className="bg-white border border-[#EBD3C8] rounded-3xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#2B0B0D] font-serif">{t.addCashierModalTitle}</h3>
              <button onClick={() => setShowAddCashierModal(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCashier} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#2B0B0D] mb-1">{t.fullName}</label>
                <input
                  type="text"
                  value={newCashier.name}
                  onChange={(e) => setNewCashier({ ...newCashier, name: e.target.value })}
                  placeholder="Staff Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2B0B0D] mb-1">{t.usernameForPOS}</label>
                <input
                  type="text"
                  value={newCashier.username}
                  onChange={(e) => setNewCashier({ ...newCashier, username: e.target.value })}
                  placeholder="cashier"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                  dir="ltr"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#2B0B0D] mb-1">{t.tblBranch}</label>
                  <input
                    type="text"
                    value={newCashier.branchName}
                    onChange={(e) => setNewCashier({ ...newCashier, branchName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2B0B0D] mb-1">{t.tblPin}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newCashier.staffPin}
                    onChange={(e) => setNewCashier({ ...newCashier, staffPin: e.target.value })}
                    placeholder="••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBD3C8] text-xs font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#3F1215]/20 focus:border-[#3F1215]"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCashierModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#3F1215] text-[#FEECE2] text-xs font-semibold hover:bg-[#2B0B0D] transition-colors shadow-xs cursor-pointer active:scale-98"
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
