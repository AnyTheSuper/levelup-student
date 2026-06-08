"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import XPBar from "@/components/XPBar";
import AssignmentCard from "@/components/AssignmentCard";
import AddAssignmentForm, { type AssignmentFormData } from "@/components/AddAssignmentForm";
import CompletionCelebration from "@/components/CompletionCelebration";
import RankUpCelebration from "@/components/RankUpCelebration";
import TutorialOverlay from "@/components/TutorialOverlay";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import { didTierLabelChange, getRankForXp, type Rank } from "@/lib/ranks";
import type { Assignment, LeaderboardEntry, User } from "@/lib/types";

type Tab = "homework" | "leaderboard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState<Tab>("homework");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [celebration, setCelebration] = useState<{ xpEarned: number; streakBonus: number } | null>(null);
  const [rankUp, setRankUp] = useState<Rank | null>(null);
  const [pendingRankUp, setPendingRankUp] = useState<Rank | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const loadData = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user) {
      router.push("/onboarding");
      return;
    }
    setUser(meData.user);
    if (!meData.user.tutorial_seen) {
      setShowTutorial(true);
    }

    const [assignRes, leaderRes] = await Promise.all([
      fetch("/api/assignments"),
      fetch("/api/leaderboard"),
    ]);
    const assignData = await assignRes.json();
    const leaderData = await leaderRes.json();
    setAssignments(assignData.assignments ?? []);
    setLeaderboard(leaderData.entries ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function dismissTutorial() {
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutorial_seen: true }),
    });
    setShowTutorial(false);
  }

  async function handleAdd(data: AssignmentFormData) {
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    setShowForm(false);
    await loadData();
  }

  async function handleEdit(data: AssignmentFormData) {
    if (!editing) return;
    const res = await fetch(`/api/assignments/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    setEditing(null);
    await loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this homework for everyone?")) return;
    await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    await loadData();
  }

  async function handleComplete(id: string) {
    const oldXp = user?.xp ?? 0;
    const res = await fetch(`/api/assignments/${id}/complete`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      const newXp = data.user.xp;
      if (didTierLabelChange(oldXp, newXp)) {
        setPendingRankUp(getRankForXp(newXp));
      }
      setUser(data.user);
      setCelebration({ xpEarned: data.xpEarned, streakBonus: data.streakBonus });
      await loadData();
    }
  }

  function handleCelebrationDone() {
    setCelebration(null);
    if (pendingRankUp) {
      setRankUp(pendingRankUp);
      setPendingRankUp(null);
    }
  }

  async function handleUncomplete(id: string) {
    const res = await fetch(`/api/assignments/${id}/complete`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok && data.user) {
      setUser(data.user);
    }
    await loadData();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-50">
        <p className="text-xl font-bold text-indigo-600 animate-pulse">Loading...</p>
      </div>
    );
  }

  const pending = assignments.filter((a) => !a.completed);
  const completed = assignments.filter((a) => a.completed);
  const isOwner = !!user?.is_owner;

  return (
    <>
      {showTutorial && user && (
        <TutorialOverlay isOwner={!!user.is_owner} onComplete={dismissTutorial} />
      )}
      {celebration && (
        <CompletionCelebration
          xpEarned={celebration.xpEarned}
          streakBonus={celebration.streakBonus}
          onDone={handleCelebrationDone}
        />
      )}
      {rankUp && (
        <RankUpCelebration rank={rankUp} onDone={() => setRankUp(null)} />
      )}

      <AppShell
        subtitle={user ? `Hey ${user.avatar} ${user.username}!` : undefined}
        headerContent={
          isOwner ? (
            <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900">
              Owner ⭐
            </span>
          ) : undefined
        }
      >
        <div className="space-y-4">
          {user && <XPBar xp={user.xp} streak={user.streak} />}

          <div className="flex gap-2 rounded-2xl bg-white p-1 shadow-md border-2 border-indigo-100">
            <button
              onClick={() => setTab("homework")}
              className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                tab === "homework"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              📋 Homework
            </button>
            <button
              onClick={() => setTab("leaderboard")}
              className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                tab === "leaderboard"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              🏆 Leaderboard
            </button>
          </div>

          {tab === "leaderboard" ? (
            <LeaderboardPanel entries={leaderboard} />
          ) : (
            <>
              {isOwner && !showForm && !editing && (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full rounded-2xl bg-green-500 py-4 text-lg font-bold text-white shadow-lg hover:bg-green-600 transition-colors"
                >
                  ➕ Add Homework
                </button>
              )}

              {(showForm || editing) && (
                <AddAssignmentForm
                  initial={editing ?? undefined}
                  onSubmit={editing ? handleEdit : handleAdd}
                  onCancel={() => { setShowForm(false); setEditing(null); }}
                />
              )}

              <section>
                <h2 className="mb-3 text-lg font-bold text-indigo-700">
                  To Do ({pending.length})
                </h2>
                {pending.length === 0 ? (
                  <div className="rounded-2xl bg-white p-6 text-center shadow-md border-2 border-dashed border-indigo-200">
                    <p className="text-4xl mb-2">🎉</p>
                    <p className="font-bold text-gray-600">All caught up!</p>
                    <p className="text-sm text-gray-400">No homework pending</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pending.map((a) => (
                      <AssignmentCard
                        key={a.id}
                        assignment={a}
                        isOwner={isOwner}
                        onComplete={handleComplete}
                        onUncomplete={handleUncomplete}
                        onEdit={setEditing}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </section>

              {completed.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-bold text-green-700">
                    Done ({completed.length})
                  </h2>
                  <div className="space-y-3">
                    {completed.map((a) => (
                      <AssignmentCard
                        key={a.id}
                        assignment={a}
                        isOwner={isOwner}
                        onComplete={handleComplete}
                        onUncomplete={handleUncomplete}
                        onEdit={setEditing}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>
              )}

              {!isOwner && (
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
                  <p className="font-bold text-amber-800">Want to add homework?</p>
                  <p className="mt-1 text-sm text-amber-700">
                    Only group owners can create tasks. Go to Profile → Switch Profile and pick the owner account ⭐
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </AppShell>
    </>
  );
}
