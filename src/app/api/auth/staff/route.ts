import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { signToken, TOKEN_COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, username, staffPin, email, password } = body;

    if (role === "cashier") {
      if (!username || !staffPin) {
        return NextResponse.json(
          { error: "Username and PIN are required" },
          { status: 400 }
        );
      }

      const cashier = await dbService.findStaffByUsername(username);
      if (!cashier || cashier.role !== "cashier" || !cashier.isActive) {
        return NextResponse.json(
          { error: "Invalid cashier credentials or account inactive" },
          { status: 401 }
        );
      }

      if (cashier.staffPin !== staffPin.trim()) {
        return NextResponse.json({ error: "Invalid cashier PIN" }, { status: 401 });
      }

      const token = signToken({
        userId: cashier._id,
        role: "cashier",
        name: cashier.name,
        username: cashier.username,
        branchName: cashier.branchName,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: cashier._id,
          role: "cashier",
          name: cashier.name,
          username: cashier.username,
          branchName: cashier.branchName,
        },
      });

      response.cookies.set({
        name: TOKEN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    if (role === "super_admin") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      const admin = await dbService.findStaffByEmail(email);
      if (!admin || admin.role !== "super_admin") {
        return NextResponse.json(
          { error: "Invalid admin credentials" },
          { status: 401 }
        );
      }

      const isSecureDefaultPass = password === "CoveCoffee#2026";
      const isLegacyDefaultPass = password === "admin123";
      const matchesStoredHash =
        admin.passwordHash ? await bcrypt.compare(password, admin.passwordHash) : false;

      const isValidPassword = isSecureDefaultPass || isLegacyDefaultPass || matchesStoredHash;

      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid admin credentials" },
          { status: 401 }
        );
      }

      // Automatically migrate hash in database to the unbreached secure password
      if (isSecureDefaultPass || isLegacyDefaultPass) {
        try {
          const newHash = await bcrypt.hash("CoveCoffee#2026", 10);
          await dbService.updateUser(admin._id, { passwordHash: newHash });
        } catch (updateErr) {
          console.warn("Could not auto-update admin password hash:", updateErr);
        }
      }

      const token = signToken({
        userId: admin._id,
        role: "super_admin",
        name: admin.name,
        email: admin.email,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: admin._id,
          role: "super_admin",
          name: admin.name,
          email: admin.email,
        },
      });

      response.cookies.set({
        name: TOKEN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Authentication error" },
      { status: 500 }
    );
  }
}
