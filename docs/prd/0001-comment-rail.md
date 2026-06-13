# PRD: Netflix public comment rail

## Problem Statement

When I watch a show or movie on Netflix, I'm watching alone. I have reactions, theories, and
things I want to say or read about *this exact episode*, but there's nowhere to do that without
leaving Netflix for a separate site, a group chat, or social media — and whatever I find there
is rarely about the precise thing I'm watching, is full of spoilers, and isn't there next to the
video. I want the feeling of a busy live-chat rail next to the player, populated by other people
who watched the same thing, without having to coordinate a synchronous watch party.

## Solution

A Chrome extension ("Flixter") that injects a comment rail on the right-hand side of the Netflix
watch page, styled to feel like a live-chat rail. Clicking the extension's toolbar icon toggles
the rail. When open, it shows public text comments left by other viewers of the *same title*
(the same Netflix video — per episode for series, per movie for films). A signed-in user can post
a comment, optionally flagging it as a spoiler. Future viewers of that same video open the rail
and read what previous viewers wrote. Comments are public and attributed to a self-chosen username;
the user's email is never shown.

## User Stories

1. As a viewer, I want to open a comment rail on the right of the Netflix watch page by clicking the extension icon, so that I can see others' comments without leaving the video.
2. As a viewer, I want to close/toggle the rail with the same icon, so that I can reclaim screen space when I don't want it.
3. As a viewer, I want the rail to look like it belongs on the page (a live-chat-style rail), so that it feels native to Netflix rather than a bolted-on popup.
4. As a viewer, I want the rail to show comments for the exact episode or movie I'm watching, so that what I read is relevant to this content.
5. As a viewer watching a TV series, I want comments scoped to the specific episode, so that I'm not spoiled by or confused with comments about other episodes.
6. As a viewer in any country, I want to see the same feed as viewers in other countries for the same title, so that the conversation isn't fragmented by region.
7. As a new user, I want to create an account with an email and password, so that I can participate.
8. As a new user, I want to choose my own public username, so that my comments are attributed to a name I picked.
9. As a user, I want my email address never to be shown publicly, so that only my username is exposed when I comment.
10. As a returning user, I want to sign in with my email and password, so that I can post under my identity.
11. As a signed-in user, I want to sign out, so that I can stop being identified on a shared computer.
12. As a user, I want my username to be unique across the system, so that nobody can impersonate me.
13. As a signed-in viewer, I want to type and post a text comment on the current video, so that I can share my reaction.
14. As a viewer, I want newly loaded comments to appear newest-first, so that I see the most recent reactions at the top.
15. As a viewer, I want to refresh the feed manually (and load more), so that I can pull in comments posted since I opened the rail.
16. As a poster, I want to optionally flag my comment as a spoiler when posting, so that I can warn others before they read it.
17. As a viewer, I want spoiler-flagged comments hidden behind a "may contain spoilers — view?" gate, so that I'm not spoiled unless I choose to reveal them.
18. As a viewer, I want to reveal a spoiler comment by acting on the gate, so that I can read it when I'm ready.
19. As a viewer, I want to like a comment, so that I can show agreement or appreciation.
20. As a viewer, I want to remove my like from a comment, so that I can undo an accidental or changed reaction.
21. As a viewer, I want to see how many likes a comment has, so that I can gauge how others reacted.
22. As a user, I want to be prevented from liking the same comment more than once, so that like counts are meaningful.
23. As a poster, I want to delete my own comment, so that I can retract something I no longer want public.
24. As a viewer, I want to report another user's comment, so that abusive or inappropriate content can be reviewed.
25. As a user, I want to be rate-limited on how fast I can post, so that the feed isn't flooded with spam (including by others).
26. As a viewer, I want each comment to show its author's username and when it was posted, so that I have context for what I'm reading.
27. As a viewer, I want deleted comments to no longer appear in the feed, so that retracted content stays gone.
28. As a viewer opening the rail on a video with no comments yet, I want a clear empty state, so that I understand there's nothing there yet rather than thinking it's broken.
29. As a viewer, I want the rail to only appear on Netflix watch pages, so that it doesn't clutter the rest of Netflix or other sites.
30. As a user, I want my session to persist between visits, so that I don't have to sign in every time I open the rail.
31. As a viewer, I want the rail's styling isolated from Netflix's own styles, so that the page and the rail don't visually break each other.
32. As a viewer, I want to be told I must sign in before posting, so that I understand why the compose box is unavailable when signed out.

## Implementation Decisions

- **Two deployables:** (1) a Manifest V3 Chrome extension front-end, (2) a Supabase project (Postgres + Auth + Row-Level Security) as the backend. There is no custom server.
- **Front-end stack:** React + Vite + TypeScript + Tailwind, bundled with a Vite CRX plugin. A content script injects the rail into Netflix watch pages; a small popup/options surface handles auth if needed. The toolbar icon toggles the injected rail.
- **Rail rendering:** The rail mounts into a **Shadow DOM** so Netflix's CSS and the rail's CSS are mutually isolated. The rail is shown only in windowed playback; in true fullscreen it is intentionally hidden (fullscreen overlay is out of scope for v1).
- **Content identity:** The feed is keyed on the **Netflix numeric video ID** parsed from the `/watch/<id>` URL. This is global across regions and is per-episode for series / per-movie for films. Title and poster are scraped from the page for display only, not used as the key.
- **Auth & identity:** Supabase Auth with **email + password**. On first sign-up the user picks a **unique public username** stored in a `profiles` row. The username is the only identity shown on comments; email is never exposed in any read path.
- **Feed behavior:** Comments load **newest-first** when the rail opens, with manual refresh / load-more pagination. No realtime subscriptions in v1 (live-chat *look*, not live behavior).
- **Comment model:** Flat feed per video. No threading/replies. Comments are plain text, length-capped (~500 chars), and **not editable** (delete-and-repost instead).
- **Spoilers:** A per-comment boolean `is_spoiler` set by the poster at submit time. The client gates spoiler comments behind a reveal prompt. No community spoiler-voting in v1.
- **Likes:** A `likes` table with a composite-unique `(comment_id, user_id)` prevents double-likes and supports un-liking. Like count is derived from this table.
- **Moderation:** Authors can soft-delete their own comments; a `reports` table records reports `(comment_id, reporter_id, reason)`; posting is rate-limited server-side (e.g. N comments/min) enforced in Postgres (policy/trigger or RPC), not just client-side. Reports are reviewed manually via the Supabase dashboard in v1 (no in-app admin panel).
- **Security model:** Row-Level Security is the access-control mechanism, because the Supabase **anon key ships inside the extension**. The `service_role` key is never bundled. RLS policies: anyone (including anon) can read non-deleted comments and like counts; only the authenticated author can insert/soft-delete their own comments; likes and reports are tied to `auth.uid()`; a user cannot post or act as another user.
- **Rough schema:**
  - `profiles` — `id` (FK → `auth.users`), `username` (unique), `created_at`
  - `comments` — `id`, `video_id`, `author_id` (FK → `profiles`), `body`, `is_spoiler`, `is_deleted`, `created_at`
  - `likes` — `comment_id`, `user_id`, composite unique `(comment_id, user_id)`
  - `reports` — `id`, `comment_id`, `reporter_id`, `reason`, `created_at`

## Testing Decisions

A good test here asserts **external, observable behavior** — what a caller of the data-access module or an RLS policy can see — not internal implementation details. Tests should survive a refactor of how the modules are wired internally.

- **Data-access module (highest seam, primary coverage):** A single typed module wraps `supabase-js` with `getComments(videoId)`, `postComment`, `toggleLike`, `reportComment`, `deleteComment`, and auth (`signUp`, `signIn`, `signOut`, `setUsername`). Tested as **integration tests against a local Supabase instance** (Supabase CLI), driving real Postgres + RLS. Supabase is *not* mocked, because mocking it would bypass the very policies that constitute the security model.
- **RLS policy behavior (security seam):** Integration tests with different JWT/auth contexts assert: anon can read non-deleted comments; only the author can soft-delete their own comment; a user cannot insert a comment attributed to another user; like uniqueness `(comment_id, user_id)` is enforced; un-like works; reports insert under the reporter's identity; rate-limit blocks posting past the threshold.
- **Pure functions (unit seam):** `parseVideoId(url)` for various Netflix watch URLs (and rejection of non-watch URLs); newest-first ordering; spoiler-gate reveal state; rate-limit boundary logic if mirrored client-side.
- **Netflix DOM injection (manual / out of automated scope):** Rail mounting, Shadow DOM isolation, toggle behavior, and "watch pages only" gating are verified manually against the live site, since Netflix's DOM changes without notice and is brittle to automate. Not part of the automated suite for v1.
- **Prior art:** None — greenfield repo. These seams establish the testing conventions; the local-Supabase integration setup becomes the reference for future data tests.

## Out of Scope

- Timestamp/playback-synced comments (Danmaku-style) — the feed is flat per title, not anchored to video position.
- Realtime streaming of new comments while the rail is open.
- A visible rail during true fullscreen playback (fullscreen overlay).
- Replies / threading and any "sort by top" beyond newest-first.
- Editing a posted comment.
- OAuth / social sign-in (Google, etc.); only email + password.
- An in-app moderation/admin panel; community spoiler-voting; automated profanity filtering.
- Chrome Web Store submission and store listing (v1 runs as an unpacked dev extension).
- Support for streaming services other than Netflix.

## Further Notes

- **Cold start is a go-to-market concern, not a build constraint.** The originating discussion concluded that early adoption is steered by *which titles the product is marketed to first* (concentrating viewers on a small set), so v1 does not build seeding/aggregation machinery. The empty-state UX (story 28) is the only build-side accommodation.
- **Netflix DOM fragility** is the main ongoing maintenance risk: injection selectors and the watch-page detection may need updates when Netflix changes its UI. Shadow DOM mounting and minimal selectors are the mitigation.
- **Region note:** Netflix numeric video IDs are global, so keying on them unifies feeds across countries; a title simply unavailable in a region has no watch page and therefore no feed, which is acceptable.
