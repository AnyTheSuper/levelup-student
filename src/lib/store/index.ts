import { isSupabaseEnabled } from "@/lib/supabase/admin";
import type { Assignment, Group, GroupListItem, User } from "@/lib/types";
import type { LeaderboardRow, MemberRow, ProfileRow } from "./types";
import * as sqlite from "./sqlite";
import * as supabase from "./supabase";

export function getStorageBackend(): "supabase" | "sqlite" {
  return isSupabaseEnabled() ? "supabase" : "sqlite";
}

export async function getUserById(id: string): Promise<User | null> {
  return isSupabaseEnabled()
    ? supabase.supabaseGetUserById(id)
    : sqlite.sqliteGetUserById(id);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return isSupabaseEnabled()
    ? supabase.supabaseGetUserByUsername(username)
    : sqlite.sqliteGetUserByUsername(username);
}

export async function usernameExists(username: string): Promise<boolean> {
  return isSupabaseEnabled()
    ? supabase.supabaseUsernameExists(username)
    : sqlite.sqliteUsernameExists(username);
}

export async function groupNameExists(name: string): Promise<boolean> {
  return isSupabaseEnabled()
    ? supabase.supabaseGroupNameExists(name)
    : sqlite.sqliteGroupNameExists(name);
}

export async function getGroupById(id: string): Promise<Group | null> {
  return isSupabaseEnabled()
    ? supabase.supabaseGetGroupById(id)
    : sqlite.sqliteGetGroupById(id);
}

export async function createGroup(id: string, name: string): Promise<Group> {
  return isSupabaseEnabled()
    ? supabase.supabaseCreateGroup(id, name)
    : sqlite.sqliteCreateGroup(id, name);
}

export async function createUser(
  id: string,
  username: string,
  avatar: string,
  groupId: string,
  isOwner: number
): Promise<User> {
  return isSupabaseEnabled()
    ? supabase.supabaseCreateUser(id, username, avatar, groupId, isOwner)
    : sqlite.sqliteCreateUser(id, username, avatar, groupId, isOwner);
}

export async function listGroups(): Promise<GroupListItem[]> {
  return isSupabaseEnabled()
    ? supabase.supabaseListGroups()
    : sqlite.sqliteListGroups();
}

export async function listProfiles(): Promise<ProfileRow[]> {
  return isSupabaseEnabled()
    ? supabase.supabaseListProfiles()
    : sqlite.sqliteListProfiles();
}

export async function listAssignments(
  userId: string,
  groupId: string
): Promise<Assignment[]> {
  return isSupabaseEnabled()
    ? supabase.supabaseListAssignments(userId, groupId)
    : sqlite.sqliteListAssignments(userId, groupId);
}

export async function createAssignment(
  id: string,
  groupId: string,
  subject: string,
  description: string,
  dueDate: string,
  xpReward: number,
  createdBy: string
): Promise<Assignment> {
  return isSupabaseEnabled()
    ? supabase.supabaseCreateAssignment(
        id,
        groupId,
        subject,
        description,
        dueDate,
        xpReward,
        createdBy
      )
    : sqlite.sqliteCreateAssignment(
        id,
        groupId,
        subject,
        description,
        dueDate,
        xpReward,
        createdBy
      );
}

export async function updateAssignment(
  id: string,
  groupId: string,
  subject: string,
  description: string,
  dueDate: string,
  xpReward: number
): Promise<Assignment | null> {
  return isSupabaseEnabled()
    ? supabase.supabaseUpdateAssignment(
        id,
        groupId,
        subject,
        description,
        dueDate,
        xpReward
      )
    : sqlite.sqliteUpdateAssignment(
        id,
        groupId,
        subject,
        description,
        dueDate,
        xpReward
      );
}

export async function deleteAssignment(id: string, groupId: string): Promise<boolean> {
  return isSupabaseEnabled()
    ? supabase.supabaseDeleteAssignment(id, groupId)
    : sqlite.sqliteDeleteAssignment(id, groupId);
}

export async function getAssignment(
  id: string,
  groupId: string
): Promise<Assignment | null> {
  return isSupabaseEnabled()
    ? supabase.supabaseGetAssignment(id, groupId)
    : sqlite.sqliteGetAssignment(id, groupId);
}

export async function completeAssignment(
  assignmentId: string,
  user: User
): Promise<{
  xpEarned: number;
  streakBonus: number;
  newStreak: number;
  user: User;
} | null> {
  return isSupabaseEnabled()
    ? supabase.supabaseCompleteAssignment(assignmentId, user)
    : sqlite.sqliteCompleteAssignment(assignmentId, user);
}

export async function uncompleteAssignment(
  assignmentId: string,
  user: User
): Promise<{ user: User; xpRemoved: number } | null> {
  return isSupabaseEnabled()
    ? supabase.supabaseUncompleteAssignment(assignmentId, user)
    : sqlite.sqliteUncompleteAssignment(assignmentId, user);
}

export async function getLeaderboard(groupId: string): Promise<LeaderboardRow[]> {
  return isSupabaseEnabled()
    ? supabase.supabaseGetLeaderboard(groupId)
    : sqlite.sqliteGetLeaderboard(groupId);
}

export async function getProfileMembers(groupId: string): Promise<MemberRow[]> {
  return isSupabaseEnabled()
    ? supabase.supabaseGetProfileMembers(groupId)
    : sqlite.sqliteGetProfileMembers(groupId);
}

export async function updateUser(
  userId: string,
  updates: { leaderboard_private?: boolean; tutorial_seen?: boolean }
): Promise<User> {
  return isSupabaseEnabled()
    ? supabase.supabaseUpdateUser(userId, updates)
    : sqlite.sqliteUpdateUser(userId, updates);
}
