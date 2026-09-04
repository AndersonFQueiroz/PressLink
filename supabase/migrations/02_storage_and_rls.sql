-- PressLink — buckets e políticas de armazenamento
-- Os caminhos dos arquivos devem começar pelo UUID do usuário:
-- <auth.uid()>/<arquivo>.

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('galeria', 'galeria', true)
on conflict (id) do update set public = excluded.public;

create policy "leitura pública de avatars"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "leitura pública de galeria"
on storage.objects for select
using (bucket_id = 'galeria');

create policy "dono pode enviar avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "dono pode atualizar avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "dono pode excluir avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "dono pode enviar foto da galeria"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'galeria'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "dono pode atualizar foto da galeria"
on storage.objects for update
to authenticated
using (
  bucket_id = 'galeria'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'galeria'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "dono pode excluir foto da galeria"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'galeria'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
