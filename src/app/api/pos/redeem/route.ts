import { NextResponse } from "next/server";
import webpush from "web-push";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@covecoffee.com";

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (e) {
    console.warn("VAPID init warning:", e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "cashier" && session.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized: Cashier access required" }, { status: 403 });
    }

    const { customerId, pointsToRedeem, rewardTitle, discountAmount, notes } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    const points = Number(pointsToRedeem);
    if (isNaN(points) || points <= 0) {
      return NextResponse.json({ error: "Valid points amount to redeem is required" }, { status: 400 });
    }

    const customer = await dbService.findUserById(customerId);
    if (!customer || customer.role !== "customer") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (customer.pointsBalance < points) {
      return NextResponse.json(
        {
          error: `Insufficient points. Customer has ${customer.pointsBalance} pts, attempting to redeem ${points} pts.`,
        },
        { status: 400 }
      );
    }

    const config = await dbService.getConfig();
    const oldBalance = customer.pointsBalance;
    const newBalance = oldBalance - points;

    // Update customer
    await dbService.updateUser(customer._id, {
      pointsBalance: newBalance,
    });

    const refCode = `RD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create redemption transaction
    const tx = await dbService.createTransaction({
      type: "REDEEM",
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      cashierId: session.userId,
      cashierName: session.name,
      branchName: session.branchName || "Main Roastery",
      points: -points,
      balanceAfter: newBalance,
      rewardTitle: rewardTitle || "Loyalty Points Discount",
      referenceCode: refCode,
      notes: notes || (discountAmount ? `Cash discount: ${discountAmount} ${config.currency}` : "Points Redemption"),
    });

    // Create customer notification
    await dbService.createNotification({
      customerId: customer._id,
      title: `Points Redeemed: -${points} Pts`,
      message: `${points} points were redeemed for ${rewardTitle || "discount"} at ${session.branchName || "Cove"}. Remaining balance: ${newBalance} pts.`,
      type: "REWARD_CLAIMED",
    });

    // Dispatch instant Web Push to customer's phone
    if (vapidPublicKey && vapidPrivateKey) {
      try {
        const subs = await dbService.getPushSubscriptionsForUser(customer._id);
        const payloadString = JSON.stringify({
          title: `تم استبدال مكافأة! -${points} نقطة`,
          body: `تم استبدال ${points} نقطة بنجاح مقابل ${rewardTitle || "مكافأة"}. رصيدك المتبقي: ${newBalance} نقطة.`,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          url: "/customer",
        });
        await Promise.allSettled(
          subs.map((sub) =>
            webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.keys.p256dh,
                  auth: sub.keys.auth,
                },
              },
              payloadString
            )
          )
        );
      } catch (err) {
        console.warn("Push dispatch error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      receipt: {
        referenceCode: refCode,
        customerId: customer._id,
        customerName: customer.name,
        rewardTitle: rewardTitle || "Discount Voucher",
        pointsRedeemed: points,
        oldBalance,
        newBalance,
        cashierName: session.name,
        branchName: session.branchName || "Main Roastery",
        createdAt: tx.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
