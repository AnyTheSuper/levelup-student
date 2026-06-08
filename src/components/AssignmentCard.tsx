"use client";

import { useState } from "react";
import { SUBJECTS } from "@/lib/constants";
import type { Assignment } from "@/lib/types";

interface AssignmentCardProps {
  assignment: Assignment;
  isOwner: boolean;
  onComplete: (id: string) => Promise<void>;
  onUncomplete: (id: string) => Promise<void>;
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string) => Promise<void>;
}

function isOverdue(dueDate: string, completed: boolean) {
  if (completed) return false;
  const today = new Date().toISOString().split("T")[0];
  return dueDate < today;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function AssignmentCard({
  assignment,
  isOwner,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  const [loading, setLoading] = useState(false);
  const completed = !!assignment.completed;
  const overdue = isOverdue(assignment.due_date, completed);

  async function toggleComplete() {
    setLoading(true);
    try {
      if (completed) {
        await onUncomplete(assignment.id);
      } else {
        await onComplete(assignment.id);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all ${
        completed
          ? "border-green-200 bg-green-50 opacity-75"
          : overdue
            ? "border-red-300 bg-red-50"
            : "border-indigo-100 bg-white shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={toggleComplete}
          disabled={loading}
          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 text-xl transition-all ${
            completed
              ? "border-green-500 bg-green-500 text-white"
              : "border-indigo-300 bg-white hover:border-indigo-500 hover:bg-indigo-50"
          }`}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
        >
          {completed ? "✓" : ""}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
              {assignment.subject}
            </span>
            {overdue && (
              <span className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-bold text-red-700">
                Overdue
              </span>
            )}
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              +{assignment.xp_reward ?? 10} XP
            </span>
            <span className="text-xs text-gray-500">Due {formatDate(assignment.due_date)}</span>
          </div>
          <p className={`mt-1 font-semibold ${completed ? "line-through text-gray-500" : "text-gray-800"}`}>
            {assignment.description}
          </p>
        </div>

        {isOwner && (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => onEdit(assignment)}
              className="rounded-lg p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
              aria-label="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(assignment.id)}
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
