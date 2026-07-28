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
