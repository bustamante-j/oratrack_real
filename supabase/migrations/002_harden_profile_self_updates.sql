create or replace function public.protect_profile_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.user_id and not coalesce(public.is_admin(), false) then
    if new.user_id is distinct from old.user_id
      or new.email is distinct from old.email
      or new.role is distinct from old.role
      or new.status is distinct from old.status
      or new.last_login_at is distinct from old.last_login_at
      or new.created_at is distinct from old.created_at
    then
      raise exception 'Profile update includes restricted fields.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_self_update on public.profiles;

create trigger profiles_protect_self_update
before update on public.profiles
for each row execute function public.protect_profile_self_update();

drop policy if exists "profiles update own safe fields or admin"
on public.profiles;

create policy "profiles self update contact fields"
on public.profiles for update
using (user_id = auth.uid() and public.is_active_staff())
with check (user_id = auth.uid() and public.is_active_staff());

create policy "profiles admin update"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());
