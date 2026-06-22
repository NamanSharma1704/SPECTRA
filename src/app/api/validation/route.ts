import { NextResponse } from "next/server";
import { ValidationService } from "@/server/services/ValidationService";
import crypto from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("targetId");
  const targetType = searchParams.get("targetType");

  if (!targetId || !targetType) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const stats = await ValidationService.getValidationStats(targetId, targetType);
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetId, targetType, voteType } = body;

    if (!targetId || !targetType || !voteType) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Get IP Address
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";
    
    // Hash IP with salt to protect privacy
    const salt = process.env.VOTE_SALT || "dip_secret_salt_2026";
    const ipHash = crypto.createHash("sha256").update(ip + salt).digest("hex");

    await ValidationService.submitVote(targetId, targetType, voteType, ipHash);

    // Return the updated stats
    const stats = await ValidationService.getValidationStats(targetId, targetType);
    return NextResponse.json(stats);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
