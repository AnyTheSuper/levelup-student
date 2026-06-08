import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { GroupListItem } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();
    const groups = db
      .prepare(
        `SELECT g.id, g.name, COUNT(u.id) as member_count
         FROM groups g
         LEFT JOIN users u ON u.group_id = g.id
         GROUP BY g.id
         ORDER BY g.name ASC`
      )
      .all() as GroupListItem[];

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Groups list error:", error);
    return NextResponse.json({ error: "Could not load groups" }, { status: 500 });
  }
}
