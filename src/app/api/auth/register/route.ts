import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { setSessionUser } from "@/lib/auth";
import { AVATARS } from "@/lib/constants";
import {
  createGroup,
  createUser,
  getGroupById,
  groupNameExists,
  usernameExists,
} from "@/lib/store";

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

    if (await usernameExists(trimmedUsername)) {
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

      if (await groupNameExists(trimmedName)) {
        return NextResponse.json(
          { error: "That group already exists — try joining it instead!" },
          { status: 409 }
        );
      }

      resolvedGroupId = uuidv4();
      await createGroup(resolvedGroupId, trimmedName);
      isOwner = 1;
    } else if (action === "join") {
      if (!groupId || typeof groupId !== "string") {
        return NextResponse.json({ error: "Pick a group to join" }, { status: 400 });
      }
      const group = await getGroupById(groupId);
      if (!group) {
        return NextResponse.json({ error: "That group wasn't found" }, { status: 404 });
      }
      resolvedGroupId = group.id;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const userId = uuidv4();
    const user = await createUser(
      userId,
      trimmedUsername,
      avatar,
      resolvedGroupId,
      isOwner
    );

    await setSessionUser(userId);

    const group = await getGroupById(resolvedGroupId);
    return NextResponse.json({ user, group });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
