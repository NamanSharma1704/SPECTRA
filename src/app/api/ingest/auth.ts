import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Checks that the incoming request has a valid admin session cookie.
 * Returns null if authorized, or a 401 NextResponse if not.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const passphrase = cookieStore.get("admin_passphrase")?.value;
  const expected = process.env.ADMIN_PASSPHRASE;

  if (!expected || passphrase !== expected) {
    return NextResponse.json(
      { error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }
  return null;
}
