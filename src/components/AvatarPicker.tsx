"use client";

import { AVATARS } from "@/lib/constants";

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
      {AVATARS.map((avatar) => (
        <button
          key={avatar}
          type="button"
          onClick={() => onSelect(avatar)}
          className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-all ${
            selected === avatar
              ? "scale-110 bg-indigo-200 ring-4 ring-indigo-500 shadow-lg"
              : "bg-white hover:bg-indigo-50 hover:scale-105 shadow"
          }`}
          aria-label={`Select avatar ${avatar}`}
        >
          {avatar}
        </button>
      ))}
    </div>
  );
}
