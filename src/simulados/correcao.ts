import type { Alternativa, QuestaoBanco, Resultado, ResultadoArea, Tentativa } from './tipos'

/**
 * Correção local: compara as respostas com o gabarito oficial.
 * Não calcula nota TRI — só contagens objetivas de desempenho.
 */
export function corrigir(t: Tentativa, porId: Map<string, QuestaoBanco>): Resultado {
  const gabaritos: Record<string, Alternativa> = {}
  const porArea: ResultadoArea[] = t.blocos.map(({ area, inicio, fim }) => {
    const r: ResultadoArea = { area, total: 0, acertos: 0, erros: 0, brancos: 0 }
    for (const id of t.questoes.slice(inicio, fim + 1)) {
      const q = porId.get(id)
      if (!q) throw new Error(`Questão ${id} não encontrada no banco para correção.`)
      gabaritos[id] = q.g
      r.total++
      const resp = t.respostas[id]
      if (!resp) r.brancos++
      else if (resp === q.g) r.acertos++
      else r.erros++
    }
    return r
  })
  const soma = (k: keyof Omit<ResultadoArea, 'area'>) => porArea.reduce((s, a) => s + a[k], 0)
  const total = soma('total')
  const acertos = soma('acertos')
  return {
    total,
    acertos,
    erros: soma('erros'),
    brancos: soma('brancos'),
    percentual: total ? Math.round((acertos / total) * 1000) / 10 : 0,
    porArea,
    tempoMs: t.tempoMs,
    gabaritos,
  }
}

/** Finaliza: corrige e bloqueia alterações (devolve uma cópia nova). */
export function finalizar(t: Tentativa, porId: Map<string, QuestaoBanco>, agora = Date.now()): Tentativa {
  if (t.finalizadaEm) return t
  return { ...t, finalizadaEm: agora, atualizadaEm: agora, resultado: corrigir(t, porId) }
}

/** Aplica uma resposta respeitando o bloqueio após a finalização. */
export function responder(t: Tentativa, id: string, alt: Alternativa | null, agora = Date.now()): Tentativa {
  if (t.finalizadaEm) return t
  if (!t.questoes.includes(id)) return t
  const respostas = { ...t.respostas }
  if (alt) respostas[id] = alt
  else delete respostas[id]
  return { ...t, respostas, atualizadaEm: agora }
}

export function alternarRevisao(t: Tentativa, id: string): Tentativa {
  if (t.finalizadaEm) return t
  const revisar = t.revisar.includes(id) ? t.revisar.filter((x) => x !== id) : [...t.revisar, id]
  return { ...t, revisar, atualizadaEm: Date.now() }
}

export function formatarDuracao(ms: number, segundos = true) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return segundos ? `${h}:${p(m)}:${p(ss)}` : h ? `${h} h ${p(m)} min` : `${m} min`
}
