"use client";

import type { Rank } from "@/lib/ranks";
import { getTierLabel } from "@/lib/ranks";
import { useCelebrationDismiss } from "@/hooks/useCelebrationDismiss";

interface RankUpCelebrationProps {
  rank: Rank;
  onDone: () => void;
}

export default function RankUpCelebration({ rank, onDone }: RankUpCelebrationProps) {
  const label = getTierLabel(rank.name);
  useCelebrationDismiss(onDone, 2500);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/70 backdrop-blur-sm p-4 cursor-pointer">
      <div className="rank-up-pop relative overflow-hidden rounded-3xl bg-gradient-to-b from-yellow-50 to-white p-8 text-center shadow-2xl border-4 border-yellow-400 max-w-sm w-full">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rank-up-sparkle text-8xl opacity-20">✨</div>
        </div>

        <p className="text-sm font-bold uppercase tracking-widest text-yellow-600">
          New Title Unlocked!
        </p>
        <div className="my-4 text-7xl animate-bounce">{rank.icon}</div>
        <h2 className="text-3xl font-extrabold text-indigo-800">{label}</h2>
        <p className="mt-2 text-lg font-semibold text-indigo-600">{rank.name}</p>
        <p className="mt-4 text-sm text-gray-500">
          You&apos;re leveling up! Keep crushing that homework! 🚀
        </p>
        <p className="mt-3 text-xs text-gray-400">Press any key or tap to continue</p>
      </div>
    </div>
  );
}
