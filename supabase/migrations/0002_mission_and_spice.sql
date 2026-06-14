-- EVOKE :: 0002 — mission, spice, and mature opt-in.
--
-- run this in Supabase SQL Editor AFTER 0001_init.sql has been applied.
--
-- adds:
--   profiles.mature_content_enabled — user opt-in for spice 3+ souls
--   souls.mission                   — what the soul is FOR (free text)
--   souls.spice_level               — 1..4, see lib/intent.ts SPICE_META
--
-- replaces:
--   souls_read_public RLS policy. now also filters by spice level
--   based on the viewer's opt-in. spice 3 only visible to opted-in
--   signed-in users; spice 4 never publicly readable.

------------------------------------------------------------------------
-- profiles: opt-in for mature content
------------------------------------------------------------------------
alter table public.profiles
  add column if not exists mature_content_enabled boolean not null default false;

------------------------------------------------------------------------
-- souls: mission + spice
------------------------------------------------------------------------
alter table public.souls
  add column if not exists mission text;

alter table public.souls
  add column if not exists spice_level integer not null default 1
  check (spice_level between 1 and 4);

create index if not exists souls_spice_idx on public.souls(spice_level);

------------------------------------------------------------------------
-- RLS — public visibility now respects spice + opt-in
------------------------------------------------------------------------
-- the existing souls_read_public policy lets anyone read any public
-- soul. swap it for one that respects spice gating:
--   spice 1-2: anyone (anon + signed-in) can read public ones
--   spice 3:   only signed-in users with mature_content_enabled = true
--   spice 4:   never publicly readable (DB-enforced; UI also hides)

drop policy if exists souls_read_public on public.souls;

create policy souls_read_public on public.souls for select using (
  visibility = 'public' and (
    -- always-public: spice 1-2
    spice_level <= 2
    or (
      -- spice 3: signed-in + opted-in
      spice_level = 3
      and auth.uid() is not null
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.mature_content_enabled = true
      )
    )
    -- spice 4 deliberately omitted — never publicly readable
  )
);

-- ALSO: prevent users from publishing spice 4 to the public chamber.
-- enforced by a trigger that resets visibility to private if someone
-- tries to set spice_level=4 + visibility=public.
create or replace function public.guard_spice_4_visibility()
returns trigger language plpgsql as $$
begin
  if new.spice_level = 4 and new.visibility = 'public' then
    new.visibility := 'private';
  end if;
  return new;
end;
$$;

drop trigger if exists souls_guard_spice_4 on public.souls;
create trigger souls_guard_spice_4
  before insert or update on public.souls
  for each row execute function public.guard_spice_4_visibility();
