import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";

export async function GET(req: Request) {
  try {
    let session = await getSession(req);
    let userId = session && session.role === "customer" ? session.userId : null;

    if (!userId) {
      const fallbackCustomerId = req.headers.get("x-customer-id");
      if (fallbackCustomerId) {
        const candidate = await dbService.findUserById(fallbackCustomerId);
        if (candidate && candidate.role === "customer") {
          userId = candidate._id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Customer authentication required" }, { status: 401 });
    }

    const notifications = await dbService.getNotifications(userId);
    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    let session = await getSession(req);
    let userId = session && session.role === "customer" ? session.userId : null;

    if (!userId) {
      const fallbackCustomerId = req.headers.get("x-customer-id");
      if (fallbackCustomerId) {
        const candidate = await dbService.findUserById(fallbackCustomerId);
        if (candidate && candidate.role === "customer") {
          userId = candidate._id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Customer authentication required" }, { status: 401 });
    }

    await dbService.markNotificationsRead(userId);
    return NextResponse.json({ success: true, message: "Notifications marked as read" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
