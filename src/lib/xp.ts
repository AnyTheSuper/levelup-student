import { XP_PER_COMPLETION, STREAK_BONUS } from "./constants";
import type { User } from "./types";

function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function calculateCompletionReward(
  user: User,
  baseXp: number = XP_PER_COMPLETION
): {
  xpEarned: number;
  newStreak: number;
  streakBonus: number;
} {
  const today = todayDateString();
  const yesterday = yesterdayDateString();
  const lastDate = user.last_completion_date;

  let newStreak = 1;
  if (lastDate === today) {
    newStreak = user.streak;
  } else if (lastDate === yesterday) {
    newStreak = user.streak + 1;
  }

  const streakBonus = newStreak > 1 ? STREAK_BONUS : 0;
  const xpEarned = baseXp + streakBonus;

  return { xpEarned, newStreak, streakBonus };
}
