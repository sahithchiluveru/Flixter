# Flixter

A Chrome extension that adds a public comment rail to Netflix watch pages. Sign in, post
text comments scoped to the exact episode or movie you're watching, and read what previous
viewers wrote.

- **Frontend:** Manifest V3 extension — React + Vite + TypeScript + Tailwind, injected via a content script.
- **Backend:** Supabase (Postgres + Auth + Row-Level Security).

See `docs/agents/` for agent-skill configuration and the project issue tracker for the PRD and work items.

## Getting started

### Prerequisites

- Node.js 20+ and npm
- [Docker](https://docs.docker.com/get-docker/) (only for running the local Supabase stack / integration tests)

### Install

```bash
npm install
```

### Configure Supabase

Copy `.env.example` to `.env` and fill in your Supabase project's URL and **anon**
key (Project Settings → API). Only the anon key is bundled into the extension —
that is safe because Row-Level Security enforces all access. **Never** put the
`service_role` key in `.env` or the extension.

```bash
cp .env.example .env
```

### Build & load the extension

```bash
npm run build      # outputs to dist/
```

Then in Chrome: `chrome://extensions` → enable **Developer mode** → **Load
unpacked** → select the `dist/` folder. Open a Netflix `…/watch/<id>` page and
click the Flixter toolbar icon to toggle the rail. (`npm run dev` runs Vite with
HMR for development.)

## Database (local, for tests/dev)

The schema lives in `supabase/migrations/`; `supabase/seed.sql` loads sample
comments. With Docker running:

```bash
npm run db:start   # starts local Supabase (prints anon + service_role keys)
npm run db:reset   # applies migrations + seed
npm run db:stop
```

## Tests

```bash
npm run test            # unit tests (no external deps)
npm run test:unit       # same
npm run test:integration  # requires a running local Supabase (see below)
```

Integration tests hit a real local Supabase so they exercise the actual
Row-Level Security policies. They are **skipped** unless these env vars are set
(values come from `npm run db:start`):

```bash
export SUPABASE_URL=http://127.0.0.1:54321
export SUPABASE_ANON_KEY=<anon key>
export SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

