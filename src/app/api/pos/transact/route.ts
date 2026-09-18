import { NextResponse } from "next/server";
import webpush from "web-push";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";
import { CustomerTier } from "@/lib/types";

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

    const { customerId, billAmount, notes } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    const bill = Number(billAmount);
    if (isNaN(bill) || bill <= 0) {
      return NextResponse.json({ error: "Valid positive bill amount is required" }, { status: 400 });
    }

    const customer = await dbService.findUserById(customerId);
    if (!customer || customer.role !== "customer") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const config = await dbService.getConfig();
    const pointsPerUnit = config.pointsPerUnit || 10;
    const pointsEarned = Math.floor(bill * pointsPerUnit);

    const oldBalance = customer.pointsBalance;
    const newBalance = oldBalance + pointsEarned;
    const newLifetime = customer.lifetimePoints + pointsEarned;

    // Determine tier
    let newTier: CustomerTier = customer.tier;
    if (newLifetime >= 1000) {
      newTier = "Gold";
    } else if (newLifetime >= 500) {
      newTier = "Silver";
    } else {
      newTier = "Member";
    }

    // Update customer
    await dbService.updateUser(customer._id, {
      pointsBalance: newBalance,
      lifetimePoints: newLifetime,
      tier: newTier,
    });

    const refCode = `TX-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create transaction log
    const tx = await dbService.createTransaction({
      type: "EARN",
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      cashierId: session.userId,
      cashierName: session.name,
      branchName: session.branchName || "Main Roastery",
      billAmount: bill,
      points: pointsEarned,
      balanceAfter: newBalance,
      referenceCode: refCode,
      notes: notes || `Bill: ${bill.toFixed(3)} ${config.currency}`,
    });

    // Create notification for customer
    await dbService.createNotification({
      customerId: customer._id,
      title: `Points Credited: +${pointsEarned} Pts`,
      message: `You earned ${pointsEarned} points on your bill of ${bill.toFixed(3)} ${config.currency} at ${session.branchName || "Cove"}. New balance: ${newBalance} pts.`,
      type: "POINTS_EARNED",
    });

    // Dispatch instant Web Push to customer's phone
    if (vapidPublicKey && vapidPrivateKey) {
      try {
        const subs = await dbService.getPushSubscriptionsForUser(customer._id);
        const payloadString = JSON.stringify({
          title: `نقاط جديدة من كوف! +${pointsEarned} نقطة`,
          body: `تمت إضافة +${pointsEarned} نقطة لحسابك. رصيدك الآن: ${newBalance} نقطة.`,
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
        customerPhone: customer.phone,
        cashierName: session.name,
        branchName: session.branchName || "Main Roastery",
        billAmount: bill,
        currency: config.currency,
        pointsEarned,
        oldBalance,
        newBalance,
        tier: newTier,
        tierUpgraded: newTier !== customer.tier,
        createdAt: tx.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
