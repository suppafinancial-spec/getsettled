-- Row Level Security policies
--
-- Access model:
--   - agents.user_id and clients.user_id link each row to a Supabase auth user.
--   - Agents can SELECT their own brokerage, and SELECT/UPDATE clients that
--     belong to them.
--   - Clients can SELECT/UPDATE their own client row, and SELECT their own
--     tasks and task_events (via the client relationship).
--   - vendors and postal_code_lookup are readable by any authenticated user;
--     writes to those two tables are left to the service role (RLS enabled,
--     no write policies for anon/authenticated).
--
-- Note: this migration does not grant agents any access to tasks or
-- task_events — only the client-facing SELECT policies were specified for
-- those two tables.

-- link agents/clients to Supabase auth users
alter table public.agents
  add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table public.clients
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create unique index if not exists agents_user_id_idx on public.agents (user_id);
create unique index if not exists clients_user_id_idx on public.clients (user_id);

-- helper functions (security definer so they can look up the caller's
-- agent/client row without depending on that table's own RLS policies)
create or replace function public.current_agent_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.agents where user_id = auth.uid();
$$;

create or replace function public.current_agent_brokerage_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select brokerage_id from public.agents where user_id = auth.uid();
$$;

create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.clients where user_id = auth.uid();
$$;

grant execute on function public.current_agent_id() to authenticated;
grant execute on function public.current_agent_brokerage_id() to authenticated;
grant execute on function public.current_client_id() to authenticated;

-- make sure RLS is on (idempotent; already enabled in the initial migration)
alter table public.brokerages enable row level security;
alter table public.agents enable row level security;
alter table public.clients enable row level security;
alter table public.tasks enable row level security;
alter table public.task_events enable row level security;
alter table public.vendors enable row level security;
alter table public.postal_code_lookup enable row level security;

-- brokerages: agents can see only their own brokerage
drop policy if exists "agents_select_own_brokerage" on public.brokerages;
create policy "agents_select_own_brokerage"
  on public.brokerages
  for select
  to authenticated
  using (id = public.current_agent_brokerage_id());

-- agents: an agent can see their own row (needed for the app to resolve
-- "my agent record", and for the helper functions above to be useful)
drop policy if exists "agents_select_own_row" on public.agents;
create policy "agents_select_own_row"
  on public.agents
  for select
  to authenticated
  using (user_id = auth.uid());

-- clients: clients manage their own row; agents manage the clients they own
drop policy if exists "clients_select_own_row" on public.clients;
create policy "clients_select_own_row"
  on public.clients
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "clients_update_own_row" on public.clients;
create policy "clients_update_own_row"
  on public.clients
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "agents_select_own_clients" on public.clients;
create policy "agents_select_own_clients"
  on public.clients
  for select
  to authenticated
  using (agent_id = public.current_agent_id());

drop policy if exists "agents_update_own_clients" on public.clients;
create policy "agents_update_own_clients"
  on public.clients
  for update
  to authenticated
  using (agent_id = public.current_agent_id())
  with check (agent_id = public.current_agent_id());

-- tasks: clients can see only their own tasks
drop policy if exists "clients_select_own_tasks" on public.tasks;
create policy "clients_select_own_tasks"
  on public.tasks
  for select
  to authenticated
  using (client_id = public.current_client_id());

-- task_events: clients can see only events for their own tasks
drop policy if exists "clients_select_own_task_events" on public.task_events;
create policy "clients_select_own_task_events"
  on public.task_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tasks
      where tasks.id = task_events.task_id
        and tasks.client_id = public.current_client_id()
    )
  );

-- vendors: readable by any authenticated user; no write policies (service
-- role/admin only, via a role that bypasses RLS)
drop policy if exists "authenticated_select_vendors" on public.vendors;
create policy "authenticated_select_vendors"
  on public.vendors
  for select
  to authenticated
  using (true);

-- postal_code_lookup: readable by any authenticated user; no write policies
drop policy if exists "authenticated_select_postal_code_lookup" on public.postal_code_lookup;
create policy "authenticated_select_postal_code_lookup"
  on public.postal_code_lookup
  for select
  to authenticated
  using (true);
