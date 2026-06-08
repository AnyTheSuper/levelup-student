import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface RawEntry {
  id: string;
  username: string;
  avatar: string;
  xp: number;
  streak: number;
  leaderboard_private: number;
  completed_count: number;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT u.id, u.username, u.avatar, u.xp, u.streak, u.leaderboard_private,
        (SELECT COUNT(*) FROM completions c WHERE c.user_id = u.id) as completed_count
       FROM users u
       WHERE u.group_id = ?
       ORDER BY u.xp DESC, completed_count DESC`
    )
    .all(user.group_id) as RawEntry[];

  const entries = rows.map((entry) => ({
    ...entry,
    is_me: entry.id === user.id,
    username:
      entry.leaderboard_private && entry.id !== user.id
        ? "Anonymous"
        : entry.username,
    avatar:
      entry.leaderboard_private && entry.id !== user.id ? "🕶️" : entry.avatar,
  }));

  return NextResponse.json({ entries });
}
