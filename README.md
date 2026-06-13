# RupiFit

A simple habit tracker for a small group (up to ~20 people) doing daily sports,
with cheat days and sick days, photo uploads, and sport categories.

## Stack

- **Frontend**: React + Vite + TypeScript + TanStack Query
- **Backend**: Supabase (Postgres, Auth, Storage)

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the contents of `supabase/schema.sql`.
3. In Storage, create a new **public** bucket named `daily-photos`.
4. Copy `.env.example` to `.env` and fill in your project's URL and anon key
   (found under Settings -> API).
5. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

## Project structure

```
src/
├── lib/
│   ├── supabaseClient.ts   # Supabase client setup
│   └── types.ts            # shared TS types for DB rows
├── hooks/                   # data-fetching hooks (React Query + Supabase)
├── components/              # reusable UI pieces (e.g. CalendarGrid)
├── pages/                    # top-level views (Login, Dashboard)
├── App.tsx                   # routes between Login/Dashboard based on auth
└── main.tsx                  # entry point, sets up QueryClientProvider

supabase/
└── schema.sql              # database schema, kept in sync manually with the
                             # Supabase project (run in SQL Editor)
```

## Data model

- **participants**: public profile table, one row per user (auto-created on
  signup via a trigger), linked to `auth.users`.
- **daily_entries**: one row per participant per day, with:
  - `category` -- e.g. `gym`, `padel`, `running`
  - `status` -- `done`, `cheat`, `sick`, or `missed`
  - `photo_url` -- optional photo for the day
  - `notes` -- optional free text

Row Level Security ensures everyone can view all entries (for a shared
overview), but each user can only insert/update/delete their own.

## Status

Early scaffold -- login + a basic monthly calendar grid are wired up.
Still to build: entry form/modal for logging a day (category, status, photo
upload), per-participant monthly views, and an overview of all participants.
