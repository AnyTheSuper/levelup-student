import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { parseXpReward } from "@/lib/xp-reward";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const db = getDb();
  const assignments = db
    .prepare(
      `SELECT a.*,
        CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END as completed,
        c.completed_at
       FROM assignments a
       LEFT JOIN completions c ON c.assignment_id = a.id AND c.user_id = ?
       WHERE a.group_id = ?
       ORDER BY
         CASE WHEN c.id IS NULL THEN 0 ELSE 1 END,
         a.due_date ASC`
    )
    .all(user.id, user.group_id);

  return NextResponse.json({ assignments });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  if (!user.is_owner) {
    return NextResponse.json({ error: "Only group owners can add homework" }, { status: 403 });
  }

  const body = await request.json();
  const { subject, description, due_date, xp_reward } = body;

  if (!subject?.trim() || !description?.trim() || !due_date) {
    return NextResponse.json({ error: "Subject, description, and due date are required" }, { status: 400 });
  }

  const xp = parseXpReward(xp_reward);
  if (xp === null) {
    return NextResponse.json({ error: "XP must be between 1 and 100" }, { status: 400 });
  }

  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO assignments (id, group_id, subject, description, due_date, xp_reward, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, user.group_id, subject.trim(), description.trim(), due_date, xp, user.id);

  const assignment = db.prepare("SELECT * FROM assignments WHERE id = ?").get(id);
  return NextResponse.json({ assignment }, { status: 201 });
}
