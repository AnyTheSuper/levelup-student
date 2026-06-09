import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getGroupById } from "@/lib/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const group = await getGroupById(user.group_id);
  return NextResponse.json({ user, group });
}
