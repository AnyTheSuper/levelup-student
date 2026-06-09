import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const rows = await getLeaderboard(user.group_id);

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
