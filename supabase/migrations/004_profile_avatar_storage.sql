insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "avatar images public read"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "staff upload own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and owner = auth.uid()
  and public.is_active_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "staff update own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and owner = auth.uid()
  and public.is_active_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and owner = auth.uid()
  and public.is_active_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "staff delete own avatar"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and owner = auth.uid()
  and public.is_active_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
);
