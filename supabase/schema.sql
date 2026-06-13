-- Run this in Supabase SQL Editor to enable Collections sync

create table if not exists public.creations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('recipe', 'thing')),
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists creations_user_id_idx on public.creations (user_id);
create index if not exists creations_created_at_idx on public.creations (created_at desc);

alter table public.creations enable row level security;

create policy "Users can view own creations"
  on public.creations for select
  using (auth.uid() = user_id);

create policy "Users can insert own creations"
  on public.creations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own creations"
  on public.creations for delete
  using (auth.uid() = user_id);

-- Enable Google OAuth in Supabase Dashboard:
-- Authentication → Providers → Google → Enable
-- Add redirect URL: http://localhost:5173 (and your production URL)
