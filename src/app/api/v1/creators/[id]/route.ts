import { NextResponse } from "next/server";
import { CreatorRepository } from "@/server/repositories/CreatorRepository";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await CreatorRepository.getCreatorById(id);
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
