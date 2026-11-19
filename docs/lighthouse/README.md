# Auditorias Lighthouse — issue #28

Relatórios do [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) gerados
contra o build de produção (`next build` + `next start`) e **commitados de propósito**:
são a evidência dos critérios de aceite da issue #28.

| Arquivo | Forma | Rota |
| --- | --- | --- |
| `mobile-dj-presslink.report.{json,html}` | Mobile (simulado, Lantern) | `/dj-presslink` (template `vibrant-festival`) |
| `desktop-dj-presslink.report.{json,html}` | Desktop | `/dj-presslink` |

O `.html` abre direto no navegador (sem servidor). O `.json` é a mesma execução em formato
legível por máquina — útil para comparar com uma rodada futura sem depender de screenshot.

## Metas da issue e resultado

| Critério | Meta | Medido |
| --- | --- | --- |
| Performance (mobile) | ≥ 80 | **98** |
| First Contentful Paint | < 2 s | **0,9 s** |
| Largest Contentful Paint | < 2,5 s | **2,4 s** |
| Acessibilidade | ≥ 90 | **100** |
| SEO | ≥ 90 | **100** |
| Best Practices | ≥ 90 | **100** |

Detalhe do relatório mobile commitado: TBT 60 ms, CLS 0,044, 0 erros no console,
`fetchpriority=high` no LCP, `lcp-discovery-insight` e `lcp-breakdown-insight` verdes.

## Todas as rotas públicas (mobile, 2 execuções cada)

| Rota | Template | Perf | FCP | LCP | TBT | CLS | A11y | SEO | BP |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | — | 100 / 100 | 0,9 s | 0,9 s | 70 ms | 0 | 100 | 100 | 100 |
| `/login` | — | 99 / 100 | 0,9 s | 0,9 s | 110 ms | 0 | 100 | 100 | 100 |
| `/dj-presslink` | vibrant-festival | 96 / 98 | 0,9 s | 2,6 s / 2,4 s | 90 ms | 0,044 | 100 | 100 | 100 |
| `/santo-bateu` | dark-minimal | 100 / 100 | 0,9 s | 0,9 s | 70 ms | 0 | 100 | 100 | 100 |
| `/salgado` | dark-minimal | 93 / 100 | 0,9 s | 0,9 s | 330 ms | 0 | 100 | 100 | 100 |
| `/leticio` | dark-minimal | 100 / 100 | 0,9 s | 0,9 s | 40 ms | 0 | 100 | 100 | 100 |

## Desktop (1 execução por rota)

| Rota | Perf | FCP | LCP | TBT | CLS | A11y | SEO | BP |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 0,3 s | 0,3 s | 0 ms | 0 | 100 | 100 | 100 |
| `/login` | 100 | 0,3 s | 0,3 s | 0 ms | 0 | 100 | 100 | 100 |
| `/dj-presslink` | 100 | 0,3 s | 0,5 s | 0 ms | 0,004 | 100 | 100 | 100 |
| `/santo-bateu` | 100 | 0,3 s | 0,3 s | 0 ms | 0,053 | 100 | 100 | 100 |
| `/salgado` | 100 | 0,3 s | 0,3 s | 0 ms | 0 | 100 | 100 | 100 |
| `/leticio` | 100 | 0,3 s | 0,3 s | 0 ms | 0 | 100 | 100 | 100 |

## Por que o `/dj-presslink` oscila entre 2,4 s e 2,6 s

É a única rota com foto de capa grande + galeria + vídeo no primeiro viewport. O modelo
Lantern do Lighthouse monta o caminho crítico pessimista a partir do **LCP observado**:
tudo que termina de baixar antes desse instante entra no grafo como bloqueante. Nas
execuções locais o LCP observado varia entre ~150 ms e ~250 ms, e essa diferença muda o
conjunto de recursos do grafo — daí o 2,4 s / 2,6 s. O valor mediano (4 de 5 execuções) é
2,4 s, que é o relatório commitado.

## Detalhe das rotas autenticadas

`/painel/*` não entra na auditoria automática porque exige sessão: o Lighthouse abre uma
janela anônima e cairia no `/login`. Para auditar o painel, rode o Lighthouse com um perfil
do Chrome já logado:

```bash
chrome --remote-debugging-port=9223 --user-data-dir=/tmp/perfil-logado
# faça login manualmente nessa janela e então:
npx lighthouse http://localhost:3000/painel --port=9223 --only-categories=performance,accessibility,seo,best-practices
```

## Como reproduzir

```bash
npm ci
npm run build
npx next start -p 3100

# mobile (mesmas flags do relatório commitado)
npx lighthouse http://localhost:3100/dj-presslink \
  --only-categories=performance,accessibility,seo,best-practices \
  --form-factor=mobile --output=json --output=html --output-path=lh-mobile

# desktop
npx lighthouse http://localhost:3100/dj-presslink --preset=desktop \
  --only-categories=performance,accessibility,seo,best-practices \
  --output=json --output=html --output-path=lh-desktop
```

Sem um Chrome já aberto com `--remote-debugging-port`, o Lighthouse abre e fecha a própria
instância. Para repetir as medições deste diretório foi usada uma instância fixa
(`msedge --headless=new --remote-debugging-port=9223`) e `--port=9223`, o que evita o custo
de subir o navegador em cada rodada.

## O que mudou para chegar aqui (resumo)

- **Imagem de LCP com `preload` explícito.** O `<Image priority>` do template roda dentro de
  um Client Component e o React não emite `<link rel="preload">` nesse caso: a foto da capa
  só era descoberta ao parsear o body (118 ms). A página pública agora chama `preload()` do
  `react-dom` com o **mesmo `sizes`** do template (`src/lib/template-hero.ts`).
- **AVIF + WebP** no otimizador (`images.formats`) e `minimumCacheTTL` de 31 dias — os
  arquivos do Storage têm UUID no nome, então o resultado nunca muda.
- **Miniaturas da galeria em `quality={55}`** e thumbnail do YouTube via `next/image`
  (antes era o JPG de 480 px cru, 20 KB, o maior arquivo da página).
- **Fonte do corpo = fonte do sistema.** O Inter variável custava 48,9 KB e entrava no caminho
  crítico. As fontes de destaque (Anton, Space Grotesk, Instrument Serif) continuam iguais.
- **Contraste**: letreiros decorativos passaram a ser `::before` (`data-marca`), textos
  `text-white/25` e `/30` subiram para `/50`, CTAs em `bg-fuchsia-600`, e o rótulo decorativo
  "Prévia de mídia" (dentro de bloco `aria-hidden`) saiu.
- **`Reveal` não esconde mais o conteúdo da primeira dobra** (a animação de entrada só é
  aplicada depois do primeiro paint) e o `useSearchParams` do login foi para um filho dentro
  de `Suspense`, mantendo `/` estática/ISR.
- **`zod` fora do bundle público**: `src/lib/embed.ts` (tipos e regex de mídia) não importa o
  validador; `/dj-presslink` caiu de 178 770 B para 153 402 B de JavaScript.
