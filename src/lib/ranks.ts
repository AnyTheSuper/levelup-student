export interface Rank {
  name: string;
  icon: string;
  xp: number;
}

export const RANKS: Rank[] = [
  { name: "Bronze I", icon: "🥉", xp: 0 },
  { name: "Bronze II", icon: "🥉", xp: 100 },
  { name: "Bronze III", icon: "🥉", xp: 250 },
  { name: "Iron I", icon: "⚙️", xp: 450 },
  { name: "Iron II", icon: "⚙️", xp: 700 },
  { name: "Iron III", icon: "⚙️", xp: 1000 },
  { name: "Silver I", icon: "🥈", xp: 1400 },
  { name: "Silver II", icon: "🥈", xp: 1850 },
  { name: "Silver III", icon: "🥈", xp: 2350 },
  { name: "Gold I", icon: "🥇", xp: 2900 },
  { name: "Gold II", icon: "🥇", xp: 3500 },
  { name: "Gold III", icon: "🥇", xp: 4150 },
  { name: "Platinum I", icon: "💠", xp: 4850 },
  { name: "Platinum II", icon: "💠", xp: 5600 },
  { name: "Platinum III", icon: "💠", xp: 6400 },
  { name: "Emerald I", icon: "💚", xp: 7250 },
  { name: "Emerald II", icon: "💚", xp: 8150 },
  { name: "Emerald III", icon: "💚", xp: 9100 },
  { name: "Sapphire I", icon: "🔷", xp: 10100 },
  { name: "Sapphire II", icon: "🔷", xp: 11150 },
  { name: "Sapphire III", icon: "🔷", xp: 12250 },
  { name: "Ruby I", icon: "♦️", xp: 13400 },
  { name: "Ruby II", icon: "♦️", xp: 14600 },
  { name: "Ruby III", icon: "♦️", xp: 15850 },
  { name: "Diamond I", icon: "💎", xp: 17150 },
  { name: "Diamond II", icon: "💎", xp: 18500 },
  { name: "Diamond III", icon: "💎", xp: 19900 },
  { name: "Master I", icon: "🎖️", xp: 21350 },
  { name: "Master II", icon: "🎖️", xp: 22850 },
  { name: "Master III", icon: "🎖️", xp: 24400 },
  { name: "Champion I", icon: "🏅", xp: 26000 },
  { name: "Champion II", icon: "🏅", xp: 27650 },
  { name: "Champion III", icon: "🏅", xp: 29350 },
  { name: "Legend I", icon: "👑", xp: 31100 },
  { name: "Legend II", icon: "👑", xp: 32900 },
  { name: "Legend III", icon: "👑", xp: 34750 },
  { name: "Homework Hero", icon: "🏆", xp: 37000 },
];

export const TIER_LABELS: Record<string, string> = {
  Bronze: "New Learner",
  Iron: "Practice Pro",
  Silver: "Homework Explorer",
  Gold: "Study Star",
  Platinum: "Super Scholar",
  Emerald: "Knowledge Knight",
  Sapphire: "Brain Power",
  Ruby: "Star Pupil",
  Diamond: "Homework Wizard",
  Master: "Academic Ace",
  Champion: "Class Champion",
  Legend: "School Legend",
  "Homework Hero": "Ultimate Homework Hero",
};

export function getTierBase(rankName: string): string {
  if (rankName === "Homework Hero") return "Homework Hero";
  return rankName.split(" ")[0];
}

export function getTierLabel(rankName: string): string {
  const tier = getTierBase(rankName);
  return TIER_LABELS[tier] ?? tier;
}

export function getRankForXp(xp: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.xp) current = rank;
    else break;
  }
  return current;
}

export function getNextRank(xp: number): Rank | null {
  for (const rank of RANKS) {
    if (xp < rank.xp) return rank;
  }
  return null;
}

export function getRankProgress(xp: number): {
  current: Rank;
  next: Rank | null;
  percent: number;
  xpIntoRank: number;
  xpNeeded: number;
} {
  const current = getRankForXp(xp);
  const next = getNextRank(xp);

  if (!next) {
    return { current, next: null, percent: 100, xpIntoRank: xp - current.xp, xpNeeded: 0 };
  }

  const xpIntoRank = xp - current.xp;
  const xpNeeded = next.xp - current.xp;
  const percent = Math.min(100, Math.round((xpIntoRank / xpNeeded) * 100));

  return { current, next, percent, xpIntoRank, xpNeeded };
}

export function didTierLabelChange(oldXp: number, newXp: number): boolean {
  const oldLabel = getTierLabel(getRankForXp(oldXp).name);
  const newLabel = getTierLabel(getRankForXp(newXp).name);
  return oldLabel !== newLabel;
}
