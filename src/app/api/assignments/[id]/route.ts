import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { parseXpReward } from "@/lib/xp-reward";
import type { Assignment } from "@/lib/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  if (!user.is_owner) {
    return NextResponse.json({ error: "Only group owners can edit homework" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { subject, description, due_date, xp_reward } = body;

  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM assignments WHERE id = ? AND group_id = ?")
    .get(id, user.group_id) as Assignment | undefined;
  if (!existing) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  let xp = existing.xp_reward ?? 10;
  if (xp_reward !== undefined) {
    const parsed = parseXpReward(xp_reward);
    if (parsed === null) {
      return NextResponse.json({ error: "XP must be between 1 and 100" }, { status: 400 });
    }
    xp = parsed;
  }

  db.prepare(
    `UPDATE assignments SET subject = ?, description = ?, due_date = ?, xp_reward = ? WHERE id = ?`
  ).run(
    subject?.trim() ?? existing.subject,
    description?.trim() ?? existing.description,
    due_date ?? existing.due_date,
    xp,
    id
  );

  const assignment = db.prepare("SELECT * FROM assignments WHERE id = ?").get(id);
  return NextResponse.json({ assignment });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  if (!user.is_owner) {
    return NextResponse.json({ error: "Only group owners can delete homework" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM assignments WHERE id = ? AND group_id = ?")
    .get(id, user.group_id);
  if (!existing) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  db.prepare("DELETE FROM completions WHERE assignment_id = ?").run(id);
  db.prepare("DELETE FROM assignments WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
