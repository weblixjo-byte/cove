"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBrand } from "@/components/BrandProvider";
import {
  Coffee,
  Smartphone,
  ScanLine,
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function HomePage() {
  const { config, formatCurrency } = useBrand();
  const router = useRouter();
  const [switching, setSwitching] = useState<string | null>(null);

  // Quick test login helpers
  const handleFastLogin = async (role: "customer" | "cashier" | "admin") => {
    setSwitching(role);
    try {
      if (role === "customer") {
        router.push("/customer");
      } else if (role === "cashier") {
        const res = await fetch("/api/auth/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "cashier",
            username: "sajji",
            staffPin: "2026",
          }),
        });
        if (res.ok) router.push("/cashier");
      } else if (role === "admin") {
        const res = await fetch("/api/auth/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "super_admin",
            email: "admin@covecoffee.com",
            password: "admin123",
          }),
        });
        if (res.ok) router.push("/admin");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 flex flex-col justify-between">
      {/* Editorial Top Bar */}
      <header className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2C221E] flex items-center justify-center text-white shadow-sm">
              <Coffee className="w-5 h-5 text-[#E6D5C7]" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-lg text-neutral-900 block leading-tight">
                {config.storeName}
              </span>
              <span className="text-xs text-neutral-500 font-normal">
                {config.tagline}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs text-neutral-600">
              <Lock className="w-3.5 h-3.5 text-neutral-500" />
              <span>No-Index / No-Follow Active</span>
            </div>

            <Link
              href="/customer"
              className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              Customer App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-20 flex-1 w-full flex flex-col justify-center">
        {/* Intro */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-[#2C221E] text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#C87D55]" />
            <span>White-Label Customer Loyalty Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-neutral-900 leading-[1.12] mb-6">
            Artisanal loyalty for discerning coffee houses.
          </h1>

          <p className="text-lg text-neutral-600 leading-relaxed font-normal">
            A production-ready loyalty ecosystem built with an editorial minimalist aesthetic.
            Equipped with sub-second POS verification, dynamic QR passes, 6-digit fallback PINs,
            and centralized multi-tenant white-label control.
          </p>
        </div>

        {/* Three Core Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Customer Portal */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-7 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-[#2C221E] mb-5">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Module 01
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Customer Pass
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                Mobile-first digital member pass with dynamic QR code, 6-digit fallback PIN,
                live points balance, and a curated rewards redemption catalogue.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-neutral-100">
              <button
                onClick={() => handleFastLogin("customer")}
                disabled={switching === "customer"}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C221E] text-white text-sm font-medium hover:bg-[#3E322D] transition-colors disabled:opacity-50"
              >
                {switching === "customer" ? "Opening Pass..." : "Open Customer Pass"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[11px] text-neutral-400 font-mono">
                Google Single Sign-On / تسجيل الدخول بجوجل
              </p>
            </div>
          </div>

          {/* Card 2: Cashier POS */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-7 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#1A5336] mb-5">
                <ScanLine className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Module 02
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Cashier / POS Terminal
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                Ultra-fast checkout interface. Scan customer QR or enter the 6-digit PIN,
                input the ticket bill amount, and credit loyalty points in under two seconds.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-neutral-100">
              <button
                onClick={() => handleFastLogin("cashier")}
                disabled={switching === "cashier"}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A5336] text-white text-sm font-medium hover:bg-[#14422B] transition-colors disabled:opacity-50"
              >
                {switching === "cashier" ? "Opening POS..." : "Launch Cashier POS"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[11px] text-neutral-400 font-mono">
                Staff: sajji (PIN: 2026) / ahmad (PIN: 1111)
              </p>
            </div>
          </div>

          {/* Card 3: Super Admin */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-7 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#C87D55] mb-5">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Module 03
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Super Admin Console
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                Centralized white-label configuration, custom rewards catalogue CRUD, cashier
                account credentials, broadcast notifications, and loyalty revenue metrics.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-neutral-100">
              <button
                onClick={() => handleFastLogin("admin")}
                disabled={switching === "admin"}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {switching === "admin" ? "Authenticating..." : "Launch Admin Console"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[11px] text-neutral-400 font-mono">
                Admin: admin@covecoffee.com / admin123
              </p>
            </div>
          </div>
        </div>

        {/* Technical Specs & White-Label Details */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Production Architecture & Privacy Standards
            </h4>
            <p className="text-sm text-neutral-600 max-w-2xl">
              Equipped with Next.js App Router, Mongoose ODM, dynamic white-label theme settings,
              and strict HTTP headers enforcing <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800 font-mono text-xs">X-Robots-Tag: noindex, nofollow</code>.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-neutral-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Rate: {config.pointsPerUnit} pts / 1.000 {config.currency}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Redemption: 100 pts = {formatCurrency(config.discountPer100Pts)}
            </span>
          </div>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © 2026 {config.storeName}. All rights reserved. Private white-label loyalty software.
          </div>
          <div className="flex items-center gap-6">
            <span>Security Protected</span>
            <span>Zero-Index Environment</span>
            <span>Mobile-First Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
