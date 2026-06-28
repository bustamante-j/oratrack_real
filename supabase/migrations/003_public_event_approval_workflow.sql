alter table public.public_events
add column if not exists location text,
add column if not exists event_type text not null default 'School event',
add column if not exists review_status text not null default 'pending'
  check (review_status in ('pending', 'approved', 'rejected')),
add column if not exists reviewed_by uuid references public.profiles (user_id),
add column if not exists reviewed_at timestamptz,
add column if not exists review_notes text;

update public.public_events
set review_status = case
  when published_at is not null then 'approved'
  else review_status
end;

drop policy if exists "staff submit pending events"
on public.public_events;

create policy "staff submit pending events"
on public.public_events for insert
with check (
  created_by = auth.uid()
  and public.is_active_staff()
  and published_at is null
  and review_status = 'pending'
);

drop policy if exists "event owners read own submissions"
on public.public_events;

create policy "event owners read own submissions"
on public.public_events for select
using (created_by = auth.uid() and public.is_active_staff());
