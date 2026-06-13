-- Run this in the Supabase SQL Editor to set up the project.

-- Participants table (extends auth.users with a public profile)
create table participants (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  created_at timestamptz default now()
);

-- Daily entries
create table daily_entries (
  id uuid default gen_random_uuid() primary key,
  participant_id uuid references participants(id) on delete cascade not null,
  date date not null,
  category text, -- 'gym', 'padel', 'running', etc.
  status text not null default 'done', -- 'done', 'cheat', 'sick', 'missed'
  photo_url text,
  notes text,
  created_at timestamptz default now(),
  unique (participant_id, date) -- one entry per person per day
);

-- Enable RLS
alter table participants enable row level security;
alter table daily_entries enable row level security;

-- Participants policies
create policy "Participants are viewable by everyone"
  on participants for select
  using (true);

create policy "Users can insert their own profile"
  on participants for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on participants for update
  using (auth.uid() = id);

-- Daily entries policies
create policy "Entries are viewable by everyone"
  on daily_entries for select
  using (true);

create policy "Users can insert their own entries"
  on daily_entries for insert
  with check (auth.uid() = participant_id);

create policy "Users can update their own entries"
  on daily_entries for update
  using (auth.uid() = participant_id);

create policy "Users can delete their own entries"
  on daily_entries for delete
  using (auth.uid() = participant_id);

-- Auto-create participant profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.participants (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage: create a public bucket named "daily-photos" via the dashboard
-- (Storage -> New bucket -> public)
