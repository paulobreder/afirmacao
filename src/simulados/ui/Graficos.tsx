/** Gráficos simples em SVG/HTML, sem biblioteca: legíveis, responsivos e com alternativa em texto. */

export function Indicador({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line">
      <p className="text-sm font-medium text-ink-muted">{rotulo}</p>
      <p className="mt-1 font-display text-[2rem] leading-none font-extrabold text-ink tabular-nums">{valor}</p>
      {detalhe && <p className="mt-2 text-sm text-ink-subtle">{detalhe}</p>}
    </div>
  )
}

/** Barras horizontais de percentual (0–100), rotuladas diretamente. */
export function BarrasPercentual({ itens, titulo }: { itens: { rotulo: string; valor: number; detalhe: string }[]; titulo: string }) {
  return (
    <figure>
      <figcaption className="sr-only">{titulo}</figcaption>
      <ul className="space-y-4">
        {itens.map((i) => (
          <li key={i.rotulo}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-ink">{i.rotulo}</span>
              <span className="text-ink-muted tabular-nums">
                <strong className="font-display text-base text-ink">{i.valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong> · {i.detalhe}
              </span>
            </div>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-paper ring-1 ring-line" aria-hidden>
              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(0, Math.min(100, i.valor))}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/** Linha de evolução do percentual de acertos por simulado (ordem cronológica). */
export function LinhaEvolucao({ pontos }: { pontos: { rotulo: string; valor: number }[] }) {
  const W = 640
  const H = 220
  const m = { t: 16, r: 16, b: 34, l: 40 }
  const iw = W - m.l - m.r
  const ih = H - m.t - m.b
  const x = (i: number) => m.l + (pontos.length === 1 ? iw / 2 : (i * iw) / (pontos.length - 1))
  const y = (v: number) => m.t + ih - (v / 100) * ih
  const caminho = pontos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ')
  const resumo =
    pontos.length > 1
      ? `De ${pontos[0].valor.toLocaleString('pt-BR')}% no primeiro simulado para ${pontos[pontos.length - 1].valor.toLocaleString('pt-BR')}% no mais recente.`
      : `Um simulado concluído, com ${pontos[0]?.valor.toLocaleString('pt-BR')}% de acertos.`
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Evolução do percentual de acertos. ${resumo}`}>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="var(--color-line)" strokeWidth={1} />
            <text x={m.l - 8} y={y(v) + 4} textAnchor="end" fontSize={12} fill="var(--color-ink-subtle)">
              {v}%
            </text>
          </g>
        ))}
        <path d={caminho} fill="none" stroke="var(--color-brand)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {pontos.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.valor)} r={5} fill="white" stroke="var(--color-brand)" strokeWidth={3}>
              <title>{`${p.rotulo}: ${p.valor.toLocaleString('pt-BR')}%`}</title>
            </circle>
            {(pontos.length <= 8 || i === pontos.length - 1 || i === 0) && (
              <text x={x(i)} y={H - 10} textAnchor="middle" fontSize={11} fill="var(--color-ink-subtle)">
                {p.rotulo}
              </text>
            )}
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-sm text-ink-muted">{resumo}</figcaption>
    </figure>
  )
}
