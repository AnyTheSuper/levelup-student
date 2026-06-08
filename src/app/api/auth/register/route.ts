import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";
import { setSessionUser } from "@/lib/auth";
import { AVATARS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, avatar, action, groupName, groupId } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      return NextResponse.json(
        { error: "Username must be 2–20 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        { error: "Username can only use letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    if (!avatar || !AVATARS.includes(avatar)) {
      return NextResponse.json({ error: "Pick a valid avatar" }, { status: 400 });
    }

    const db = getDb();

    const existing = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(trimmedUsername);
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    let resolvedGroupId: string;
    let isOwner = 0;

    if (action === "create") {
      if (!groupName || typeof groupName !== "string" || !groupName.trim()) {
        return NextResponse.json({ error: "Group name is required" }, { status: 400 });
      }

      const trimmedName = groupName.trim();
      if (trimmedName.length < 2 || trimmedName.length > 40) {
        return NextResponse.json(
          { error: "Group name must be 2–40 characters" },
          { status: 400 }
        );
      }

      const nameTaken = db
        .prepare("SELECT id FROM groups WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))")
        .get(trimmedName);
      if (nameTaken) {
        return NextResponse.json(
          { error: "That group already exists — try joining it instead!" },
          { status: 409 }
        );
      }

      resolvedGroupId = uuidv4();
      db.prepare("INSERT INTO groups (id, name) VALUES (?, ?)").run(
        resolvedGroupId,
        trimmedName
      );
      isOwner = 1;
    } else if (action === "join") {
      if (!groupId || typeof groupId !== "string") {
        return NextResponse.json({ error: "Pick a group to join" }, { status: 400 });
      }
      const group = db
        .prepare("SELECT id FROM groups WHERE id = ?")
        .get(groupId) as { id: string } | undefined;
      if (!group) {
        return NextResponse.json({ error: "That group wasn't found" }, { status: 404 });
      }
      resolvedGroupId = group.id;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const userId = uuidv4();
    db.prepare(
      `INSERT INTO users (id, username, avatar, group_id, is_owner)
       VALUES (?, ?, ?, ?, ?)`
    ).run(userId, trimmedUsername, avatar, resolvedGroupId, isOwner);

    await setSessionUser(userId);

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    const group = db.prepare("SELECT * FROM groups WHERE id = ?").get(resolvedGroupId);

    return NextResponse.json({ user, group });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
