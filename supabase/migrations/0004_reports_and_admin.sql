-- EVOKE :: soul reports + moderation fields
--
-- run this in Supabase SQL Editor after 0003_scrub_conversations.sql

------------------------------------------------------------------------
-- soul_reports: user-submitted flags
------------------------------------------------------------------------
create table if not exists public.soul_reports (
  id            uuid primary key default gen_random_uuid(),
  soul_id       uuid not null references public.souls(id) on delete cascade,
  reporter_id   uuid not null references public.profiles(id) on delete cascade,
  reason        text not null check (reason in (
    'illegal_content','child_safety','hate_speech',
    'harassment','graphic_violence','spam_scam','impersonation','other'
  )),
  details       text check (char_length(details) <= 500),
  created_at    timestamptz not null default now(),
  unique(soul_id, reporter_id)
);

create index if not exists soul_reports_soul_id_idx    on public.soul_reports(soul_id);
create index if not exists soul_reports_created_at_idx on public.soul_reports(created_at desc);

------------------------------------------------------------------------
-- add moderation columns to souls
------------------------------------------------------------------------
alter table public.souls
  add column if not exists flag_count         integer not null default 0,
  add column if not exists moderation_status  text
    check (moderation_status in ('cleared', 'removed'));

create index if not exists souls_flag_count_idx on public.souls(flag_count desc);

------------------------------------------------------------------------
-- trigger: keep flag_count denormalized (mirrors vote count pattern)
------------------------------------------------------------------------
create or replace function public.handle_report()
returns trigger language plpgsql security definer as $$
begin
  if (tg_op = 'INSERT') then
    update public.souls set flag_count = flag_count + 1 where id = new.soul_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.souls
      set flag_count = greatest(flag_count - 1, 0)
      where id = old.soul_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists soul_reports_count on public.soul_reports;
create trigger soul_reports_count
  after insert or delete on public.soul_reports
  for each row execute function public.handle_report();

------------------------------------------------------------------------
-- RLS for soul_reports
------------------------------------------------------------------------
alter table public.soul_reports enable row level security;

-- reporter can read their own report
drop policy if exists reports_read_own    on public.soul_reports;
create policy reports_read_own on public.soul_reports
  for select using (auth.uid() = reporter_id);

-- any signed-in user can file a report (one per soul enforced by unique)
drop policy if exists reports_insert_self on public.soul_reports;
create policy reports_insert_self on public.soul_reports
  for insert with check (auth.uid() = reporter_id);

-- reporters can withdraw their own report
drop policy if exists reports_delete_own  on public.soul_reports;
create policy reports_delete_own on public.soul_reports
  for delete using (auth.uid() = reporter_id);
