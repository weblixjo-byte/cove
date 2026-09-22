import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`pos_lookup_${ip}`, { limit: 40, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Lookup rate limit exceeded. Please wait a moment." }, { status: 429 });
    }

    const session = await getSession(req);
    if (!session || (session.role !== "cashier" && session.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized: Cashier access required" }, { status: 403 });
    }

    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Customer PIN, QR token, or phone is required" }, { status: 400 });
    }

    let cleaned = query.trim();

    // If scanned data is a full URL, extract relevant query parameters
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
      try {
        const parsedUrl = new URL(cleaned);
        const extracted = parsedUrl.searchParams.get("token") || parsedUrl.searchParams.get("qr") || parsedUrl.searchParams.get("pin");
        if (extracted) {
          cleaned = extracted.trim();
        }
      } catch {
        // Ignore URL parsing errors and keep cleaned
      }
    }

    let customer = null;
    let claimCode: string | null = null;

    // Check if query is QR code with :CLAIM:
    // e.g. `${qrSecret}:CLAIM:${claimCode}`
    if (cleaned.includes(":CLAIM:")) {
      const parts = cleaned.split(":CLAIM:");
      cleaned = parts[0].trim();
      claimCode = parts[1].trim();
    }

    const digitsOnly = cleaned.replace(/\D/g, "");

    // 1. Check for 8-digit combined entry (6 PIN + 2 Claim Code)
    if (!claimCode && digitsOnly.length === 8) {
      const pinCandidate = digitsOnly.slice(0, 6);
      const codeCandidate = digitsOnly.slice(6, 8);
      const matchedCustomer = await dbService.findUserByPin(pinCandidate);
      if (matchedCustomer) {
        customer = matchedCustomer;
        claimCode = codeCandidate;
      }
    }

    // 2. Try standard 6-digit PIN
    if (!customer && digitsOnly.length === 6) {
      customer = await dbService.findUserByPin(digitsOnly);
    }

    // 3. Try QR Secret or user ID
    if (!customer) {
      customer = await dbService.findUserByQrSecret(cleaned);
    }

    // 4. Try Email address
    if (!customer && cleaned.includes("@")) {
      customer = await dbService.findUserByEmail(cleaned);
    }

    // 5. Try Phone number
    if (!customer && digitsOnly.length >= 7 && digitsOnly.length !== 8) {
      customer = await dbService.findUserByPhone(cleaned);
    }

    // 6. Try Direct user ID match
    if (!customer) {
      customer = await dbService.findUserById(cleaned);
    }

    if (!customer || customer.role !== "customer") {
      return NextResponse.json(
        { error: "Customer not found. Verify the PIN or scanned QR code." },
        { status: 404 }
      );
    }

    // If claim code is detected, validate the reward
    let pendingReward = null;
    if (claimCode) {
      const cleanClaimCode = claimCode.replace(/\D/g, "");
      if (!/^\d{2}$/.test(cleanClaimCode)) {
        return NextResponse.json(
          { error: `Invalid reward claim code "${claimCode}". Must be exactly 2 digits.` },
          { status: 400 }
        );
      }

      const reward = await dbService.findRewardByClaimCode(cleanClaimCode, true);
      if (!reward) {
        return NextResponse.json(
          { error: `Reward code #${cleanClaimCode} not found or inactive` },
          { status: 404 }
        );
      }

      pendingReward = {
        _id: reward._id,
        title: reward.title,
        description: reward.description,
        pointsRequired: reward.pointsRequired,
        category: reward.category,
        imageUrl: reward.imageUrl,
        claimCode: reward.claimCode,
      };
    }

    const config = await dbService.getConfig();
    const currencyValue = Number(
      ((customer.pointsBalance / 100) * (config.discountPer100Pts || 1.0)).toFixed(3)
    );

    const recentTxs = await dbService.getCustomerTransactions(customer._id);

    return NextResponse.json({
      success: true,
      mode: pendingReward ? "redeem" : "credit",
      pendingReward,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        pin: customer.pin,
        tier: customer.tier,
        pointsBalance: customer.pointsBalance,
        lifetimePoints: customer.lifetimePoints,
        currencyValue,
        currency: config.currency,
        pointsPerUnit: config.pointsPerUnit,
      },
      recentTransactions: recentTxs.slice(0, 5),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
