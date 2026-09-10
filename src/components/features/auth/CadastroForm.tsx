"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cadastroSchema, type CadastroFormData } from "@/lib/validators/cadastro";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CadastroForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: "",
      username: "",
      email: "",
      senha: "",
      aceiteLgpd: false,
    },
  });

  const onSubmit = async (data: CadastroFormData) => {
    setFormError(null);
    setSuccessMsg(null);
    const supabase = createClient();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
      options: {
        data: { nome: data.nome },
      },
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user already")) {
        setFormError("Este e-mail já está cadastrado. Tente fazer login.");
      } else {
        setFormError(signUpError.message);
      }
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setFormError("Não foi possível criar a conta. Tente novamente.");
      return;
    }

    const { error: perfilError } = await supabase.from("perfil").insert({
      usuario_id: userId,
      username: data.username,
      nome_artistico: data.nome,
    });

    if (perfilError) {
      if (perfilError.code === "23505" || perfilError.message.includes("duplicate")) {
        setFormError("Username já está em uso. Escolha outro.");
      } else {
        setFormError(`Conta criada, mas erro ao criar perfil: ${perfilError.message}`);
      }
      return;
    }

    if (signUpData.session) {
      router.push("/painel");
      router.refresh();
    } else {
      setSuccessMsg("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full flex flex-col gap-4">
      <Input
        label="Nome"
        placeholder="Seu nome"
        autoComplete="name"
        error={errors.nome?.message}
        {...register("nome")}
      />
      <Input
        label="Username"
        placeholder="seu-username"
        autoComplete="username"
        helperText="Será sua URL: presslink.app/seu-username"
        error={errors.username?.message}
        {...register("username")}
      />
      <Input
        label="E-mail"
        type="email"
        placeholder="voce@exemplo.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Senha"
        type="password"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        error={errors.senha?.message}
        {...register("senha")}
      />

      <label className="flex items-start gap-2.5 text-sm leading-snug cursor-pointer select-none">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/[0.04] text-fuchsia-600 focus:ring-fuchsia-500 focus:ring-offset-0"
          {...register("aceiteLgpd")}
        />
        <span className="text-white/70">
          Li e aceito os{" "}
          <Link href="/termos" target="_blank" className="text-fuchsia-300 hover:text-fuchsia-200 underline underline-offset-2">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" target="_blank" className="text-fuchsia-300 hover:text-fuchsia-200 underline underline-offset-2">
            Política de Privacidade
          </Link>{" "}
          (LGPD).
        </span>
      </label>
      {errors.aceiteLgpd && <p className="text-xs text-rose-400 -mt-2">{errors.aceiteLgpd.message}</p>}

      {formError && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-3.5 py-2.5 text-sm text-rose-200">
          {formError}
        </div>
      )}
      {successMsg && (
        <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-2.5 text-sm text-emerald-200">
          {successMsg}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full mt-1" isLoading={isSubmitting}>
        Criar conta
      </Button>

      <p className="text-center text-sm text-white/60">
        Já tem conta?{" "}
        <Link href="/login" className="text-fuchsia-300 hover:text-fuchsia-200 font-medium">
          Faça login
        </Link>
      </p>
    </form>
  );
}
