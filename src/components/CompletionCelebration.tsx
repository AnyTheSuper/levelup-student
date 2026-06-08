"use client";

import { useCelebrationDismiss } from "@/hooks/useCelebrationDismiss";

interface CompletionCelebrationProps {
  xpEarned: number;
  streakBonus: number;
  onDone: () => void;
}

export default function CompletionCelebration({
  xpEarned,
  streakBonus,
  onDone,
}: CompletionCelebrationProps) {
  useCelebrationDismiss(onDone, 2000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer">
      <div className="celebrate-pop rounded-3xl bg-white p-8 text-center shadow-2xl border-4 border-yellow-300">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-3xl font-extrabold text-indigo-700">Nice work!</h2>
        <p className="mt-2 text-2xl font-bold text-green-600">+{xpEarned} XP</p>
        {streakBonus > 0 && (
          <p className="mt-1 text-lg font-semibold text-orange-500">
            🔥 Streak bonus +{streakBonus}!
          </p>
        )}
        <p className="mt-4 text-xs text-gray-400">Press any key or tap to continue</p>
      </div>
    </div>
  );
}
