-- Initial schema for GetSettled
-- Tables: brokerages, agents, clients, tasks, task_events, vendors, postal_code_lookup

create extension if not exists "pgcrypto";

-- brokerages
create table if not exists public.brokerages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null check (tier in ('small', 'medium', 'large')),
  monthly_price numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

-- agents
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  brokerage_id uuid not null references public.brokerages (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create index if not exists agents_brokerage_id_idx on public.agents (brokerage_id);

-- clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  move_out_date date,
  move_in_date date,
  move_out_postal_code text,
  move_in_postal_code text,
  persona_type text,
  property_type text,
  created_at timestamptz not null default now()
);

create index if not exists clients_agent_id_idx on public.clients (agent_id);

-- tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  task_name text not null,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_client_id_idx on public.tasks (client_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- task_events
create table if not exists public.task_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  event_type text not null check (event_type in ('created', 'completed')),
  event_at timestamptz not null default now()
);

create index if not exists task_events_task_id_idx on public.task_events (task_id);

-- vendors
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  contact_name text,
  phone text,
  email text,
  website text,
  notes text,
  created_at timestamptz not null default now()
);

-- postal_code_lookup
create table if not exists public.postal_code_lookup (
  postal_code_prefix text primary key,
  utility_company text,
  service_ontario_link text,
  school_board text,
  canada_post_forwarding_info text,
  created_at timestamptz not null default now()
);

-- Row Level Security
-- Enabled with no policies yet: until an auth/access model is defined, the
-- anon key (used by the React app) has no read or write access to any table.
-- Add policies once you know who should see what (e.g. agents scoped to
-- their own brokerage/clients).
alter table public.brokerages enable row level security;
alter table public.agents enable row level security;
alter table public.clients enable row level security;
alter table public.tasks enable row level security;
alter table public.task_events enable row level security;
alter table public.vendors enable row level security;
alter table public.postal_code_lookup enable row level security;
