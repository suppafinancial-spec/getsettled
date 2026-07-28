-- Auto-create an agents/clients row when someone signs up
--
-- The signup form passes role ('agent' or 'client'), name, and the linking
-- id (brokerage_id for agents, agent_id for clients) as auth user metadata.
-- This trigger fires when the auth.users row is created (at signUp time,
-- regardless of whether email confirmation is pending), and inserts the
-- matching profile row as the table owner, bypassing RLS -- so no INSERT
-- policy is needed on agents/clients for the authenticated role.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data ->> 'role' = 'agent' then
    insert into public.agents (user_id, brokerage_id, name, email)
    values (
      new.id,
      nullif(new.raw_user_meta_data ->> 'brokerage_id', '')::uuid,
      new.raw_user_meta_data ->> 'name',
      new.email
    );
  elsif new.raw_user_meta_data ->> 'role' = 'client' then
    insert into public.clients (user_id, agent_id, name, email)
    values (
      new.id,
      nullif(new.raw_user_meta_data ->> 'agent_id', '')::uuid,
      new.raw_user_meta_data ->> 'name',
      new.email
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
