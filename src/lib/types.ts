export interface User {
  id: string;
  username: string;
  avatar: string;
  xp: number;
  streak: number;
  last_completion_date: string | null;
  leaderboard_private: number;
  group_id: string;
  is_owner: number;
  tutorial_seen: number;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  created_at: string;
}

export interface GroupListItem {
  id: string;
  name: string;
  member_count: number;
}

export interface Assignment {
  id: string;
  group_id: string;
  subject: string;
  description: string;
  due_date: string;
  xp_reward: number;
  created_by: string;
  created_at: string;
  completed?: boolean;
  completed_at?: string | null;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  xp: number;
  completed_count: number;
  streak: number;
  leaderboard_private: number;
  is_me: boolean;
}
