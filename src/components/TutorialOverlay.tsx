"use client";

interface TutorialOverlayProps {
  isOwner: boolean;
  onComplete: () => void;
}

export default function TutorialOverlay({ isOwner, onComplete }: TutorialOverlayProps) {
  const steps = isOwner
    ? [
        { icon: "👋", title: "Welcome to LevelUp!", text: "You're the group owner — you manage homework for everyone." },
        { icon: "➕", title: "Add Homework", text: "Tap 'Add Homework' to create assignments. Everyone in your group sees them automatically!" },
        { icon: "✅", title: "Mark Done & Earn XP", text: "Complete your own homework to earn XP and build streaks." },
        { icon: "🏆", title: "Compete with Friends", text: "Tap the Leaderboard tab to see how you stack up against your group!" },
      ]
    : [
        { icon: "👋", title: "Welcome to LevelUp!", text: "Your homework list is shared with your friend group." },
        { icon: "📋", title: "Your Homework List", text: "New assignments appear here automatically — no need to add them yourself!" },
        { icon: "✅", title: "Mark Done & Earn XP", text: "Tap the checkbox when you finish. You'll earn XP instantly!" },
        { icon: "🏆", title: "Compete with Friends", text: "Tap the Leaderboard tab to see how you stack up!" },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/80 p-4">
      <div className="max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-center text-2xl font-extrabold text-indigo-700">
          Quick Tour
        </h2>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl bg-indigo-50 p-3">
              <span className="text-3xl">{step.icon}</span>
              <div>
                <p className="font-bold text-indigo-800">{step.title}</p>
                <p className="text-sm text-gray-600">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onComplete}
          className="mt-6 w-full rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white hover:bg-indigo-700 transition-colors"
        >
          Let&apos;s Go! 🚀
        </button>
      </div>
    </div>
  );
}
