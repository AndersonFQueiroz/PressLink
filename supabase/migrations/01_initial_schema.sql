-- PressLink — schema inicial do banco de dados
-- Requer Supabase Auth (auth.users) e a extensão pgcrypto.

create extension if not exists "pgcrypto";

create type public.tipo_midia as enum ('spotify', 'soundcloud', 'youtube');
create type public.tipo_visualizacao as enum (
  'page_view',
  'click_whatsapp',
  'click_email',
  'click_formulario'
);

create table public.template (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text not null default '',
  thumbnail_url text,
  slug text not null unique,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.perfil (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references auth.users(id) on delete cascade,
  nome_artistico text,
  username text not null unique,
  foto_url text,
  biografia_pt text,
  biografia_en text,
  whatsapp text,
  email_booking text,
  instagram text,
  facebook text,
  tiktok text,
  twitter_x text,
  template_id uuid references public.template(id) on delete set null,
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint perfil_username_format check (username ~ '^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$'),
  constraint perfil_email_booking_format check (
    email_booking is null or email_booking ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

create table public.link_de_midia (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfil(id) on delete cascade,
  tipo public.tipo_midia not null,
  url text not null,
  titulo text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  constraint link_de_midia_url_not_empty check (length(trim(url)) > 0),
  constraint link_de_midia_ordem_nonnegative check (ordem >= 0)
);

create table public.data_de_show (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfil(id) on delete cascade,
  nome_evento text not null,
  data date not null,
  horario time,
  local text,
  cidade text,
  created_at timestamptz not null default now(),
  constraint data_de_show_nome_not_empty check (length(trim(nome_evento)) > 0)
);

create table public.foto_galeria (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfil(id) on delete cascade,
  url text not null,
  ordem integer not null default 0,
  alt_text text,
  created_at timestamptz not null default now(),
  constraint foto_galeria_url_not_empty check (length(trim(url)) > 0),
  constraint foto_galeria_ordem_nonnegative check (ordem >= 0)
);

create table public.visualizacao_de_pagina (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfil(id) on delete cascade,
  tipo public.tipo_visualizacao not null,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index perfil_template_id_idx on public.perfil(template_id);
create index perfil_publicado_username_idx on public.perfil(username) where publicado = true;
create index link_de_midia_perfil_ordem_idx on public.link_de_midia(perfil_id, ordem);
create index data_de_show_perfil_data_idx on public.data_de_show(perfil_id, data);
create index foto_galeria_perfil_ordem_idx on public.foto_galeria(perfil_id, ordem);
create index visualizacao_perfil_tipo_created_at_idx
  on public.visualizacao_de_pagina(perfil_id, tipo, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger perfil_set_updated_at
before update on public.perfil
for each row execute function public.set_updated_at();

insert into public.template (nome, descricao, thumbnail_url, slug)
values
  ('Pulse', 'Visual escuro e vibrante para destacar a identidade do DJ.', null, 'pulse'),
  ('Afterglow', 'Layout elegante com foco em biografia, agenda e booking.', null, 'afterglow'),
  ('Mono', 'Composição minimalista para um portfólio direto e sofisticado.', null, 'mono')
on conflict (slug) do update set
  nome = excluded.nome,
  descricao = excluded.descricao,
  ativo = true;

alter table public.template enable row level security;
alter table public.perfil enable row level security;
alter table public.link_de_midia enable row level security;
alter table public.data_de_show enable row level security;
alter table public.foto_galeria enable row level security;
alter table public.visualizacao_de_pagina enable row level security;

create policy "templates ativos são públicos"
on public.template for select
using (ativo = true);

create policy "usuário gerencia seu perfil"
on public.perfil for all
using (auth.uid() = usuario_id)
with check (auth.uid() = usuario_id);

create policy "perfis publicados são públicos"
on public.perfil for select
using (publicado = true);

create policy "usuário gerencia seus links"
on public.link_de_midia for all
using (exists (
  select 1 from public.perfil
  where perfil.id = link_de_midia.perfil_id and perfil.usuario_id = auth.uid()
))
with check (exists (
  select 1 from public.perfil
  where perfil.id = link_de_midia.perfil_id and perfil.usuario_id = auth.uid()
));

create policy "links de perfis publicados são públicos"
on public.link_de_midia for select
using (exists (
  select 1 from public.perfil
  where perfil.id = link_de_midia.perfil_id and perfil.publicado = true
));

create policy "usuário gerencia seus shows"
on public.data_de_show for all
using (exists (
  select 1 from public.perfil
  where perfil.id = data_de_show.perfil_id and perfil.usuario_id = auth.uid()
))
with check (exists (
  select 1 from public.perfil
  where perfil.id = data_de_show.perfil_id and perfil.usuario_id = auth.uid()
));

create policy "shows de perfis publicados são públicos"
on public.data_de_show for select
using (exists (
  select 1 from public.perfil
  where perfil.id = data_de_show.perfil_id and perfil.publicado = true
));

create policy "usuário gerencia sua galeria"
on public.foto_galeria for all
using (exists (
  select 1 from public.perfil
  where perfil.id = foto_galeria.perfil_id and perfil.usuario_id = auth.uid()
))
with check (exists (
  select 1 from public.perfil
  where perfil.id = foto_galeria.perfil_id and perfil.usuario_id = auth.uid()
));

create policy "galerias de perfis publicados são públicas"
on public.foto_galeria for select
using (exists (
  select 1 from public.perfil
  where perfil.id = foto_galeria.perfil_id and perfil.publicado = true
));

create policy "eventos de perfis publicados podem ser registrados"
on public.visualizacao_de_pagina for insert
with check (exists (
  select 1 from public.perfil
  where perfil.id = visualizacao_de_pagina.perfil_id and perfil.publicado = true
));

create policy "usuário consulta suas estatísticas"
on public.visualizacao_de_pagina for select
using (exists (
  select 1 from public.perfil
  where perfil.id = visualizacao_de_pagina.perfil_id and perfil.usuario_id = auth.uid()
));
