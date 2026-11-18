"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Link para a página pública do DJ logado.
 *
 * Antes (até 18/11/2026) o painel apontava para `/preview`, rota que não
 * existe — o botão "Ver página" abria um 404. O endereço correto é `/{username}`,
 * que só é conhecido depois de consultar o perfil.
 *
 * `username` pode ser passado por quem já tem o dado (Sidebar); nesse caso
 * nenhuma requisição extra é feita.
 */
export function PublicPageLink({
  username,
  className,
  children,
  onClick,
  target = "_blank",
}: {
  username?: string | null;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  target?: "_blank" | "_self";
}) {
  const [carregado, setCarregado] = useState<string | null>(null);
  // `username` pode chegar depois (Sidebar busca o perfil no mount); por isso a
  // prop tem prioridade no render e o estado guarda só o resultado da API.
  const nome = username ?? carregado;

  useEffect(() => {
    if (username) return;
    let ativo = true;
    fetch("/api/perfil")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (ativo && json?.perfil?.username) setCarregado(json.perfil.username as string);
      })
      .catch(() => {
        // Sem perfil/sem sessão: mantém o fallback
      });
    return () => {
      ativo = false;
    };
  }, [username]);

  // Sem username ainda: leva para o Perfil, onde o @ é definido
  const href = nome ? `/${nome}` : "/painel/perfil";
  const titulo = nome ? `Abrir /${nome}` : "Defina seu @username no Perfil para ver a página";

  return (
    <Link href={href} target={target} title={titulo} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
