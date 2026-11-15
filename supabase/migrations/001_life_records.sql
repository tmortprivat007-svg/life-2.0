-- LIFE 2.0: private per-user JSON records.
-- Run this migration in the Supabase SQL Editor.
-- The browser must use only the publishable/anon key; never service_role.

create table if not exists public.life_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data_key text not null,
  payload jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now(),
  constraint life_records_user_data_key_unique unique (user_id, data_key)
);

create index if not exists life_records_user_id_idx
  on public.life_records (user_id);

alter table public.life_records enable row level security;

drop policy if exists "Users can read their own LIFE records" on public.life_records;
create policy "Users can read their own LIFE records"
  on public.life_records for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own LIFE records" on public.life_records;
create policy "Users can insert their own LIFE records"
  on public.life_records for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own LIFE records" on public.life_records;
create policy "Users can update their own LIFE records"
  on public.life_records for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own LIFE records" on public.life_records;
create policy "Users can delete their own LIFE records"
  on public.life_records for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.life_records to authenticated;
