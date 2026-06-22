import { NextResponse } from "next/server";
import { CreatorRepository } from "@/server/repositories/CreatorRepository";

export async function GET() {
  try {
    const creators = await CreatorRepository.getAllCreators();
    return NextResponse.json({ data: creators });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
