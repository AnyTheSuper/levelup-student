import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { parseXpReward } from "@/lib/xp-reward";
import { deleteAssignment, getAssignment, updateAssignment } from "@/lib/store";

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

  const existing = await getAssignment(id, user.group_id);
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

  const assignment = await updateAssignment(
    id,
    user.group_id,
    subject?.trim() ?? existing.subject,
    description?.trim() ?? existing.description,
    due_date ?? existing.due_date,
    xp
  );

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
  const deleted = await deleteAssignment(id, user.group_id);
  if (!deleted) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
