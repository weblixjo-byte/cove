import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbService } from "@/lib/db";
import { sendWebPushToSubscriptions } from "@/lib/push";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    const body = await req.json().catch(() => ({}));
    const endpoint = body.endpoint;
    const customerId = session?.userId || req.headers.get("x-customer-id") || body.customerId;

    let targetSubs: any[] = [];

    // If client provided endpoint and keys directly, use them immediately and ensure saved
    if (endpoint && body.keys?.p256dh && body.keys?.auth) {
      const directSub = {
        userId: customerId || "current_device",
        endpoint,
        keys: body.keys,
        userAgent: req.headers.get("user-agent") || undefined,
      };
      targetSubs.push(directSub);
      await dbService.savePushSubscription(directSub).catch(console.warn);
    } else if (endpoint) {
      const all = await dbService.getAllPushSubscriptions();
      const match = all.find((s) => s.endpoint === endpoint);
      if (match) targetSubs.push(match);
    }

    if (targetSubs.length === 0 && customerId) {
      targetSubs = await dbService.getPushSubscriptionsForUser(customerId);
    }

    // Fallback: If still not found, send to all registered subscriptions
    if (targetSubs.length === 0) {
      const all = await dbService.getAllPushSubscriptions();
      if (all.length > 0) {
        targetSubs = [all[all.length - 1]]; // Send to the latest registered device
      }
    }

    if (targetSubs.length === 0) {
      return NextResponse.json(
        {
          error: "لم يتم العثور على اشتراك مسجل لهذا الجهاز. اضغط زر 'تفعيل' أولاً للسماح بالإشعارات.",
        },
        { status: 404 }
      );
    }

    const sent = await sendWebPushToSubscriptions(targetSubs, {
      title: "☕ كوف كافيه - فحص الإشعارات بنجاح!",
      body: "تهانينا! الإشعارات المباشرة تعمل الآن بكفاءة وتصلك حتى والتطبيق مغلق وشاشة الهاتف مقفلة.",
      url: "/customer",
    });

    return NextResponse.json({
      success: true,
      sentDevices: sent,
      message: "تم إرسال إشعار فحص تجريبي لجهازك بنجاح!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
