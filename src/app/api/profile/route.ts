import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getGroupById, getProfileMembers, updateUser } from "@/lib/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const group = await getGroupById(user.group_id);
  const members = await getProfileMembers(user.group_id);

  return NextResponse.json({ user, group, members });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json();
  const updated = await updateUser(user.id, {
    leaderboard_private: body.leaderboard_private,
    tutorial_seen: body.tutorial_seen,
  });

  return NextResponse.json({ user: updated });
}
