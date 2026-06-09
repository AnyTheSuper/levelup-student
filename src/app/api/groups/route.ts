import { NextResponse } from "next/server";
import { listGroups } from "@/lib/store";

export async function GET() {
  try {
    const groups = await listGroups();
    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Groups list error:", error);
    return NextResponse.json({ error: "Could not load groups" }, { status: 500 });
  }
}
