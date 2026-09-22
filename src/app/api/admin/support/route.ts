import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    // Disallow standard customers from submitting internal admin incident tickets
    if (session && session.role === "customer") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      subject,
      category = "Technical Glitch",
      urgency = "Medium",
      adminName = "Store Admin",
      contactPhone = "Not provided",
      adminEmail = "info@weblix-jo.com",
      message,
      diagnostics = {},
    } = body;

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { success: false, error: "Ticket subject is required." },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Detailed issue description is required." },
        { status: 400 }
      );
    }

    const accessKey =
      process.env.WEB3FORMS_ACCESS_KEY ||
      "7f0e27f4-7df7-4105-af7a-985d05cc02d1";

    const ticketId = `TK-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Amman",
      dateStyle: "full",
      timeStyle: "medium",
    });

    // Format human-readable diagnostics block
    const diagLines = [
      `• Platform / OS: ${diagnostics.platform || "Unknown"}`,
      `• Browser: ${diagnostics.browser || "Unknown"}`,
      `• User Agent: ${diagnostics.userAgent || "Unknown"}`,
      `• Screen Viewport: ${diagnostics.screenWidth || "?"} x ${diagnostics.screenHeight || "?"} (DPR: ${diagnostics.devicePixelRatio || "1"})`,
      `• Device Type: ${diagnostics.deviceType || "Desktop / Tablet"}`,
      `• Current Page URL: ${diagnostics.currentUrl || "/admin"}`,
      `• Local Time (Jordan): ${timestamp}`,
    ].join("\n");

    const formattedMessage = [
      `═══════════════════════════════════════════════`,
      `  COVE LOYALTY SAAS — SUPPORT INCIDENT TICKET  `,
      `═══════════════════════════════════════════════`,
      ``,
      `TICKET ID: #${ticketId}`,
      `URGENCY: ${String(urgency).toUpperCase()}`,
      `CATEGORY: ${category}`,
      `SUBJECT: ${subject.trim()}`,
      ``,
      `──────────────── SENDER DETAILS ────────────────`,
      `• Store / Admin: ${adminName.trim()}`,
      `• Contact Phone: ${contactPhone.trim()}`,
      `• Contact Email: ${adminEmail.trim()}`,
      ``,
      `─────────────── ISSUE DESCRIPTION ──────────────`,
      message.trim(),
      ``,
      `────────────── SYSTEM DIAGNOSTICS ──────────────`,
      diagLines,
      ``,
      `═══════════════════════════════════════════════`,
      `Delivered via Web3Forms API to Weblix Support Team`,
    ].join("\n");

    const payload = {
      access_key: accessKey,
      subject: `[${String(urgency).toUpperCase()}] [#${ticketId}] ${category}: ${subject.trim()}`,
      from_name: `${adminName.trim()} (Cove Loyalty)`,
      email: adminEmail.trim() || "info@weblix-jo.com",
      ticket_id: ticketId,
      category,
      urgency,
      store_admin: adminName.trim(),
      contact_phone: contactPhone.trim(),
      message: formattedMessage,
    };

    const web3Response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const web3Data = await web3Response.json();

    if (web3Response.ok && web3Data.success) {
      return NextResponse.json({
        success: true,
        ticketId,
        message: "Support ticket dispatched successfully to Weblix Engineering.",
      });
    } else {
      console.warn("Web3Forms error response:", web3Data);
      return NextResponse.json(
        {
          success: false,
          error: web3Data.message || "Web3Forms submission failed.",
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("Support ticket API route exception:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process ticket request." },
      { status: 500 }
    );
  }
}
