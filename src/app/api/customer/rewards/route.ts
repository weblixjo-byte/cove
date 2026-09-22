import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    // Concurrently fetch rewards and user points in parallel for maximum speed
    const [rewards, user] = await Promise.all([
      dbService.getRewards(true),
      session && session.role === "customer" && session.userId
        ? dbService.findUserById(session.userId)
        : Promise.resolve(null),
    ]);

    const userPoints = user?.pointsBalance || 0;

    return NextResponse.json(
      {
        success: true,
        rewards: rewards.map((r) => ({
          ...r,
          canRedeem: userPoints >= r.pointsRequired,
        })),
        userPoints,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(_req: Request) {
  return NextResponse.json(
    {
      error: "Direct client redemption is disabled. Please present your 6-digit PIN or QR code to the cashier at the counter to activate your discount.",
      requiresCashier: true,
    },
    { status: 403 }
  );
}
