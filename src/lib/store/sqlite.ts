import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";
import { XP_PER_COMPLETION } from "@/lib/constants";
import { calculateCompletionReward } from "@/lib/xp";
import type { Assignment, Group, GroupListItem, User } from "@/lib/types";
import type { LeaderboardRow, MemberRow, ProfileRow } from "./types";
import { normalizeUser } from "./types";

export function sqliteGetUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | Parameters<typeof normalizeUser>[0]
    | undefined;
  return row ? normalizeUser(row) : null;
}

export function sqliteGetUserByUsername(username: string): User | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as Parameters<typeof normalizeUser>[0] | undefined;
  return row ? normalizeUser(row) : null;
}

export function sqliteUsernameExists(username: string): boolean {
  const db = getDb();
  return !!db.prepare("SELECT id FROM users WHERE username = ?").get(username);
}

export function sqliteGroupNameExists(name: string): boolean {
  const db = getDb();
  return !!db
    .prepare("SELECT id FROM groups WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))")
    .get(name);
}

export function sqliteGetGroupById(id: string): Group | null {
  const db = getDb();
  return (db.prepare("SELECT * FROM groups WHERE id = ?").get(id) as Group) ?? null;
}

export function sqliteCreateGroup(id: string, name: string): Group {
  const db = getDb();
  db.prepare("INSERT INTO groups (id, name) VALUES (?, ?)").run(id, name);
  return db.prepare("SELECT * FROM groups WHERE id = ?").get(id) as Group;
}

export function sqliteCreateUser(
  id: string,
  username: string,
  avatar: string,
  groupId: string,
  isOwner: number
): User {
  const db = getDb();
  db.prepare(
    `INSERT INTO users (id, username, avatar, group_id, is_owner)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, username, avatar, groupId, isOwner);
  return sqliteGetUserById(id)!;
}

export function sqliteListGroups(): GroupListItem[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT g.id, g.name, COUNT(u.id) as member_count
       FROM groups g
       LEFT JOIN users u ON u.group_id = g.id
       GROUP BY g.id
       ORDER BY g.name ASC`
    )
    .all() as GroupListItem[];
}

export function sqliteListProfiles(): ProfileRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT u.id, u.username, u.avatar, u.is_owner, g.name as group_name
       FROM users u
       JOIN groups g ON g.id = u.group_id
       ORDER BY g.name ASC, u.is_owner DESC, u.username ASC`
    )
    .all() as ProfileRow[];
}

export function sqliteListAssignments(userId: string, groupId: string): Assignment[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT a.*,
        CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END as completed,
        c.completed_at
       FROM assignments a
       LEFT JOIN completions c ON c.assignment_id = a.id AND c.user_id = ?
       WHERE a.group_id = ?
       ORDER BY
         CASE WHEN c.id IS NULL THEN 0 ELSE 1 END,
         a.due_date ASC`
    )
    .all(userId, groupId) as Assignment[];
}

export function sqliteCreateAssignment(
  id: string,
  groupId: string,
  subject: string,
  description: string,
  dueDate: string,
  xpReward: number,
  createdBy: string
): Assignment {
  const db = getDb();
  db.prepare(
    `INSERT INTO assignments (id, group_id, subject, description, due_date, xp_reward, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, groupId, subject, description, dueDate, xpReward, createdBy);
  return db.prepare("SELECT * FROM assignments WHERE id = ?").get(id) as Assignment;
}

export function sqliteUpdateAssignment(
  id: string,
  groupId: string,
  subject: string,
  description: string,
  dueDate: string,
  xpReward: number
): Assignment | null {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM assignments WHERE id = ? AND group_id = ?")
    .get(id, groupId);
  if (!existing) return null;

  db.prepare(
    `UPDATE assignments SET subject = ?, description = ?, due_date = ?, xp_reward = ? WHERE id = ?`
  ).run(subject, description, dueDate, xpReward, id);
  return db.prepare("SELECT * FROM assignments WHERE id = ?").get(id) as Assignment;
}

export function sqliteDeleteAssignment(id: string, groupId: string): boolean {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM assignments WHERE id = ? AND group_id = ?")
    .get(id, groupId);
  if (!existing) return false;

  db.prepare("DELETE FROM completions WHERE assignment_id = ?").run(id);
  db.prepare("DELETE FROM assignments WHERE id = ?").run(id);
  return true;
}

export function sqliteGetAssignment(id: string, groupId: string): Assignment | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM assignments WHERE id = ? AND group_id = ?")
      .get(id, groupId) as Assignment) ?? null
  );
}

export function sqliteCompleteAssignment(
  assignmentId: string,
  user: User
): { xpEarned: number; streakBonus: number; newStreak: number; user: User } | null {
  const db = getDb();
  const assignment = sqliteGetAssignment(assignmentId, user.group_id);
  if (!assignment) return null;

  const existing = db
    .prepare("SELECT id FROM completions WHERE assignment_id = ? AND user_id = ?")
    .get(assignmentId, user.id);
  if (existing) return null;

  const baseXp = assignment.xp_reward ?? XP_PER_COMPLETION;
  const { xpEarned, newStreak, streakBonus } = calculateCompletionReward(user, baseXp);
  const today = new Date().toISOString().split("T")[0];

  const complete = db.transaction(() => {
    db.prepare(
      "INSERT INTO completions (id, assignment_id, user_id, xp_earned) VALUES (?, ?, ?, ?)"
    ).run(uuidv4(), assignmentId, user.id, xpEarned);
    db.prepare(
      `UPDATE users SET xp = xp + ?, streak = ?, last_completion_date = ? WHERE id = ?`
    ).run(xpEarned, newStreak, today, user.id);
  });
  complete();

  return {
    xpEarned,
    streakBonus,
    newStreak,
    user: sqliteGetUserById(user.id)!,
  };
}

export function sqliteUncompleteAssignment(
  assignmentId: string,
  user: User
): { user: User; xpRemoved: number } | null {
  const db = getDb();
  const completion = db
    .prepare(
      "SELECT id, xp_earned FROM completions WHERE assignment_id = ? AND user_id = ?"
    )
    .get(assignmentId, user.id) as { id: string; xp_earned: number | null } | undefined;
  if (!completion) return null;

  const assignment = db
    .prepare("SELECT xp_reward FROM assignments WHERE id = ? AND group_id = ?")
    .get(assignmentId, user.group_id) as { xp_reward: number } | undefined;

  const xpToRemove =
    completion.xp_earned ?? assignment?.xp_reward ?? XP_PER_COMPLETION;
  const newXp = Math.max(0, user.xp - xpToRemove);

  const uncomplete = db.transaction(() => {
    db.prepare("DELETE FROM completions WHERE assignment_id = ? AND user_id = ?").run(
      assignmentId,
      user.id
    );
    db.prepare("UPDATE users SET xp = ? WHERE id = ?").run(newXp, user.id);
  });
  uncomplete();

  return { user: sqliteGetUserById(user.id)!, xpRemoved: xpToRemove };
}

export function sqliteGetLeaderboard(groupId: string): LeaderboardRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT u.id, u.username, u.avatar, u.xp, u.streak, u.leaderboard_private,
        (SELECT COUNT(*) FROM completions c WHERE c.user_id = u.id) as completed_count
       FROM users u
       WHERE u.group_id = ?
       ORDER BY u.xp DESC, completed_count DESC`
    )
    .all(groupId) as LeaderboardRow[];
}

export function sqliteGetProfileMembers(groupId: string): MemberRow[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT id, username, avatar, xp, is_owner FROM users WHERE group_id = ?"
    )
    .all(groupId) as MemberRow[];
}

export function sqliteUpdateUser(
  userId: string,
  updates: { leaderboard_private?: boolean; tutorial_seen?: boolean }
): User {
  const db = getDb();
  if (typeof updates.leaderboard_private === "boolean") {
    db.prepare("UPDATE users SET leaderboard_private = ? WHERE id = ?").run(
      updates.leaderboard_private ? 1 : 0,
      userId
    );
  }
  if (updates.tutorial_seen === true) {
    db.prepare("UPDATE users SET tutorial_seen = 1 WHERE id = ?").run(userId);
  }
  return sqliteGetUserById(userId)!;
}
