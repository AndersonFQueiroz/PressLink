/**
 * Carregamento da Visão geral no mesmo ritmo do palco: topo, faixa de
 * prontidão e números, gráfico e listas — tudo encostado nas bordas, como o
 * conteúdo real.
 */
export default function PainelLoading() {
  return (
    <div aria-busy="true" aria-label="Carregando painel">
      <div className="px-5 pb-1 pt-5 sm:px-6 sm:pt-6">
        <div className="h-3 w-16 rounded bg-white/[0.05]" />
        <div className="mt-2 h-8 w-48 rounded bg-white/[0.07]" />
        <div className="mt-3 h-3 w-full max-w-[420px] rounded bg-white/[0.04]" />
      </div>

      <div className="pl-shimmer">
        <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
          <div className="h-14 w-14 rounded-full bg-white/[0.06]" />
          <div className="min-w-0 flex-1">
            <div className="h-5 w-44 rounded bg-white/[0.07]" />
            <div className="mt-2 h-3 w-64 rounded bg-white/[0.04]" />
          </div>
          <div className="h-8 w-32 rounded bg-white/[0.05]" />
        </div>

        <div className="grid border-t border-white/[0.06] lg:grid-cols-12">
          <div className="border-b border-white/[0.06] p-5 lg:col-span-4 lg:border-b-0 lg:border-r">
            <div className="h-4 w-24 rounded bg-white/[0.06]" />
            <div className="mt-5 flex items-center gap-4">
              <div className="h-[92px] w-[92px] rounded-full bg-white/[0.05]" />
              <div className="flex-1">
                <div className="h-3 w-full rounded bg-white/[0.05]" />
                <div className="mt-2 h-3 w-4/5 rounded bg-white/[0.04]" />
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 lg:col-span-8">
            {[0, 1, 2].map((indice) => (
              <div
                key={indice}
                className="border-b border-white/[0.06] p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <div className="h-3 w-20 rounded bg-white/[0.05]" />
                <div className="mt-3 h-8 w-24 rounded bg-white/[0.07]" />
                <div className="mt-3 h-9 w-full rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid border-t border-white/[0.06] lg:grid-cols-12">
          <div className="h-72 border-b border-white/[0.06] p-5 lg:col-span-8 lg:border-b-0 lg:border-r" />
          <div className="h-72 p-5 lg:col-span-4" />
        </div>
      </div>
    </div>
  );
}
