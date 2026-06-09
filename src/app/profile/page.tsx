"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import XPBar from "@/components/XPBar";
import type { User, Group } from "@/lib/types";

interface Member {
  id: string;
  username: string;
  avatar: string;
  xp: number;
  is_owner: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const res = await fetch("/api/profile");
    if (res.status === 401) {
      router.push("/onboarding");
      return;
    }
    const data = await res.json();
    setUser(data.user);
    setGroup(data.group);
    setMembers(data.members ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function togglePrivacy() {
    if (!user) return;
    const newVal = !user.leaderboard_private;
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaderboard_private: newVal }),
    });
    const data = await res.json();
    setUser(data.user);
  }

  if (loading || !user || !group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-50">
        <p className="text-xl font-bold text-indigo-600 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <AppShell
      subtitle={`Signed in as ${user.username}`}
      headerContent={
        user.is_owner ? (
          <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900">
            Owner ⭐
          </span>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-4 text-center shadow-md border-2 border-purple-100">
          <span className="text-6xl">{user.avatar}</span>
          <p className="mt-2 text-xl font-extrabold text-gray-800">{user.username}</p>
          {user.is_owner ? (
            <span className="mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800">
              Group Owner — you can add homework ⭐
            </span>
          ) : (
            <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
              Member — you can complete homework and earn XP
            </span>
          )}
        </div>

        <XPBar xp={user.xp} streak={user.streak} />

        <div className="rounded-2xl bg-white p-4 shadow-md border-2 border-purple-100">
          <h2 className="mb-2 font-bold text-purple-700">Your Group</h2>
          <div className="flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-3">
            <span className="text-4xl">🏫</span>
            <div>
              <p className="text-xl font-bold text-gray-800">{group.name}</p>
              <p className="text-sm text-gray-500">
                {members.length} {members.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            New friends can join by picking this group when they sign up.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-md border-2 border-purple-100">
          <h2 className="mb-3 font-bold text-purple-700">
            Group Members ({members.length})
          </h2>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl bg-purple-50 px-3 py-2">
                <span className="text-2xl">{m.avatar}</span>
                <span className="flex-1 font-semibold text-gray-800">{m.username}</span>
                {m.is_owner ? (
                  <span className="text-xs font-bold text-yellow-600">Owner</span>
                ) : null}
                <span className="text-sm font-bold text-purple-600">{m.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-md border-2 border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-purple-700">Private Leaderboard</h2>
              <p className="text-sm text-gray-500">Hide your name from the leaderboard</p>
            </div>
            <button
              onClick={togglePrivacy}
              className={`relative h-8 w-14 rounded-full transition-colors ${
                user.leaderboard_private ? "bg-purple-600" : "bg-gray-300"
              }`}
              aria-label="Toggle leaderboard privacy"
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  user.leaderboard_private ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
