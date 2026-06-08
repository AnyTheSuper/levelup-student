"use client";

import { getRankForXp, getTierLabel } from "@/lib/ranks";
import type { LeaderboardEntry } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
}

export default function LeaderboardPanel({ entries }: LeaderboardPanelProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-md border-2 border-yellow-100">
        <p className="text-4xl mb-2">🏆</p>
        <p className="text-gray-500">No scores yet — complete homework to earn XP!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => {
        const rank = getRankForXp(entry.xp);
        const tierLabel = getTierLabel(rank.name);
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 rounded-2xl p-4 shadow-md border-2 ${
              entry.is_me
                ? "border-indigo-400 bg-indigo-50"
                : "border-gray-100 bg-white"
            }`}
          >
            <span className="w-8 text-center text-xl font-bold shrink-0">
              {i < 3 ? MEDALS[i] : `#${i + 1}`}
            </span>
            <span className="text-2xl shrink-0">{entry.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 truncate">
                {entry.username}
                {entry.is_me && (
                  <span className="ml-2 text-xs text-indigo-600">(you)</span>
                )}
              </p>
              <p className="text-sm font-semibold text-indigo-600 truncate">
                {rank.icon} {tierLabel}
              </p>
              <p className="text-xs text-gray-500">
                {entry.completed_count} tasks
                {entry.streak > 0 && ` · 🔥 ${entry.streak}`}
              </p>
            </div>
            <span className="text-lg font-extrabold text-indigo-600 shrink-0">
              {entry.xp}
            </span>
          </div>
        );
      })}
    </div>
  );
}
