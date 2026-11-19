/**
 * Sparkline sem eixos: só a forma da série no período. Puro SVG, sem estado —
 * pode ser renderizado no servidor. A área é preenchida com 12% da cor.
 */
export function Sparkline({
  dados,
  id,
  cor = "#d018f6",
  className,
}: {
  dados: number[];
  /** Id único do gradiente (não use o mesmo em duas sparklines na página). */
  id: string;
  cor?: string;
  className?: string;
}) {
  const valores = dados.length > 0 ? dados : [0, 0];
  const maximo = Math.max(1, ...valores);
  const largura = 120;
  const altura = 36;
  const passo = valores.length > 1 ? largura / (valores.length - 1) : largura;

  const pontos = valores.map((valor, indice) => ({
    x: indice * passo,
    y: altura - (valor / maximo) * (altura - 4) - 2,
  }));

  const linha = pontos.map((ponto) => `${ponto.x.toFixed(1)},${ponto.y.toFixed(1)}`).join(" ");
  const area = `M 0 ${altura} L ${linha.replace(/ /g, " L ")} L ${largura} ${altura} Z`;

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={cor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} className="pl-fade" />
      <g className="pl-draw">
        <polyline
          points={linha}
          fill="none"
          stroke={cor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}
