"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  recuperarSenhaSchema,
  redefinirSenhaSchema,
  type LoginFormData,
  type RecuperarSenhaFormData,
  type RedefinirSenhaFormData,
} from "@/lib/validators/auth";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

function mapAuthError(error: Error | { message: string; status?: number }): string {
  const message = error.message?.toLowerCase() || "";

  if (message.includes("invalid login credentials") || message.includes("invalid_grant")) {
    return "E-mail ou senha incorretos. Verifique suas credenciais.";
  }

  if (message.includes("email not confirmed")) {
    return "E-mail ainda não confirmado. Verifique sua caixa de entrada.";
  }

  if (message.includes("too many requests") || message.includes("rate limit") || message.includes("over_email_send_rate_limit")) {
    return "Muitas tentativas consecutivas. Aguarde alguns instantes antes de tentar novamente.";
  }

  if (message.includes("user not found")) {
    return "Nenhuma conta vinculada a este endereço de e-mail foi encontrada.";
  }

  return error.message || "Ocorreu um erro inesperado. Tente novamente.";
}

export async function loginAction(data: LoginFormData): Promise<AuthActionResult> {
  const parseResult = loginSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Dados inválidos.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parseResult.data.email,
      password: parseResult.data.password,
    });

    if (error) {
      return {
        success: false,
        error: mapAuthError(error),
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? mapAuthError(err) : "Falha na conexão com o servidor de autenticação.",
    };
  }

  redirect("/painel");
}

export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Continua para redirecionamento mesmo em caso de falha de rede
  }

  redirect("/login");
}

export async function recuperarSenhaAction(
  data: RecuperarSenhaFormData,
): Promise<AuthActionResult> {
  const parseResult = recuperarSenhaSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "E-mail inválido.",
    };
  }

  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(parseResult.data.email, {
      redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
    });

    if (error) {
      return {
        success: false,
        error: mapAuthError(error),
      };
    }

    return {
      success: true,
      message: "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? mapAuthError(err) : "Erro ao processar solicitação de recuperação.",
    };
  }
}

export async function redefinirSenhaAction(
  data: RedefinirSenhaFormData,
): Promise<AuthActionResult> {
  const parseResult = redefinirSenhaSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Senha inválida.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: parseResult.data.password,
    });

    if (error) {
      return {
        success: false,
        error: mapAuthError(error),
      };
    }

    return {
      success: true,
      message: "Senha atualizada com sucesso! Você já pode entrar com a nova senha.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? mapAuthError(err) : "Erro ao atualizar senha.",
    };
  }
}
