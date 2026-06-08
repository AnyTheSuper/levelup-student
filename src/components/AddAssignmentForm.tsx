"use client";

import { useState } from "react";
import { SUBJECTS, XP_PER_COMPLETION, MIN_XP_REWARD, MAX_XP_REWARD } from "@/lib/constants";
import type { Assignment } from "@/lib/types";

export interface AssignmentFormData {
  subject: string;
  description: string;
  due_date: string;
  xp_reward: number;
}

interface AddAssignmentFormProps {
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  onCancel: () => void;
  initial?: Assignment;
}

export default function AddAssignmentForm({ onSubmit, onCancel, initial }: AddAssignmentFormProps) {
  const [subject, setSubject] = useState(initial?.subject ?? SUBJECTS[0]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dueDate, setDueDate] = useState(
    initial?.due_date ?? new Date().toISOString().split("T")[0]
  );
  const [xpReward, setXpReward] = useState(initial?.xp_reward ?? XP_PER_COMPLETION);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    if (!dueDate) {
      setError("Due date is required");
      return;
    }
    if (xpReward < MIN_XP_REWARD || xpReward > MAX_XP_REWARD) {
      setError(`XP must be between ${MIN_XP_REWARD} and ${MAX_XP_REWARD}`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        subject,
        description: description.trim(),
        due_date: dueDate,
        xp_reward: xpReward,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-indigo-200 bg-white p-4 shadow-lg">
      <h3 className="mb-3 text-lg font-bold text-indigo-700">
        {initial ? "Edit Homework" : "Add Homework"}
      </h3>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border-2 border-indigo-100 px-3 py-2 text-base focus:border-indigo-400 focus:outline-none"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Worksheet pages 12-15"
            className="w-full rounded-xl border-2 border-indigo-100 px-3 py-2 text-base focus:border-indigo-400 focus:outline-none"
            maxLength={200}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border-2 border-indigo-100 px-3 py-2 text-base focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            XP Reward: <span className="text-indigo-600">{xpReward} XP</span>
          </label>
          <p className="mb-2 text-xs text-gray-500">
            How many points students earn when they finish this homework
          </p>
          <input
            type="range"
            min={MIN_XP_REWARD}
            max={MAX_XP_REWARD}
            step={1}
            value={xpReward}
            onChange={(e) => setXpReward(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>{MIN_XP_REWARD} XP</span>
            <span>{MAX_XP_REWARD} XP</span>
          </div>
          <input
            type="number"
            min={MIN_XP_REWARD}
            max={MAX_XP_REWARD}
            value={xpReward}
            onChange={(e) => setXpReward(Number(e.target.value))}
            className="mt-2 w-24 rounded-xl border-2 border-indigo-100 px-3 py-2 text-base focus:border-indigo-400 focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : initial ? "Save Changes" : "Add Homework"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border-2 border-gray-200 px-4 py-3 font-bold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
