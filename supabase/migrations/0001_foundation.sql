-- Foundation schema (slice #2): profiles + comments, read-only access.
--
-- profiles holds the public username shown on comments. This slice creates it
-- with a public read policy so the rail can show usernames; the Auth slice (#3)
-- adds the FK to auth.users, the self-service username flow, and write policies.
--
-- comments are readable by everyone (including anon) when not deleted. No write
-- policies are defined yet — posting, deleting, etc. arrive in later slices.

create extension if not exists pgcrypto;

create table public.profiles (
  id         uuid primary key default gen_random_uuid(),
  username   text not null unique,
  created_at timestamptz not null default now()
);

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  video_id   text not null,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) <= 500),
  is_spoiler boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

-- The feed reads by video_id, newest first.
create index comments_video_created_idx
  on public.comments (video_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.comments enable row level security;

-- Usernames are public.
create policy "profiles are readable by everyone"
  on public.profiles
  for select
  using (true);

-- Anyone (including anonymous) can read non-deleted comments.
create policy "non-deleted comments are readable by everyone"
  on public.comments
  for select
  using (is_deleted = false);
