import type { User, Group, GroupListItem, Assignment } from "@/lib/types";

type DbUser = Omit<User, "is_owner" | "leaderboard_private" | "tutorial_seen"> & {
  is_owner: number | boolean;
  leaderboard_private: number | boolean;
  tutorial_seen: number | boolean;
};

export function normalizeUser(row: DbUser): User {
  return {
    ...row,
    is_owner: row.is_owner ? 1 : 0,
    leaderboard_private: row.leaderboard_private ? 1 : 0,
    tutorial_seen: row.tutorial_seen ? 1 : 0,
  } as User;
}

export function normalizeAssignment(row: Record<string, unknown>): Assignment {
  return {
    ...row,
    completed: row.completed ? true : undefined,
  } as Assignment;
}

export interface ProfileRow {
  id: string;
  username: string;
  avatar: string;
  is_owner: number;
  group_name: string;
}

export interface LeaderboardRow {
  id: string;
  username: string;
  avatar: string;
  xp: number;
  streak: number;
  leaderboard_private: number;
  completed_count: number;
}

export interface MemberRow {
  id: string;
  username: string;
  avatar: string;
  xp: number;
  is_owner: number;
}
