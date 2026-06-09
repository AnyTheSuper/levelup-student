import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { completeAssignment, getAssignment, uncompleteAssignment } from "@/lib/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { id } = await params;
  const assignment = await getAssignment(id, user.group_id);
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const result = await completeAssignment(id, user);
  if (!result) {
    return NextResponse.json({ error: "Already completed" }, { status: 409 });
  }

  return NextResponse.json(result);
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
  const result = await uncompleteAssignment(id, user);

  if (!result) {
    return NextResponse.json({ error: "Not completed" }, { status: 404 });
  }

  return NextResponse.json(result);
}
