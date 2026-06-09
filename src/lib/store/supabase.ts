import { v4 as uuidv4 } from "uuid";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { XP_PER_COMPLETION } from "@/lib/constants";
import { calculateCompletionReward } from "@/lib/xp";
import type { Assignment, Group, GroupListItem, User } from "@/lib/types";
import type { LeaderboardRow, MemberRow, ProfileRow } from "./types";
import { normalizeUser } from "./types";

function db() {
  return getSupabaseAdmin();
}

export async function supabaseGetUserById(id: string): Promise<User | null> {
  const { data, error } = await db().from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? normalizeUser(data) : null;
}

export async function supabaseGetUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await db()
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeUser(data) : null;
}

export async function supabaseUsernameExists(username: string): Promise<boolean> {
  const { data, error } = await db()
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function supabaseGroupNameExists(name: string): Promise<boolean> {
  const { data, error } = await db().from("groups").select("id, name");
  if (error) throw error;
  const lower = name.trim().toLowerCase();
  return (data ?? []).some((g) => g.name.trim().toLowerCase() === lower);
}

export async function supabaseGetGroupById(id: string): Promise<Group | null> {
  const { data, error } = await db().from("groups").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Group | null;
}

export async function supabaseCreateGroup(id: string, name: string): Promise<Group> {
  const { data, error } = await db()
    .from("groups")
    .insert({ id, name: name.trim() })
    .select("*")
    .single();
  if (error) throw error;
  return data as Group;
}

export async function supabaseCreateUser(
  id: string,
  username: string,
  avatar: string,
  groupId: string,
  isOwner: number
): Promise<User> {
  const { data, error } = await db()
    .from("users")
    .insert({
      id,
      username,
      avatar,
      group_id: groupId,
      is_owner: isOwner === 1,
    })
    .select("*")
    .single();
  if (error) throw error;
  return normalizeUser(data);
}

export async function supabaseListGroups(): Promise<GroupListItem[]> {
  const { data: groups, error: gErr } = await db()
    .from("groups")
    .select("id, name")
    .order("name");
  if (gErr) throw gErr;

  const { data: users, error: uErr } = await db().from("users").select("group_id");
  if (uErr) throw uErr;

  const counts = new Map<string, number>();
  for (const u of users ?? []) {
    counts.set(u.group_id, (counts.get(u.group_id) ?? 0) + 1);
  }

  return (groups ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    member_count: counts.get(g.id) ?? 0,
  }));
}

export async function supabaseListProfiles(): Promise<ProfileRow[]> {
  const { data: users, error: uErr } = await db()
    .from("users")
    .select("id, username, avatar, is_owner, group_id")
    .order("username");
  if (uErr) throw uErr;

  const { data: groups, error: gErr } = await db().from("groups").select("id, name");
  if (gErr) throw gErr;

  const groupNames = new Map((groups ?? []).map((g) => [g.id, g.name]));

  return (users ?? [])
    .map((row) => ({
      id: row.id,
      username: row.username,
      avatar: row.avatar,
      is_owner: row.is_owner ? 1 : 0,
      group_name: groupNames.get(row.group_id) ?? "",
    }))
    .sort((a, b) => a.group_name.localeCompare(b.group_name) || b.is_owner - a.is_owner);
}

export async function supabaseListAssignments(
  userId: string,
  groupId: string
): Promise<Assignment[]> {
  const { data: assignments, error: aErr } = await db()
    .from("assignments")
    .select("*")
    .eq("group_id", groupId)
    .order("due_date");
  if (aErr) throw aErr;

  const { data: completions, error: cErr } = await db()
    .from("completions")
    .select("assignment_id, completed_at")
    .eq("user_id", userId);
  if (cErr) throw cErr;

  const completionMap = new Map(
    (completions ?? []).map((c) => [c.assignment_id, c.completed_at])
  );

  const merged = (assignments ?? []).map((a) => ({
    ...a,
    completed: completionMap.has(a.id) ? 1 : 0,
    completed_at: completionMap.get(a.id) ?? null,
  }));

  merged.sort((a, b) => {
    const aDone = a.completed ? 1 : 0;
    const bDone = b.completed ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return String(a.due_date).localeCompare(String(b.due_date));
  });

  return merged as Assignment[];
}

export async function supabaseCreateAssignment(
  id: string,
  groupId: string,
  subject: string,
  description: string,
  dueDate: string,
  xpReward: number,
  createdBy: string
): Promise<Assignment> {
  const { data, error } = await db()
    .from("assignments")
    .insert({
      id,
      group_id: groupId,
      subject,
      description,
      due_date: dueDate,
      xp_reward: xpReward,
      created_by: createdBy,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Assignment;
}

export async function supabaseUpdateAssignment(
  id: string,
  groupId: string,
  subject: string,
  description: string,
  dueDate: string,
  xpReward: number
): Promise<Assignment | null> {
  const { data, error } = await db()
    .from("assignments")
    .update({
      subject,
      description,
      due_date: dueDate,
      xp_reward: xpReward,
    })
    .eq("id", id)
    .eq("group_id", groupId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as Assignment | null;
}

export async function supabaseDeleteAssignment(id: string, groupId: string): Promise<boolean> {
  const { data: existing } = await db()
    .from("assignments")
    .select("id")
    .eq("id", id)
    .eq("group_id", groupId)
    .maybeSingle();
  if (!existing) return false;

  const { error } = await db().from("assignments").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function supabaseGetAssignment(
  id: string,
  groupId: string
): Promise<Assignment | null> {
  const { data, error } = await db()
    .from("assignments")
    .select("*")
    .eq("id", id)
    .eq("group_id", groupId)
    .maybeSingle();
  if (error) throw error;
  return data as Assignment | null;
}

export async function supabaseCompleteAssignment(
  assignmentId: string,
  user: User
): Promise<{ xpEarned: number; streakBonus: number; newStreak: number; user: User } | null> {
  const assignment = await supabaseGetAssignment(assignmentId, user.group_id);
  if (!assignment) return null;

  const { data: existing } = await db()
    .from("completions")
    .select("id")
    .eq("assignment_id", assignmentId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return null;

  const baseXp = assignment.xp_reward ?? XP_PER_COMPLETION;
  const { xpEarned, newStreak, streakBonus } = calculateCompletionReward(user, baseXp);
  const today = new Date().toISOString().split("T")[0];

  const { error: cErr } = await db().from("completions").insert({
    id: uuidv4(),
    assignment_id: assignmentId,
    user_id: user.id,
    xp_earned: xpEarned,
  });
  if (cErr) throw cErr;

  const { error: uErr } = await db()
    .from("users")
    .update({
      xp: user.xp + xpEarned,
      streak: newStreak,
      last_completion_date: today,
    })
    .eq("id", user.id);
  if (uErr) throw uErr;

  return {
    xpEarned,
    streakBonus,
    newStreak,
    user: (await supabaseGetUserById(user.id))!,
  };
}

export async function supabaseUncompleteAssignment(
  assignmentId: string,
  user: User
): Promise<{ user: User; xpRemoved: number } | null> {
  const { data: completion, error: cErr } = await db()
    .from("completions")
    .select("id, xp_earned")
    .eq("assignment_id", assignmentId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (cErr) throw cErr;
  if (!completion) return null;

  const assignment = await supabaseGetAssignment(assignmentId, user.group_id);
  const xpToRemove =
    completion.xp_earned ?? assignment?.xp_reward ?? XP_PER_COMPLETION;
  const newXp = Math.max(0, user.xp - xpToRemove);

  const { error: dErr } = await db()
    .from("completions")
    .delete()
    .eq("assignment_id", assignmentId)
    .eq("user_id", user.id);
  if (dErr) throw dErr;

  const { error: uErr } = await db().from("users").update({ xp: newXp }).eq("id", user.id);
  if (uErr) throw uErr;

  return { user: (await supabaseGetUserById(user.id))!, xpRemoved: xpToRemove };
}

export async function supabaseGetLeaderboard(groupId: string): Promise<LeaderboardRow[]> {
  const { data: users, error: uErr } = await db()
    .from("users")
    .select("id, username, avatar, xp, streak, leaderboard_private")
    .eq("group_id", groupId);
  if (uErr) throw uErr;

  const userIds = (users ?? []).map((u) => u.id);
  if (userIds.length === 0) return [];

  const { data: completions, error: cErr } = await db()
    .from("completions")
    .select("user_id")
    .in("user_id", userIds);
  if (cErr) throw cErr;

  const counts = new Map<string, number>();
  for (const c of completions ?? []) {
    counts.set(c.user_id, (counts.get(c.user_id) ?? 0) + 1);
  }

  return (users ?? [])
    .map((u) => ({
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      xp: u.xp,
      streak: u.streak,
      leaderboard_private: u.leaderboard_private ? 1 : 0,
      completed_count: counts.get(u.id) ?? 0,
    }))
    .sort((a, b) => b.xp - a.xp || b.completed_count - a.completed_count);
}

export async function supabaseGetProfileMembers(groupId: string): Promise<MemberRow[]> {
  const { data, error } = await db()
    .from("users")
    .select("id, username, avatar, xp, is_owner")
    .eq("group_id", groupId);
  if (error) throw error;
  return (data ?? []).map((m) => ({
    ...m,
    is_owner: m.is_owner ? 1 : 0,
  }));
}

export async function supabaseUpdateUser(
  userId: string,
  updates: { leaderboard_private?: boolean; tutorial_seen?: boolean }
): Promise<User> {
  const payload: Record<string, boolean> = {};
  if (typeof updates.leaderboard_private === "boolean") {
    payload.leaderboard_private = updates.leaderboard_private;
  }
  if (updates.tutorial_seen === true) {
    payload.tutorial_seen = true;
  }

  const { error } = await db().from("users").update(payload).eq("id", userId);
  if (error) throw error;
  return (await supabaseGetUserById(userId))!;
}
