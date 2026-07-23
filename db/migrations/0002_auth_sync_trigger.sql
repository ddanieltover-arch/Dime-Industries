-- 0002_auth_sync_trigger.sql
-- Keeps public.users in sync with Supabase's auth.users on signup.
-- Runs as a SECURITY DEFINER function owned by the migration role (table owner),
-- so it bypasses RLS on public.users regardless of the calling session's role —
-- this is the one legitimate server-side bypass of the RLS boundary described
-- in rls_policies.sql, and it's scoped to exactly one narrow job.

begin;

create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users (id, email, role, created_at)
  values (
    new.id,
    new.email,
    'customer', -- default role; promoted to admin/wholesale explicitly, never at signup
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Keep email in sync if a user changes/re-verifies it in Supabase Auth
create or replace function public.handle_auth_user_email_update()
returns trigger as $$
begin
  update public.users set email = new.email where id = new.id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_auth_user_email_update();

commit;
