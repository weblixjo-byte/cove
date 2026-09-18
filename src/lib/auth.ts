import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { AuthSession, UserRole } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "cove_coffee_house_super_secure_secret_loyalty_2026_jwt_token";
export const TOKEN_COOKIE_NAME = "cove_loyalty_session";

export function signToken(session: AuthSession): string {
  return jwt.sign(session, JWT_SECRET, {
    expiresIn: "30d",
  });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireRole(session: AuthSession | null, allowedRoles: UserRole[]): boolean {
  if (!session) return false;
  return allowedRoles.includes(session.role);
}
