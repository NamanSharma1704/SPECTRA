import { NextResponse } from "next/server";
import { ItemService } from "@/server/services/ItemService";

export async function GET() {
  try {
    const taxonomy = await ItemService.getUnifiedItemTaxonomy();
    return NextResponse.json(taxonomy, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch item taxonomy", details: error.message },
      { status: 500 }
    );
  }
}
