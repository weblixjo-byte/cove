import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { endpoint, keys, customerId } = body;

    let session = await getSession(req);
    let userId = session && session.role === "customer" ? session.userId : null;

    if (!userId) {
      const fallbackCustomerId = req.headers.get("x-customer-id") || customerId;
      if (fallbackCustomerId) {
        const candidate = await dbService.findUserById(fallbackCustomerId);
        if (candidate && candidate.role === "customer") {
          userId = candidate._id;
        }
      }
    }

    if (!userId) {
      // If customer session not found, try to link with first or recent customer or create binding
      return NextResponse.json({ error: "Customer authentication required" }, { status: 401 });
    }

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json({ error: "Invalid push subscription object" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || undefined;

    const sub = await dbService.savePushSubscription({
      userId,
      endpoint,
      keys,
      userAgent,
    });

    console.log(`[PushSubscription] Successfully saved device for customer ${userId} (endpoint: ${endpoint.slice(-20)})`);

    return NextResponse.json({ success: true, subscription: sub });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (endpoint) {
      await dbService.deletePushSubscription(endpoint);
    }

    return NextResponse.json({ success: true, message: "Subscription removed" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
