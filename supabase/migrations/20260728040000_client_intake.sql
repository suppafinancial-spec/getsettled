-- Client intake support
--
-- Adds has_kids/has_pets columns, enforces persona_type/property_type to
-- known values, and lets agents INSERT clients (and tasks for those
-- clients) for their own book -- previously agents only had SELECT/UPDATE
-- on clients and no INSERT access to either table.

alter table public.clients add column if not exists has_kids boolean;
alter table public.clients add column if not exists has_pets boolean;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'clients_persona_type_check') then
    alter table public.clients
      add constraint clients_persona_type_check
      check (persona_type is null or persona_type in (
        'first_time_buyer', 'repeat_buyer', 'family', 'senior_downsizing', 'investor'
      ));
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'clients_property_type_check') then
    alter table public.clients
      add constraint clients_property_type_check
      check (property_type is null or property_type in ('condo', 'house'));
  end if;
end $$;

drop policy if exists "agents_insert_own_clients" on public.clients;
create policy "agents_insert_own_clients"
  on public.clients
  for insert
  to authenticated
  with check (agent_id = public.current_agent_id());

drop policy if exists "agents_insert_client_tasks" on public.tasks;
create policy "agents_insert_client_tasks"
  on public.tasks
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.clients
      where clients.id = tasks.client_id
        and clients.agent_id = public.current_agent_id()
    )
  );
