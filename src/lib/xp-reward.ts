import { XP_PER_COMPLETION, MIN_XP_REWARD, MAX_XP_REWARD } from "./constants";

export function parseXpReward(value: unknown): number | null {
  const xp =
    typeof value === "number"
      ? value
      : parseInt(String(value ?? XP_PER_COMPLETION), 10);

  if (Number.isNaN(xp) || xp < MIN_XP_REWARD || xp > MAX_XP_REWARD) {
    return null;
  }

  return xp;
}
