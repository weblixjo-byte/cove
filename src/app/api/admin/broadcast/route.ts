import { NextResponse } from "next/server";
import webpush from "web-push";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";
import { IPushSubscription } from "@/lib/types";

// Configure VAPID details if configured in environment
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@covecoffee.com";

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (e) {
    console.warn("VAPID initialization error:", e);
  }
}

// Helper to send real Web Push to a list of device subscriptions
async function dispatchWebPush(
  subscriptions: IPushSubscription[],
  payload: { title: string; body: string; url?: string }
) {
  if (!vapidPublicKey || !vapidPrivateKey || subscriptions.length === 0) return 0;

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    url: payload.url || "/customer",
  });

  let sentCount = 0;
  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          payloadString
        );
        sentCount++;
      } catch (err: any) {
        // If the subscription is expired or unregistered (HTTP 404 or 410), clean it up from DB
        if (err.statusCode === 404 || err.statusCode === 410) {
          await dbService.deletePushSubscription(sub.endpoint);
        } else {
          console.warn("Web Push dispatch warning:", err.message);
        }
      }
    })
  );

  return sentCount;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
    }

    const { title, message, bonusPoints, audience = "all", targetCustomerId } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Notification title and message are required" }, { status: 400 });
    }

    if (audience === "single" && !targetCustomerId) {
      return NextResponse.json({ error: "Target customer must be selected" }, { status: 400 });
    }

    const bonus = Number(bonusPoints) || 0;
    let bonusCreditedCount = 0;

    if (audience === "single") {
      const targetUser = await dbService.findUserById(targetCustomerId);
      if (!targetUser) {
        return NextResponse.json({ error: "Target customer not found" }, { status: 404 });
      }

      const notif = await dbService.createNotification({
        customerId: targetUser._id,
        title: title.trim(),
        message: message.trim(),
        type: bonus > 0 ? "POINTS_EARNED" : "BROADCAST",
      });

      if (bonus > 0) {
        const newBalance = (targetUser.pointsBalance || 0) + bonus;
        const newLifetime = (targetUser.lifetimePoints || 0) + bonus;
        await dbService.updateUser(targetUser._id, {
          pointsBalance: newBalance,
          lifetimePoints: newLifetime,
        });

        await dbService.createTransaction({
          type: "EARN",
          customerId: targetUser._id,
          customerName: targetUser.name,
          customerPhone: targetUser.phone,
          billAmount: 0,
          points: bonus,
          balanceAfter: newBalance,
          referenceCode: `NOTIF-${Math.floor(100000 + Math.random() * 900000)}`,
          notes: `Targeted Promo: ${title}`,
        });
        bonusCreditedCount = 1;
      }

      // Dispatch real Web Push to customer's active devices
      const targetSubs = await dbService.getPushSubscriptionsForUser(targetUser._id);
      const pushDevicesSent = await dispatchWebPush(targetSubs, {
        title: title.trim(),
        body: bonus > 0 ? `${message.trim()} (تمت إضافة +${bonus} نقطة لرصيدك!)` : message.trim(),
        url: "/customer",
      });

      return NextResponse.json({
        success: true,
        audience: "single",
        recipientName: targetUser.name,
        notification: notif,
        bonusCreditedTo: bonusCreditedCount,
        pushDevicesSent,
      });
    }

    // Default: Broadcast to all
    const notif = await dbService.createNotification({
      customerId: "all",
      title: title.trim(),
      message: message.trim(),
      type: "BROADCAST",
    });

    if (bonus > 0) {
      const customers = await dbService.getTopCustomers(500);
      for (const cust of customers) {
        const newBalance = cust.pointsBalance + bonus;
        const newLifetime = cust.lifetimePoints + bonus;
        await dbService.updateUser(cust._id, {
          pointsBalance: newBalance,
          lifetimePoints: newLifetime,
        });

        await dbService.createTransaction({
          type: "EARN",
          customerId: cust._id,
          customerName: cust.name,
          customerPhone: cust.phone,
          billAmount: 0,
          points: bonus,
          balanceAfter: newBalance,
          referenceCode: `BC-${Math.floor(100000 + Math.random() * 900000)}`,
          notes: `Broadcast Promo: ${title}`,
        });
        bonusCreditedCount++;
      }
    }

    // Dispatch real Web Push to all registered customer devices
    const allSubs = await dbService.getAllPushSubscriptions();
    const pushDevicesSent = await dispatchWebPush(allSubs, {
      title: title.trim(),
      body: bonus > 0 ? `${message.trim()} (تمت إضافة +${bonus} نقطة مجانية!)` : message.trim(),
      url: "/customer",
    });

    return NextResponse.json({
      success: true,
      audience: "all",
      notification: notif,
      bonusCreditedTo: bonusCreditedCount,
      pushDevicesSent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
