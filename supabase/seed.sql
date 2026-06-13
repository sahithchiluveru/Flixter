-- Seed data so the rail has something to show during local development and the
-- foundation-slice demo. Loaded by `supabase db reset`.

insert into public.profiles (id, username) values
  ('11111111-1111-1111-1111-111111111111', 'alice'),
  ('22222222-2222-2222-2222-222222222222', 'bob')
on conflict (id) do nothing;

-- 80100172 is a sample Netflix video ID; replace with whatever you're testing.
insert into public.comments (video_id, author_id, body, is_spoiler, created_at) values
  ('80100172', '11111111-1111-1111-1111-111111111111', 'This opening episode is incredible.', false, now() - interval '2 hours'),
  ('80100172', '22222222-2222-2222-2222-222222222222', 'Wait until you see how it ends…', true,  now() - interval '1 hour'),
  ('80100172', '11111111-1111-1111-1111-111111111111', 'Rewatching and noticing so many details.', false, now() - interval '10 minutes');
