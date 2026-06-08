import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { setSessionUser } from "@/lib/auth";
import type { User } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const db = getDb();
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username.trim().toLowerCase()) as User | undefined;

    if (!user) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await setSessionUser(user.id);

    const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(user.group_id);
    return NextResponse.json({ user, group });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
