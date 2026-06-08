import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface ProfileRow {
  id: string;
  username: string;
  avatar: string;
  is_owner: number;
  group_name: string;
}

export async function GET() {
  try {
    const db = getDb();
    const profiles = db
      .prepare(
        `SELECT u.id, u.username, u.avatar, u.is_owner, g.name as group_name
         FROM users u
         JOIN groups g ON g.id = u.group_id
         ORDER BY g.name ASC, u.is_owner DESC, u.username ASC`
      )
      .all() as ProfileRow[];

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("Profiles list error:", error);
    return NextResponse.json({ error: "Could not load profiles" }, { status: 500 });
  }
}
