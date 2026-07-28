-- Allow agents to view (but not modify) tasks and task_events for their own clients
--
-- Uses the same agent/client relationship as agents_select_own_clients /
-- agents_update_own_clients: a task's client must have agent_id matching the
-- caller's own agent record. No UPDATE/DELETE policies are added — task
-- status changes come from the client or the system, not the agent.

drop policy if exists "agents_select_client_tasks" on public.tasks;
create policy "agents_select_client_tasks"
  on public.tasks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients
      where clients.id = tasks.client_id
        and clients.agent_id = public.current_agent_id()
    )
  );

drop policy if exists "agents_select_client_task_events" on public.task_events;
create policy "agents_select_client_task_events"
  on public.task_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tasks
      join public.clients on clients.id = tasks.client_id
      where tasks.id = task_events.task_id
        and clients.agent_id = public.current_agent_id()
    )
  );
