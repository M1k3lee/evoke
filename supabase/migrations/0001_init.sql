-- EVOKE :: initial schema
--
-- run this ONCE in your Supabase project's SQL Editor.
--   1. https://supabase.com/dashboard/project/<your-id>/sql/new
--   2. paste this whole file
--   3. hit Run
--
-- it creates the profiles + souls + soul_votes tables, RLS policies
-- (so private souls actually stay private even if app code has a bug),
-- triggers to keep upvote counts denormalized, and a trigger that
-- updates `updated_at` on every soul edit.

------------------------------------------------------------------------
-- profiles
------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null
                  check (
                    char_length(username) between 3 and 30
                    and username ~ '^[a-z0-9_-]+$'
                  ),
  display_name  text,
  bio           text check (char_length(bio) <= 280),
  created_at    timestamptz not null default now()
);

------------------------------------------------------------------------
-- souls
------------------------------------------------------------------------
create table if not exists public.souls (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  designation   text not null,
  branch        text not null check (branch in ('BUILD','BOND','BYPASS','BREACH')),
  state_json    jsonb not null,
  soul_md       text not null,
  visibility    text not null default 'private' check (visibility in ('private','public')),
  upvote_count  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists souls_user_id_idx       on public.souls(user_id);
create index if not exists souls_visibility_idx    on public.souls(visibility);
create index if not exists souls_created_at_idx    on public.souls(created_at desc);
create index if not exists souls_upvotes_idx       on public.souls(upvote_count desc);

------------------------------------------------------------------------
-- soul_votes
------------------------------------------------------------------------
create table if not exists public.soul_votes (
  soul_id     uuid not null references public.souls(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (soul_id, user_id)
);

create index if not exists soul_votes_user_id_idx on public.soul_votes(user_id);

------------------------------------------------------------------------
-- updated_at trigger
------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists souls_set_updated_at on public.souls;
create trigger souls_set_updated_at
  before update on public.souls
  for each row execute function public.set_updated_at();

------------------------------------------------------------------------
-- vote count trigger (denormalized so we can sort by it cheaply)
------------------------------------------------------------------------
create or replace function public.handle_vote()
returns trigger language plpgsql security definer as $$
begin
  if (tg_op = 'INSERT') then
    update public.souls set upvote_count = upvote_count + 1 where id = new.soul_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.souls set upvote_count = greatest(upvote_count - 1, 0) where id = old.soul_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists soul_votes_count on public.soul_votes;
create trigger soul_votes_count
  after insert or delete on public.soul_votes
  for each row execute function public.handle_vote();

------------------------------------------------------------------------
-- RLS — without this, the whole point of having auth disappears
------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.souls       enable row level security;
alter table public.soul_votes  enable row level security;

-- profiles: everyone can read (so public souls can show "by @username"),
-- only the owner can insert/update their own row.
drop policy if exists profiles_read_all     on public.profiles;
drop policy if exists profiles_insert_self  on public.profiles;
drop policy if exists profiles_update_self  on public.profiles;
create policy profiles_read_all    on public.profiles for select using (true);
create policy profiles_insert_self on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update_self on public.profiles for update using (auth.uid() = id);

-- souls: owner sees all of their own. anyone (incl. anon) sees public.
-- owner manages writes. nobody can update or delete other people's stuff.
drop policy if exists souls_read_own     on public.souls;
drop policy if exists souls_read_public  on public.souls;
drop policy if exists souls_insert_own   on public.souls;
drop policy if exists souls_update_own   on public.souls;
drop policy if exists souls_delete_own   on public.souls;
create policy souls_read_own    on public.souls for select using (auth.uid() = user_id);
create policy souls_read_public on public.souls for select using (visibility = 'public');
create policy souls_insert_own  on public.souls for insert with check (auth.uid() = user_id);
create policy souls_update_own  on public.souls for update using (auth.uid() = user_id);
create policy souls_delete_own  on public.souls for delete using (auth.uid() = user_id);

-- votes: anyone signed in can read counts. user can only insert/delete
-- their OWN vote row.
drop policy if exists votes_read_all      on public.soul_votes;
drop policy if exists votes_insert_self   on public.soul_votes;
drop policy if exists votes_delete_self   on public.soul_votes;
create policy votes_read_all    on public.soul_votes for select using (true);
create policy votes_insert_self on public.soul_votes for insert with check (auth.uid() = user_id);
create policy votes_delete_self on public.soul_votes for delete using (auth.uid() = user_id);
