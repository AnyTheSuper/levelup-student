import { NextResponse } from "next/server";
import { listProfiles } from "@/lib/store";

export async function GET() {
  try {
    const profiles = await listProfiles();
    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("Profiles list error:", error);
    return NextResponse.json({ error: "Could not load profiles" }, { status: 500 });
  }
}
