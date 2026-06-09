import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSessionUser } from "@/lib/auth";
import { parseXpReward } from "@/lib/xp-reward";
import { createAssignment, listAssignments } from "@/lib/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const assignments = await listAssignments(user.id, user.group_id);
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

  const id = uuidv4();
  const assignment = await createAssignment(
    id,
    user.group_id,
    subject.trim(),
    description.trim(),
    due_date,
    xp,
    user.id
  );

  return NextResponse.json({ assignment }, { status: 201 });
}
