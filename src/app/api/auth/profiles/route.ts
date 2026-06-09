import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Profile picking is disabled" }, { status: 403 });
}
