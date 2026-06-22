"use server";

import { cookies } from "next/headers";

export async function loginAdmin(formData: FormData) {
  const pwd = formData.get("password");
  if (pwd === process.env.ADMIN_PASSPHRASE) {
    const cookieStore = await cookies();
    cookieStore.set("admin_passphrase", pwd as string, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    return { success: true };
  }
  return { success: false, error: "ACCESS DENIED. INVALID PASSPHRASE." };
}
