# LevelUp! — Homework Gamification MVP

A fun homework tracker for 5th graders with shared group lists, XP rewards, streaks, and a friend leaderboard.

## Features

- **Shared homework list** — Group owners add/edit assignments; all members see the same list
- **Personal completion** — Each student checks off their own work (no duplicate entries)
- **XP & streaks** — Earn 10 XP per task + streak bonus for consecutive days
- **Leaderboard** — Friendly competition within your group
- **Avatars & usernames** — Kid-friendly profiles, no personal info required
- **Join by group name** — Students pick their classroom group (e.g. "Classroom 5D") from a simple list
- **Tutorial overlay** — First-time walkthrough for owners and members

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### First user flow

1. Create a username and pick an avatar
2. **Start a Group** — name it something clear like "Classroom 5D" (you become the owner)
3. Add homework from the dashboard

### Friend flow

1. Create username + avatar
2. **Join a Group** — tap your classroom from the list
3. See shared homework, mark complete, earn XP!

## Tech Stack

- Next.js 16 (App Router)
- **Supabase** (PostgreSQL) when configured — recommended for deployment
- **SQLite** (better-sqlite3) — local fallback at `data/homework.db`
- Tailwind CSS 4
- Cookie-based sessions (no passwords for MVP)

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run the schema from [`supabase/schema.sql`](supabase/schema.sql)
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API — keep secret!)
4. Restart the dev server

When Supabase env vars are set, the app uses Supabase automatically. Without them, it falls back to local SQLite.

## Project Structure

```
src/
  app/              # Pages and API routes
  components/       # UI components
  lib/
    store/          # Data layer (Supabase + SQLite)
    supabase/       # Supabase client
supabase/
  schema.sql        # PostgreSQL schema
```

## Data Model

- **groups** — name (e.g. "Classroom 5D")
- **users** — username, avatar, XP, streak, owner flag, group membership
- **assignments** — shared per group (subject, description, due date)
- **completions** — per-user check-offs (unique per assignment + user)

## Privacy

- No last names, emails, or personal info
- Groups are small and private (students pick by name at sign-up)
- Optional anonymous leaderboard mode
