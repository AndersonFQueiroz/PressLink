/**
 * Erros do painel em formato acionável.
 *
 * Regra (19/11/2026): a tela nunca mostra só "Dados inválidos". Se o servidor
 * sabe qual campo falhou (issues do Zod), o DJ vê o motivo no popup e ganha um
 * botão que abre a página certa já com o campo em foco (`?campo=` — ver
 * CampoFoco). Prévias ausentes viram pré-requisito explicado, não erro cru.
 *
 * Funções puras: testadas em tests/unit/erros-painel.test.ts sem servidor.
 */
import { explainPerfilSaveError } from "./perfil-errors";

export type DestinoErro = {
  label: string;
  href: string;
};

export type ErroAcao = {
  titulo: string;
  mensagem: string;
  /** Texto técnico curto, quando ajuda a diagnosticar (nunca stack/código). */
  detalhe?: string;
  destino?: DestinoErro;
};

export type CorpoErro = {
  error?: unknown;
  issues?: unknown;
} | null | undefined;

export type ContextoErro = "perfil" | "contato" | "template";

type IssuesZod = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

/** Campo do formulário → tela + id do input que deve receber o foco. */
export const DESTINOS_CAMPO: Record<string, DestinoErro> = {
  nome_artistico: { label: "Ir para Nome artístico", href: "/painel/perfil?campo=nome_artistico" },
  username: { label: "Ir para Username", href: "/painel/perfil?campo=username" },
  biografia_pt: { label: "Ir para Biografia", href: "/painel/perfil?campo=bio_pt" },
  biografia_en: { label: "Ir para Biography", href: "/painel/perfil?campo=bio_en" },
  instagram: { label: "Ir para Instagram", href: "/painel/perfil?campo=instagram" },
  tiktok: { label: "Ir para TikTok", href: "/painel/perfil?campo=tiktok" },
  twitter_x: { label: "Ir para Twitter / X", href: "/painel/perfil?campo=twitter_x" },
  facebook: { label: "Ir para Facebook", href: "/painel/perfil?campo=facebook" },
  foto_url: { label: "Ir para a foto de destaque", href: "/painel/perfil?campo=foto_url" },
  whatsapp: { label: "Ir para o WhatsApp", href: "/painel/contato?campo=whatsapp" },
  email_booking: { label: "Ir para o e-mail de booking", href: "/painel/contato?campo=email_booking" },
  template_slug: { label: "Ir para Aparência", href: "/painel/template" },
};

const DESTINO_PERFIL: DestinoErro = { label: "Revisar o perfil", href: "/painel/perfil" };
const DESTINO_CONTATO: DestinoErro = { label: "Revisar o contato", href: "/painel/contato" };

const TITULOS: Record<ContextoErro, string> = {
  perfil: "Não foi possível salvar o perfil",
  contato: "Não foi possível salvar o contato",
  template: "Não foi possível trocar o tema",
};

/** Lista os problemas de validação do Zod de forma estável (campo + texto). */
export function problemasDeValidacao(corpo: CorpoErro): { campo: string; mensagem: string }[] {
  const issues = (corpo as { issues?: IssuesZod } | null | undefined)?.issues;
  if (!issues) return [];

  const lista: { campo: string; mensagem: string }[] = [];
  for (const [campo, mensagens] of Object.entries(issues.fieldErrors ?? {})) {
    const mensagem = mensagens?.find((m) => Boolean(m && m.trim()));
    if (mensagem) lista.push({ campo, mensagem });
  }

  const form = issues.formErrors?.find((m) => Boolean(m && m.trim()));
  if (form) lista.push({ campo: "", mensagem: form });

  return lista;
}

function mensagemDoServidor(corpo: CorpoErro): string {
  const bruto = (corpo as { error?: unknown } | null | undefined)?.error;
  return typeof bruto === "string" ? bruto.trim() : "";
}

/**
 * Traduz a resposta de erro de `PUT/PATCH /api/perfil` para o popup.
 * `contexto` muda o título e o destino padrão (perfil × contato × tema).
 */
export function explicarErroSalvar(
  contexto: ContextoErro,
  status: number,
  corpo: CorpoErro,
): ErroAcao {
  const titulo = TITULOS[contexto];
  const doServidor = mensagemDoServidor(corpo);

  // Sessão caída: nada de "revise o formulário", o problema é login.
  if (status === 401) {
    return {
      titulo: "Sua sessão expirou",
      mensagem: "Entre de novo para continuar de onde parou. Nada do que você digitou foi perdido.",
      destino: { label: "Entrar de novo", href: "/login" },
    };
  }

  // 409 tem dois significados: username em uso (perfil/tema) ou perfil ainda
  // não salvo (contato). O contexto decide qual mensagem o DJ recebe.
  if (status === 409) {
    if (contexto === "contato") {
      return {
        titulo: "Salve seu perfil primeiro",
        mensagem:
          "O contato vive dentro do perfil. Cadastre nome e @username uma vez e volte para preencher WhatsApp e e-mail de booking.",
        destino: { label: "Ir para Perfil", href: "/painel/perfil?campo=nome_artistico" },
      };
    }
    return {
      titulo: "Esse endereço já está em uso",
      mensagem: "Outro perfil já usa este @username. Escolha outro para liberar a sua página.",
      destino: DESTINOS_CAMPO.username,
    };
  }

  const problemas = problemasDeValidacao(corpo);
  if (problemas.length > 0) {
    const primeiro = problemas[0];
    return {
      titulo,
      mensagem: primeiro.mensagem,
      detalhe:
        doServidor && doServidor !== primeiro.mensagem && doServidor !== "Dados inválidos"
          ? doServidor
          : undefined,
      destino: DESTINOS_CAMPO[primeiro.campo] ?? (contexto === "contato" ? DESTINO_CONTATO : DESTINO_PERFIL),
    };
  }

  if (status === 400) {
    return {
      titulo,
      mensagem:
        contexto === "contato"
          ? "Revise o número de WhatsApp e o e-mail de booking antes de salvar."
          : "Revise as informações do perfil antes de salvar.",
      // No meio do formulário o certo é fechar e corrigir na própria tela; só a
      // troca de tema (que acontece em outra página) manda de volta ao Perfil.
      destino: contexto === "template" ? DESTINO_PERFIL : undefined,
    };
  }

  // Banco atrás do código (migration pendente) tem texto próprio e acionável.
  if (status >= 500) {
    const traduzido = explainPerfilSaveError(status, doServidor);
    if (traduzido.includes("supabase/migrations")) {
      return { titulo: "Falta uma migration no banco", mensagem: traduzido };
    }
    return {
      titulo,
      mensagem: "O servidor não conseguiu concluir agora. Tente de novo em instantes.",
      detalhe: doServidor || undefined,
    };
  }

  return {
    titulo,
    mensagem: doServidor || `Falha ao salvar (HTTP ${status}).`,
    destino: contexto === "contato" ? DESTINO_CONTATO : DESTINO_PERFIL,
  };
}

/** Falha de rede/timeout: nada foi salvo e o próximo passo é tentar de novo. */
export function explicarErroDeRede(): ErroAcao {
  return {
    titulo: "Sem conexão com o servidor",
    // Sem botão de destino: recarregar a página apagaria o que o DJ digitou.
    // Fechar o popup devolve o formulário preenchido para salvar de novo.
    mensagem: "Nada foi salvo. Confira sua internet e toque em salvar de novo.",
  };
}

/** Pré-requisito do seletor de temas: ainda não existe perfil para vestir o tema. */
export function erroSemPerfil(): ErroAcao {
  return {
    titulo: "Complete seu perfil primeiro",
    mensagem:
      "O tema usa o seu nome, @username e foto. Cadastre o perfil uma vez — depois a troca de tema fica liberada e não altera nenhum dado.",
    destino: { label: "Ir para Perfil", href: "/painel/perfil?campo=nome_artistico" },
  };
}
