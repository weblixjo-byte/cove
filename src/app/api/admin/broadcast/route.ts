import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
    }

    const { title, message, bonusPoints } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Notification title and message are required" }, { status: 400 });
    }

    // 1. Create broadcast notification
    const notif = await dbService.createNotification({
      customerId: "all",
      title: title.trim(),
      message: message.trim(),
      type: "BROADCAST",
    });

    // 2. If bonus points are included, credit them to all customers
    let bonusCreditedCount = 0;
    const bonus = Number(bonusPoints);
    if (!isNaN(bonus) && bonus > 0) {
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

    return NextResponse.json({
      success: true,
      notification: notif,
      bonusCreditedTo: bonusCreditedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
