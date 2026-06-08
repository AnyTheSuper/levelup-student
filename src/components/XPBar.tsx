"use client";

import { STREAK_BONUS } from "@/lib/constants";
import { getRankProgress, getTierLabel } from "@/lib/ranks";

interface XPBarProps {
  xp: number;
  streak: number;
}

export default function XPBar({ xp, streak }: XPBarProps) {
  const { current, next, percent, xpIntoRank, xpNeeded } = getRankProgress(xp);
  const tierLabel = getTierLabel(current.name);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md border-2 border-indigo-100">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-3xl shrink-0">{current.icon}</span>
          <div className="min-w-0">
            <p className="font-extrabold text-indigo-800 leading-tight">{tierLabel}</p>
            <p className="text-sm font-semibold text-indigo-500">{current.name}</p>
          </div>
          {streak > 0 && (
            <span className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-600">
              🔥 {streak}
            </span>
          )}
        </div>
        <span className="shrink-0 text-lg font-bold text-indigo-600">{xp} XP</span>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-indigo-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-1 text-xs text-gray-500">
        {next
          ? `${xpIntoRank} / ${xpNeeded} XP to ${next.name} ${next.icon}`
          : "Max rank reached — you're a Homework Hero! 🏆"}
        {streak > 0 && ` · streak bonus +${STREAK_BONUS} XP`}
      </p>
    </div>
  );
}
