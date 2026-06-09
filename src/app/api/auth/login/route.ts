import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Profile switching is disabled" }, { status: 403 });
}
