-- ============================================================================
-- XP ledger
--
-- profiles.xp was mutated in place, so no history existed: the app could show
-- a total but could never show how a student got there. Two further problems
-- came from the same design — concurrent awards lost updates (read-modify-write
-- from application code), and XP banked in a session that was abandoned before
-- the fifth puzzle never reached the profile at all.
--
-- This adds an append-only event log, an atomic award function, and a backfill
-- from the data already on disk so existing students open the timeline with
-- their real history rather than an empty chart.
-- ============================================================================

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Signed, so a correction can be recorded rather than silently rewritten.
  amount integer not null,
  -- keyof XP ('independentSolution', ...), plus 'referral', 'puzzleSolve',
  -- 'backfill'. Drives the label and icon on the timeline.
  reason_key text not null,
  -- Where it came from: 'item_attempt' | 'session' | 'referral' | 'backfill'.
  source_kind text not null,
  source_id uuid,
  created_at timestamptz not null default now()
);

-- The timeline reads one user newest-first; the daily rollup groups by day.
create index if not exists xp_events_user_time
  on public.xp_events (user_id, created_at desc);

-- One row per source event: makes both the backfill and every award idempotent.
create unique index if not exists xp_events_unique_source
  on public.xp_events (user_id, source_kind, source_id, reason_key)
  where source_id is not null;

alter table public.xp_events enable row level security;

drop policy if exists "xp_events_select_own" on public.xp_events;
create policy "xp_events_select_own" on public.xp_events
  for select using (auth.uid() = user_id);
-- Writes only ever happen through award_xp (security definer) or service role.

-- ---------------------------------------------------------------------------
-- award_xp: log the event and move profiles.xp in one atomic statement.
-- Returns the new profile total. Safe to call concurrently.
-- ---------------------------------------------------------------------------
create or replace function public.award_xp(
  p_user_id uuid,
  p_amount integer,
  p_reason_key text,
  p_source_kind text,
  p_source_id uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
begin
  if p_amount is null or p_amount = 0 then
    select xp into v_total from profiles where id = p_user_id;
    return coalesce(v_total, 0);
  end if;

  -- Idempotent per (user, source, reason): a retried request cannot double-pay.
  if p_source_id is not null then
    insert into xp_events (user_id, amount, reason_key, source_kind, source_id)
    values (p_user_id, p_amount, p_reason_key, p_source_kind, p_source_id)
    -- An item earns XP in stages (solve, then explain-back), so a later award
    -- must accumulate onto the same row rather than be skipped.
    on conflict (user_id, source_kind, source_id, reason_key)
    do update set amount = xp_events.amount + excluded.amount,
                  created_at = greatest(xp_events.created_at, now());
  else
    insert into xp_events (user_id, amount, reason_key, source_kind, source_id)
    values (p_user_id, p_amount, p_reason_key, p_source_kind, null);
  end if;

  update profiles
     set xp = greatest(0, xp + p_amount),
         level = floor(sqrt(greatest(0, xp + p_amount)::numeric / 100))
   where id = p_user_id
  returning xp into v_total;

  return coalesce(v_total, 0);
end;
$$;

revoke all on function public.award_xp(uuid, integer, text, text, uuid) from public;
grant execute on function public.award_xp(uuid, integer, text, text, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Backfill. Every insert is guarded by the unique index, so re-running this
-- migration cannot duplicate history.
-- ---------------------------------------------------------------------------

-- Puzzle sessions: XP was banked per session on sessions.xp_earned.
insert into xp_events (user_id, amount, reason_key, source_kind, source_id, created_at)
select s.user_id,
       s.xp_earned,
       'puzzleSession',
       'session',
       s.id,
       coalesce(s.completed_at, s.started_at)
  from sessions s
 where s.xp_earned > 0
   and s.status = 'complete'
on conflict do nothing;

-- Learn items: XP was written per item attempt.
insert into xp_events (user_id, amount, reason_key, source_kind, source_id, created_at)
select a.user_id,
       a.xp_awarded,
       'learnItem',
       'item_attempt',
       a.id,
       coalesce(a.completed_at, a.started_at)
  from item_attempts a
 where a.xp_awarded > 0
on conflict do nothing;

-- Referral bonuses were paid in SQL at signup with no row anywhere. Reconcile
-- whatever the ledger cannot explain into a single opening balance so the
-- timeline's running total ends on the same number the profile shows.
insert into xp_events (user_id, amount, reason_key, source_kind, source_id, created_at)
select p.id,
       p.xp - coalesce(e.total, 0),
       'openingBalance',
       'backfill',
       p.id,
       p.created_at
  from profiles p
  left join (
        select user_id, sum(amount) as total
          from xp_events
         group by user_id
       ) e on e.user_id = p.id
 where p.xp - coalesce(e.total, 0) > 0
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Daily XP on the existing aggregate spine, so a long timeline can be drawn
-- without scanning every event.
-- ---------------------------------------------------------------------------
alter table public.independence_daily
  add column if not exists xp_earned integer not null default 0;
