import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { XP_PER_COMPLETION } from "@/lib/constants";
import { calculateCompletionReward } from "@/lib/xp";
import type { Assignment } from "@/lib/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const assignment = db
    .prepare("SELECT * FROM assignments WHERE id = ? AND group_id = ?")
    .get(id, user.group_id) as Assignment | undefined;
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const existing = db
    .prepare("SELECT id FROM completions WHERE assignment_id = ? AND user_id = ?")
    .get(id, user.id);
  if (existing) {
    return NextResponse.json({ error: "Already completed" }, { status: 409 });
  }

  const baseXp = assignment.xp_reward ?? XP_PER_COMPLETION;
  const { xpEarned, newStreak, streakBonus } = calculateCompletionReward(user, baseXp);
  const today = new Date().toISOString().split("T")[0];

  const complete = db.transaction(() => {
    db.prepare(
      "INSERT INTO completions (id, assignment_id, user_id, xp_earned) VALUES (?, ?, ?, ?)"
    ).run(uuidv4(), id, user.id, xpEarned);

    db.prepare(
      `UPDATE users SET xp = xp + ?, streak = ?, last_completion_date = ? WHERE id = ?`
    ).run(xpEarned, newStreak, today, user.id);
  });

  complete();

  const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);

  return NextResponse.json({
    xpEarned,
    streakBonus,
    newStreak,
    user: updatedUser,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const completion = db
    .prepare(
      "SELECT id, xp_earned FROM completions WHERE assignment_id = ? AND user_id = ?"
    )
    .get(id, user.id) as { id: string; xp_earned: number | null } | undefined;
  if (!completion) {
    return NextResponse.json({ error: "Not completed" }, { status: 404 });
  }

  const assignment = db
    .prepare("SELECT xp_reward FROM assignments WHERE id = ? AND group_id = ?")
    .get(id, user.group_id) as { xp_reward: number } | undefined;

  const xpToRemove =
    completion.xp_earned ?? assignment?.xp_reward ?? XP_PER_COMPLETION;
  const newXp = Math.max(0, user.xp - xpToRemove);

  const uncomplete = db.transaction(() => {
    db.prepare("DELETE FROM completions WHERE assignment_id = ? AND user_id = ?").run(
      id,
      user.id
    );
    db.prepare("UPDATE users SET xp = ? WHERE id = ?").run(newXp, user.id);
  });

  uncomplete();

  const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
  return NextResponse.json({ user: updatedUser, xpRemoved: xpToRemove });
}
