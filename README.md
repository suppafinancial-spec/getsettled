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

SQL migrations live in `supabase/migrations/`. Apply `20260728000000_initial_schema.sql`
in the Supabase SQL editor (or via the Supabase CLI) to create the initial tables:

- `brokerages` — name, tier (small/medium/large), monthly price
- `agents` — belong to a brokerage
- `clients` — belong to an agent; move-in/move-out dates and postal codes, persona type, property type
- `tasks` — belong to a client; task name, due date, status, category
- `task_events` — log of task creation/completion events
- `vendors`
- `postal_code_lookup` — postal code prefix to utility company, ServiceOntario link, school board, and Canada Post forwarding info

Row Level Security is enabled on every table with no policies yet, so the anon
key currently has no read/write access until policies are added for your
auth model.
