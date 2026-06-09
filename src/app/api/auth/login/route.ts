import { NextResponse } from "next/server";
import { setSessionUser } from "@/lib/auth";
import { getGroupById, getUserByUsername } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const user = await getUserByUsername(username.trim().toLowerCase());
    if (!user) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await setSessionUser(user.id);
    const group = await getGroupById(user.group_id);
    return NextResponse.json({ user, group });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
