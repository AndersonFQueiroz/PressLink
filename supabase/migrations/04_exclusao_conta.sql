-- PressLink - exclusao permanente da propria conta (issue #29 / RNF-12 / LGPD art. 18)
--
-- O cliente nunca tem a service role key no servidor: quem apaga a linha em
-- auth.users e o proprio banco, numa funcao SECURITY DEFINER que so enxerga o
-- usuario do JWT (auth.uid()). As FKs de public.perfil e das tabelas filhas
-- usam ON DELETE CASCADE, entao perfil, links, fotos, shows e estatisticas
-- somem junto com o usuario.
--
-- A remocao dos arquivos dos buckets avatars/galeria NAO acontece aqui: ela e
-- feita antes, pela rota DELETE /api/conta usando a sessao do proprio usuario
-- (as policies de 02_storage_and_rls.sql permitem o dono excluir). Ordem
-- importa: se o Storage falhar, a conta nao e apagada e nenhum arquivo fica
-- orfao em bucket publico.

create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
begin
  if v_usuario is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  delete from auth.users where id = v_usuario;

  if not found then
    raise exception 'Conta não encontrada' using errcode = 'P0002';
  end if;
end;
$$;

comment on function public.excluir_minha_conta() is
  'Exclui definitivamente a conta do usuário autenticado (issue #29). Só apaga a própria linha em auth.users; o cascade remove os dados do domínio.';

-- Ninguém além de um usuário logado pode chamar (nem anon, nem public).
revoke all on function public.excluir_minha_conta() from public;
revoke all on function public.excluir_minha_conta() from anon;
grant execute on function public.excluir_minha_conta() to authenticated;
