"use client";

import Navigation from "./Navigation";

interface AppShellProps {
  children: React.ReactNode;
  subtitle?: string;
  headerContent?: React.ReactNode;
}

export default function AppShell({ children, subtitle, headerContent }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 pb-8">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-lg font-extrabold">LevelUp! 📚</p>
              {subtitle && <p className="text-sm text-indigo-100">{subtitle}</p>}
            </div>
            {headerContent}
          </div>

          <Navigation />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">{children}</main>
    </div>
  );
}
