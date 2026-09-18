import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    const rewards = await dbService.getRewards(true);
    let userPoints = 0;

    if (session && session.role === "customer") {
      const user = await dbService.findUserById(session.userId);
      if (user) userPoints = user.pointsBalance;
    }

    return NextResponse.json({
      success: true,
      rewards: rewards.map((r) => ({
        ...r,
        canRedeem: userPoints >= r.pointsRequired,
      })),
      userPoints,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Customer authentication required" }, { status: 401 });
    }

    const { rewardId } = await req.json();
    if (!rewardId) {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 });
    }

    const reward = await dbService.findRewardById(rewardId);
    if (!reward || !reward.isActive) {
      return NextResponse.json({ error: "Reward not found or no longer active" }, { status: 404 });
    }

    const user = await dbService.findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (user.pointsBalance < reward.pointsRequired) {
      return NextResponse.json(
        {
          error: `Insufficient points balance. You need ${reward.pointsRequired} points, but have ${user.pointsBalance}.`,
        },
        { status: 400 }
      );
    }

    // Deduct points
    const newBalance = user.pointsBalance - reward.pointsRequired;
    await dbService.updateUser(user._id, { pointsBalance: newBalance });

    // Update reward redemption count
    await dbService.updateReward(reward._id, {
      redemptionCount: (reward.redemptionCount || 0) + 1,
    });

    const voucherCode = `RW-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create redemption transaction
    const tx = await dbService.createTransaction({
      type: "REDEEM",
      customerId: user._id,
      customerName: user.name,
      customerPhone: user.phone,
      points: -reward.pointsRequired,
      balanceAfter: newBalance,
      rewardTitle: reward.title,
      referenceCode: voucherCode,
      notes: `Redeemed: ${reward.title}`,
    });

    // Create notification
    await dbService.createNotification({
      customerId: user._id,
      title: `Reward Redeemed: ${reward.title}`,
      message: `Voucher #${voucherCode} has been generated. Present this to the cashier to claim your reward!`,
      type: "REWARD_CLAIMED",
    });

    return NextResponse.json({
      success: true,
      voucherCode,
      rewardTitle: reward.title,
      pointsDeducted: reward.pointsRequired,
      remainingBalance: newBalance,
      transactionId: tx._id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
