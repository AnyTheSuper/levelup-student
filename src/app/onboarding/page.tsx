"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvatarPicker from "@/components/AvatarPicker";
import { AVATARS } from "@/lib/constants";
import type { GroupListItem } from "@/lib/types";

type Step = "username" | "avatar" | "group";
type Mode = "new" | "returning";

interface ExistingProfile {
  id: string;
  username: string;
  avatar: string;
  is_owner: number;
  group_name: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("new");
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  const [groupAction, setGroupAction] = useState<"create" | "join">("join");
  const [groupName, setGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [availableGroups, setAvailableGroups] = useState<GroupListItem[]>([]);
  const [existingProfiles, setExistingProfiles] = useState<ExistingProfile[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode !== "returning") return;

    setLoadingProfiles(true);
    setError("");
    fetch("/api/auth/profiles")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load profiles");
        setExistingProfiles(data.profiles ?? []);
      })
      .catch(() => setError("Couldn't load profiles. Try again!"))
      .finally(() => setLoadingProfiles(false));
  }, [mode]);

  useEffect(() => {
    if (mode !== "new" || step !== "group" || groupAction !== "join") return;

    setLoadingGroups(true);
    setError("");
    fetch("/api/groups")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load groups");
        setAvailableGroups(data.groups ?? []);
      })
      .catch(() => setError("Couldn't load groups. Try again!"))
      .finally(() => setLoadingGroups(false));
  }, [mode, step, groupAction]);

  function nextFromUsername() {
    const trimmed = username.trim().toLowerCase();
    if (trimmed.length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      setError("Only letters, numbers, and underscores");
      return;
    }
    setError("");
    setStep("avatar");
  }

  function canSubmit() {
    if (groupAction === "create") return groupName.trim().length >= 2;
    return !!selectedGroupId;
  }

  async function handleSubmit() {
    setError("");

    if (!canSubmit()) {
      setError(groupAction === "create" ? "Enter a group name" : "Pick your group");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          avatar,
          action: groupAction,
          groupName: groupAction === "create" ? groupName.trim() : undefined,
          groupId: groupAction === "join" ? selectedGroupId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(profile: ExistingProfile) {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: profile.username }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not sign in");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-300 px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
            LevelUp! 📚
          </h1>
          <p className="mt-2 text-lg font-semibold text-indigo-100">
            Homework that feels like a game
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => { setMode("returning"); setError(""); }}
            className={`flex-1 rounded-2xl py-3 font-bold transition-all ${
              mode === "returning"
                ? "bg-white text-indigo-700 shadow-lg"
                : "bg-white/30 text-white hover:bg-white/40"
            }`}
          >
            Pick My Profile
          </button>
          <button
            onClick={() => { setMode("new"); setError(""); setStep("username"); }}
            className={`flex-1 rounded-2xl py-3 font-bold transition-all ${
              mode === "new"
                ? "bg-white text-indigo-700 shadow-lg"
                : "bg-white/30 text-white hover:bg-white/40"
            }`}
          >
            New Profile
          </button>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-2xl">
          {mode === "returning" ? (
            <>
              <h2 className="mb-2 text-xl font-bold text-indigo-700">Who are you?</h2>
              <p className="mb-4 text-sm text-gray-500">
                Tap your profile to sign in. Owners can add homework ⭐
              </p>

              {loadingProfiles ? (
                <p className="text-center text-indigo-600 font-semibold animate-pulse">
                  Loading profiles...
                </p>
              ) : existingProfiles.length === 0 ? (
                <div className="rounded-2xl bg-indigo-50 p-4 text-center">
                  <p className="font-semibold text-gray-600">No profiles yet!</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Tap &quot;New Profile&quot; above to create one.
                  </p>
                </div>
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {existingProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleLogin(profile)}
                      disabled={loading}
                      className="flex w-full items-center gap-3 rounded-2xl border-2 border-indigo-100 p-4 text-left transition-all hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-50"
                    >
                      <span className="text-3xl">{profile.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-gray-800">{profile.username}</p>
                        <p className="text-sm text-gray-500 truncate">{profile.group_name}</p>
                      </div>
                      {profile.is_owner ? (
                        <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800">
                          Owner ⭐
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}

              {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
            </>
          ) : (
            <>
              <div className="mb-6 flex justify-center gap-2">
                {(["username", "avatar", "group"] as Step[]).map((s, i) => (
                  <div
                    key={s}
                    className={`h-3 w-3 rounded-full ${
                      step === s
                        ? "bg-indigo-600 scale-125"
                        : i < ["username", "avatar", "group"].indexOf(step)
                          ? "bg-indigo-400"
                          : "bg-indigo-200"
                    }`}
                  />
                ))}
              </div>

              {step === "username" && (
                <>
                  <h2 className="mb-4 text-xl font-bold text-indigo-700">Pick a username</h2>
                  <p className="mb-3 text-sm text-gray-500">No last names — just something fun!</p>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. star_reader"
                    className="mb-4 w-full rounded-2xl border-2 border-indigo-100 px-4 py-3 text-lg focus:border-indigo-400 focus:outline-none"
                    maxLength={20}
                    autoFocus
                  />
                  {error && <p className="mb-3 text-sm font-semibold text-red-600">{error}</p>}
                  <button
                    onClick={nextFromUsername}
                    className="w-full rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white hover:bg-indigo-700"
                  >
                    Next →
                  </button>
                </>
              )}

              {step === "avatar" && (
                <>
                  <h2 className="mb-4 text-xl font-bold text-indigo-700">Choose your avatar</h2>
                  <AvatarPicker selected={avatar} onSelect={setAvatar} />
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => setStep("username")}
                      className="rounded-2xl border-2 border-gray-200 px-6 py-4 font-bold text-gray-600"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep("group")}
                      className="flex-1 rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white hover:bg-indigo-700"
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}

              {step === "group" && (
                <>
                  <h2 className="mb-4 text-xl font-bold text-indigo-700">Find your group</h2>

                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={() => { setGroupAction("join"); setError(""); }}
                      className={`flex-1 rounded-2xl py-3 font-bold transition-all ${
                        groupAction === "join"
                          ? "bg-indigo-600 text-white"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      Join a Group
                    </button>
                    <button
                      onClick={() => { setGroupAction("create"); setError(""); }}
                      className={`flex-1 rounded-2xl py-3 font-bold transition-all ${
                        groupAction === "create"
                          ? "bg-indigo-600 text-white"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      Start a Group
                    </button>
                  </div>

                  {groupAction === "join" ? (
                    <>
                      <p className="mb-3 text-sm text-gray-500">
                        Tap the group that matches your classroom!
                      </p>

                      {loadingGroups ? (
                        <p className="mb-4 text-center text-indigo-600 font-semibold animate-pulse">
                          Loading groups...
                        </p>
                      ) : availableGroups.length === 0 ? (
                        <div className="mb-4 rounded-2xl bg-indigo-50 p-4 text-center">
                          <p className="font-semibold text-gray-600">No groups yet!</p>
                          <p className="mt-1 text-sm text-gray-500">
                            Ask your group owner to start one, or tap &quot;Start a Group&quot; above.
                          </p>
                        </div>
                      ) : (
                        <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
                          {availableGroups.map((group) => (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() => setSelectedGroupId(group.id)}
                              className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                                selectedGroupId === group.id
                                  ? "border-indigo-500 bg-indigo-50 scale-[1.02] shadow-md"
                                  : "border-indigo-100 bg-white hover:border-indigo-300"
                              }`}
                            >
                              <span className="text-3xl">🏫</span>
                              <div className="flex-1">
                                <p className="text-lg font-bold text-gray-800">{group.name}</p>
                                <p className="text-sm text-gray-500">
                                  {group.member_count} {group.member_count === 1 ? "friend" : "friends"} in this group
                                </p>
                              </div>
                              {selectedGroupId === group.id && (
                                <span className="text-2xl text-indigo-600">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mb-3 text-sm text-gray-500">
                        You&apos;ll be the owner and add homework for everyone in the group.
                      </p>
                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g. Classroom 5D"
                        className="mb-4 w-full rounded-2xl border-2 border-indigo-100 px-4 py-3 text-lg focus:border-indigo-400 focus:outline-none"
                        maxLength={40}
                      />
                    </>
                  )}

                  {error && <p className="mb-3 text-sm font-semibold text-red-600">{error}</p>}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep("avatar")}
                      className="rounded-2xl border-2 border-gray-200 px-6 py-4 font-bold text-gray-600"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !canSubmit()}
                      className="flex-1 rounded-2xl bg-green-500 py-4 text-lg font-bold text-white hover:bg-green-600 disabled:opacity-50"
                    >
                      {loading ? "Setting up..." : "Let's Go! 🚀"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
