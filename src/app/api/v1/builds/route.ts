import { NextResponse } from "next/server";
import { BuildService } from "@/server/services/BuildService";

export async function GET() {
  try {
    const response = await BuildService.getHydratedBuilds();
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch builds", details: error.message },
      { status: 500 }
    );
  }
}
