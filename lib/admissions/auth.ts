import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "ibagrads_admin";

// Demo login: one shared password. Set ADMIN_PASSWORD in .env.local; "admin" is only the demo default.
const password = () => process.env.ADMIN_PASSWORD || "admin";

// The cookie holds a hash of the password, never the password itself.
const sessionToken = () => createHash("sha256").update(`ibagrads-admin:${password()}`).digest("hex");

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function checkPassword(input: string): boolean {
  return same(createHash("sha256").update(input).digest("hex"), createHash("sha256").update(password()).digest("hex"));
}

export async function startSession() {
  (await cookies()).set(COOKIE, sessionToken(), {
    httpOnly: true, // page scripts can't read it
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  return !!value && same(value, sessionToken());
}

export const unauthorized = () => Response.json({ error: "Not logged in" }, { status: 401 });
