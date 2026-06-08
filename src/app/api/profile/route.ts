import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const db = getDb();
  const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(user.group_id);
  const members = db
    .prepare("SELECT id, username, avatar, xp, is_owner FROM users WHERE group_id = ?")
    .all(user.group_id);

  return NextResponse.json({ user, group, members });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json();
  const db = getDb();

  if (typeof body.leaderboard_private === "boolean") {
    db.prepare("UPDATE users SET leaderboard_private = ? WHERE id = ?").run(
      body.leaderboard_private ? 1 : 0,
      user.id
    );
  }

  if (body.tutorial_seen === true) {
    db.prepare("UPDATE users SET tutorial_seen = 1 WHERE id = ?").run(user.id);
  }

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
  return NextResponse.json({ user: updated });
}
