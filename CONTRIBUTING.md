# Guia de Contribuição — PressLink

Obrigado por contribuir com o **PressLink**! Este documento descreve as convenções e o fluxo de trabalho que seguimos para manter o repositório organizado e o desenvolvimento fluido.

---

## Fluxo de Trabalho com Git

### 1. Crie uma branch a partir da `main`

Nunca faça commits diretamente na branch `main`. Crie sempre uma nova branch a partir dela seguindo a convenção de nomenclatura abaixo:

```bash
# Para novas funcionalidades
git checkout main
git pull origin main
git checkout -b feature/nome-da-funcionalidade

# Para correções de bugs
git checkout -b fix/nome-do-bug

# Para alterações de documentação
git checkout -b docs/descricao-da-alteracao

# Para refatorações
git checkout -b refactor/descricao-da-refatoracao
```

### 2. Faça commits seguindo o padrão Conventional Commits

Todos os commits devem seguir a convenção [Conventional Commits](https://www.conventionalcommits.org/pt-br/). Isso garante um histórico de mudanças legível e facilita a geração de changelogs no futuro.

**Formato:**

```
<tipo>(escopo opcional): descrição curta

Corpo opcional com mais detalhes.
```

**Tipos permitidos:**

| Tipo         | Quando usar                                           |
| ------------ | ----------------------------------------------------- |
| `feat`       | Nova funcionalidade                                   |
| `fix`        | Correção de bug                                       |
| `docs`       | Alteração apenas em documentação                      |
| `style`      | Formatação, ponto e vírgula, etc. (sem mudança lógica)|
| `refactor`   | Refatoração de código (sem alterar comportamento)     |
| `test`       | Adição ou correção de testes                          |
| `chore`      | Tarefas de manutenção (configs, dependências, CI)     |

**Exemplos:**

```
feat(painel): adicionar formulário de edição de perfil
fix(auth): corrigir redirecionamento após login
docs: atualizar instruções de setup no README
chore: atualizar dependências do projeto
```

### 3. Abra um Pull Request (PR)

Quando sua branch estiver pronta:

1. Faça push da branch para o repositório remoto:
   ```bash
   git push origin feature/nome-da-funcionalidade
   ```
2. Abra um **Pull Request** no GitHub apontando para a branch `main`.
3. Preencha a descrição do PR explicando **o que foi feito** e **por que**.
4. Aguarde a revisão e aprovação de **pelo menos 1 membro** da equipe.
5. Após a aprovação, o PR pode ser mergeado.

> **Nota:** A branch `main` é protegida por Ruleset. Colaboradores precisam obrigatoriamente de 1 aprovação para mergear. O administrador do repositório (Anderson Ferreira Queiroz) está na lista de bypass e pode publicar diretamente na `main` quando necessário.

---

## Padrões de Código

### Lint e formatação

Antes de cada commit, rode o linter para garantir que o código está dentro dos padrões:

```bash
# Verificar problemas de lint
npm run lint

# Corrigir problemas automaticamente (quando possível)
npm run lint -- --fix
```

### Estrutura de pastas

Siga a estrutura padrão do Next.js App Router:

```
src/
├── app/                  # Rotas e layouts (App Router)
│   ├── (auth)/           # Rotas de autenticação
│   ├── painel/           # Área logada do DJ
│   ├── [username]/       # Página pública do DJ
│   └── layout.tsx        # Layout raiz
├── components/           # Componentes reutilizáveis
│   ├── ui/               # Componentes de UI genéricos
│   └── features/         # Componentes específicos de funcionalidade
├── lib/                  # Utilitários, clients (Supabase), helpers
├── hooks/                # Custom hooks
├── types/                # Definições de tipos TypeScript
└── styles/               # Estilos globais
```

---

## Reportando Bugs e Sugerindo Funcionalidades

### Bugs

Se encontrar um bug, abra uma **Issue** no GitHub com:

- **Título claro** descrevendo o problema.
- **Passos para reproduzir** o bug.
- **Comportamento esperado** vs. **comportamento atual**.
- **Capturas de tela**, se aplicável.
- **Ambiente** (navegador, sistema operacional, versão do Node.js).

### Sugestões de funcionalidades

Para sugerir uma nova funcionalidade, abra uma **Issue** com:

- **Título claro** descrevendo a funcionalidade.
- **Descrição detalhada** do que a funcionalidade faz e por que é útil.
- **Casos de uso** que justifiquem a funcionalidade.
- Se possível, **referências visuais** ou exemplos de outras plataformas.

---

## Código de Conduta

Este é um projeto acadêmico desenvolvido em equipe. Esperamos que todos os integrantes e eventuais colaboradores atuem com **respeito, transparência e comunicação aberta**. Críticas devem ser sempre construtivas e direcionadas ao código, nunca à pessoa. Divergências técnicas são bem-vindas e devem ser discutidas com argumentos, buscando sempre a melhor solução para o projeto. Trabalhamos juntos com o mesmo objetivo: entregar um TCC de qualidade.
