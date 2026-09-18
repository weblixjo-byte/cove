import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Customer authentication required" }, { status: 401 });
    }

    const user = await dbService.findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const config = await dbService.getConfig();
    const transactions = await dbService.getCustomerTransactions(user._id);
    const notifications = await dbService.getNotifications(user._id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Calculate currency equivalent
    // e.g. 100 points = 1.00 KWD discount -> value = (points / 100) * discountPer100Pts
    const currencyValue = Number(
      ((user.pointsBalance / 100) * (config.discountPer100Pts || 1.0)).toFixed(3)
    );

    // Format 6-digit PIN into visual chunks: "482 - 910"
    const formattedPin = user.pin
      ? `${user.pin.slice(0, 3)} - ${user.pin.slice(3, 6)}`
      : "000 - 000";

    return NextResponse.json({
      success: true,
      customer: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        rawPin: user.pin,
        formattedPin,
        qrSecret: user.qrSecret || user._id,
        pointsBalance: user.pointsBalance,
        lifetimePoints: user.lifetimePoints,
        tier: user.tier,
        currencyValue,
        currency: config.currency,
      },
      config: {
        storeName: config.storeName,
        tagline: config.tagline,
        currency: config.currency,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor,
        discountPer100Pts: config.discountPer100Pts,
      },
      transactions: transactions.slice(0, 10),
      unreadNotificationsCount: unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
