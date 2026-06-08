export const AVATARS = [
  "🦊", "🐼", "🦁", "🐸", "🦄", "🐙",
  "🚀", "⭐", "🎮", "📚", "🎨", "⚡",
] as const;

export const XP_PER_COMPLETION = 10;
export const STREAK_BONUS = 5;
export const MIN_XP_REWARD = 1;
export const MAX_XP_REWARD = 100;

export const SUBJECTS = [
  "Math", "Science", "Reading", "Writing", "Social Studies", "Other",
] as const;

export type Avatar = (typeof AVATARS)[number];
export type Subject = (typeof SUBJECTS)[number];
