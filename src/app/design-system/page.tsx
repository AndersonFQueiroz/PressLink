"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Music2,
  Calendar,
  Mail,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Dropdown } from "@/components/ui/Dropdown";
import { SkeletonLoader, SkeletonCard } from "@/components/ui/SkeletonLoader";

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  const dropdownItems = [
    {
      id: "1",
      label: "Editar Perfil",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => alert("Editar clicado"),
    },
    {
      id: "2",
      label: "Ver Página Pública",
      icon: <ExternalLink className="h-4 w-4" />,
      onClick: () => alert("Link externo clicado"),
    },
    {
      id: "3",
      label: "Excluir Conta",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "danger" as const,
      divider: true,
      onClick: () => alert("Ação destrutiva"),
    },
  ];

  return (
    <main className="min-h-screen bg-ink text-white p-6 sm:p-12 lg:p-16">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <header className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold tracking-tight">
              press<span className="text-fuchsia-400">link</span>
            </span>
            <Badge variant="default" size="sm" dot>
              Design System v0.1
            </Badge>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Biblioteca de Componentes UI
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Catálogo interno de componentes reutilizáveis construídos com Tailwind CSS e
            Lucide React para o PressLink.
          </p>
        </header>

        {/* 1. Buttons */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-semibold">1. Buttons</h2>
            <p className="text-sm text-white/60">
              Variantes, tamanhos, estados interativos e suporte a ícones.
            </p>
          </div>

          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Variantes
                </span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Tamanhos
                </span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="sm">Small (sm)</Button>
                  <Button size="md">Medium (md)</Button>
                  <Button size="lg">Large (lg)</Button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Com Ícones & Estados
                </span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button leftIcon={<Sparkles className="h-4 w-4" />}>
                    Com Ícone
                  </Button>
                  <Button
                    variant="outline"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Avançar
                  </Button>
                  <Button isLoading>Carregando</Button>
                  <Button disabled>Desabilitado</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. Inputs */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-semibold">2. Inputs</h2>
            <p className="text-sm text-white/60">
              Campos de formulário com rótulos, ícones e validação de erros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="space-y-4 p-6">
                <Input
                  label="Nome Artístico"
                  placeholder="Ex: DJ Alok"
                  helperText="Nome que aparecerá no cabeçalho do seu portfólio."
                />
                <Input
                  label="E-mail de Booking"
                  type="email"
                  placeholder="contato@dj.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-6">
                <Input
                  label="Username Único"
                  placeholder="nomedodj"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (e.target.value.includes(" ")) {
                      setInputError("O username não pode conter espaços.");
                    } else {
                      setInputError("");
                    }
                  }}
                  error={inputError}
                  helperText="Sua URL pública será: presslink.app/seu-nome"
                />
                <Input
                  label="Campo Desabilitado"
                  placeholder="Não é possível alterar"
                  disabled
                  value="valor-fixo@presslink.app"
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. Badges */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-semibold">3. Badges</h2>
            <p className="text-sm text-white/60">
              Etiquetas e marcadores de status com variações de cor.
            </p>
          </div>

          <Card>
            <CardContent className="flex flex-wrap gap-4 items-center p-6">
              <Badge variant="default" dot>
                Publicado
              </Badge>
              <Badge variant="success" dot>
                Conectado
              </Badge>
              <Badge variant="warning" dot>
                Pendente
              </Badge>
              <Badge variant="danger" dot>
                Offline
              </Badge>
              <Badge variant="outline">
                Template Mono
              </Badge>
              <Badge variant="default" size="sm">
                Tag Pequena
              </Badge>
            </CardContent>
          </Card>
        </section>

        {/* 4. Cards */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-semibold">4. Cards</h2>
            <p className="text-sm text-white/60">
              Containers modulares com Header, Content e Footer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card hoverable>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="default">Spotify</Badge>
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    }
                    items={dropdownItems}
                  />
                </div>
                <CardTitle className="pt-2">Set Especial Lollapalooza</CardTitle>
                <CardDescription>Adicionado há 2 dias • 45 min</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70">
                  Card com suporte a hover suave e ações integradas via Dropdown.
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-xs text-white/40">1.240 reproduções</span>
                <Button size="sm" variant="secondary">
                  Ouvir
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próxima Data de Show</CardTitle>
                <CardDescription>Festival Tomorrowland Brasil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Calendar className="h-4 w-4 text-fuchsia-400" />
                  <span>14 de Outubro, 2026 • 23:30</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Music2 className="h-4 w-4 text-fuchsia-400" />
                  <span>Palco Principal (Mainstage)</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" className="w-full" variant="outline">
                  Ver Detalhes do Evento
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 5. Modal & Dropdown */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-semibold">
              5. Modal & Dropdown
            </h2>
            <p className="text-sm text-white/60">
              Componentes de diálogo interativo e menus suspensos com acessibilidade.
            </p>
          </div>

          <Card>
            <CardContent className="flex flex-wrap gap-4 items-center p-6">
              <Button onClick={() => setIsModalOpen(true)}>
                Abrir Modal de Demonstração
              </Button>

              <Dropdown
                trigger={
                  <Button variant="outline" rightIcon={<MoreVertical className="h-4 w-4" />}>
                    Menu Dropdown
                  </Button>
                }
                items={dropdownItems}
              />
            </CardContent>
          </Card>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Publicar Portfólio"
            description="Confirme os dados antes de tornar sua página pública."
            footer={
              <>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => {
                    alert("Portfólio publicado com sucesso!");
                    setIsModalOpen(false);
                  }}
                >
                  Confirmar Publicação
                </Button>
              </>
            }
          >
            <div className="space-y-3">
              <p>
                Ao publicar, seu PressLink ficará visível em:
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-fuchsia-300">
                https://presslink.app/nomedodj
              </div>
              <p className="text-xs text-white/50">
                Pressione <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">ESC</kbd> ou clique fora para fechar o diálogo.
              </p>
            </div>
          </Modal>
        </section>

        {/* 6. Skeleton Loader */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-semibold">
              6. Skeleton Loader
            </h2>
            <p className="text-sm text-white/60">
              Efeito de carregamento placeholder para conteúdo assíncrono.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="space-y-4 p-6">
                <span className="text-xs uppercase tracking-wider text-white/50 font-semibold block">
                  Variantes Individuais
                </span>
                <div className="flex items-center gap-3">
                  <SkeletonLoader variant="circular" className="h-10 w-10" />
                  <div className="flex-1 space-y-2">
                    <SkeletonLoader variant="text" className="w-3/4 h-3.5" />
                    <SkeletonLoader variant="text" className="w-1/2 h-3" />
                  </div>
                </div>
                <SkeletonLoader variant="rectangular" className="h-20 w-full rounded-xl" />
              </CardContent>
            </Card>
            <SkeletonCard />
          </div>
        </section>
      </div>
    </main>
  );
}
