import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const db = getDb();
  const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(user.group_id);

  return NextResponse.json({ user, group });
}
