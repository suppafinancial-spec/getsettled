# getsettled

React + Vite app connected to Supabase.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` (already done in this repo) and fill in your Supabase anon key:

   ```sh
   VITE_SUPABASE_URL=https://yeqjqqctijawnkqfbicj.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Run the dev server:

   ```sh
   npm run dev
   ```

The home page shows a live Supabase connection status check.

## Database schema

SQL migrations live in `supabase/migrations/`. Apply them in order in the
Supabase SQL editor (or via the Supabase CLI):

1. `20260728000000_initial_schema.sql` — creates the tables:
   - `brokerages` — name, tier (small/medium/large), monthly price
   - `agents` — belong to a brokerage
   - `clients` — belong to an agent; move-in/move-out dates and postal codes, persona type, property type
   - `tasks` — belong to a client; task name, due date, status, category
   - `task_events` — log of task creation/completion events
   - `vendors`
   - `postal_code_lookup` — postal code prefix to utility company, ServiceOntario link, school board, and Canada Post forwarding info

2. `20260728010000_rls_policies.sql` — adds `user_id` columns to `agents` and
   `clients` (linked to `auth.users`) and RLS policies:
   - Agents can SELECT their own brokerage row, and SELECT/UPDATE clients where `agent_id` matches their own agent record.
   - Clients can SELECT/UPDATE their own client row (by `user_id`), and SELECT their own tasks and task_events (via the client relationship).
   - `vendors` and `postal_code_lookup` are SELECT-able by any authenticated user; writes to those two are left to the service role.

3. `20260728020000_agent_task_select_policies.sql` — adds SELECT-only
   policies so agents can view `tasks`/`task_events` for clients where
   `agent_id` matches their own agent record. Agents cannot UPDATE or DELETE
   tasks/task_events; status changes come from the client or the system.

4. `20260728030000_auth_signup_trigger.sql` — adds a trigger on `auth.users`
   that creates the matching `agents`/`clients` row when someone signs up
   (see Auth below).

### Applying migrations

This environment cannot reach Supabase (network policy blocks both the
project host and the management API, and raw Postgres connections aren't
proxied), so `supabase link` / `supabase db push` can't be run from here.
Apply migrations yourself, in order, from a machine with network access:

```sh
npx supabase login
npx supabase link --project-ref yeqjqqctijawnkqfbicj
npx supabase db push
```

Or paste each file's contents into the Supabase SQL editor in order.

## Auth

Email/password auth via Supabase Auth, with separate signup/login flows for
agents (`/agent`) and clients (`/client`). On signup, the form passes
`role`, `name`, and a linking id (`brokerage_id` for agents, `agent_id` for
clients) as auth user metadata; the `on_auth_user_created` trigger reads that
metadata and inserts the corresponding `agents`/`clients` row. After login,
`/agent-dashboard` and `/client-dashboard` are placeholder pages guarded by
role — a route redirects home if the logged-in user has no matching row in
that table.

Two things to know before testing signup:

- **No picker UI yet for Brokerage ID / Agent ID** — the signup forms just
  take a raw UUID pasted in. Before testing agent signup, create a test
  brokerage in the SQL editor and copy its id:
  ```sql
  insert into public.brokerages (name, tier, monthly_price)
  values ('Test Brokerage', 'small', 99.00)
  returning id;
  ```
  Then after a test agent signs up, find their id in Table Editor → `agents`
  to use as the Agent ID when testing client signup.

- **Email confirmation** — if your Supabase project has "Confirm email"
  enabled (Authentication → Providers → Email), signup won't return a
  session immediately, so login is blocked until the email is confirmed. The
  `agents`/`clients` row is still created right away (the trigger fires on
  user creation, not confirmation) — only login is gated. For local testing
  without email set up, you can turn "Confirm email" off in that same
  settings page, or manually confirm the user from Authentication → Users.
