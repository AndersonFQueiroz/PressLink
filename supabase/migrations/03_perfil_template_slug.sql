-- 03_perfil_template_slug.sql — issue #21
-- Coluna do template ativo do portfólio público.
-- Opcional: NULL = padrão (dark-minimal). Os valores válidos são validados na
-- aplicação (z.enum(TEMPLATE_IDS) em src/lib/validators/perfil.ts).

alter table public.perfil
  add column if not exists template_slug text;

comment on column public.perfil.template_slug is
  'Slug do template ativo: dark-minimal | vibrant-festival | clean-editorial';
