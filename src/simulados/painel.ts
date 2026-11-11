import type { Area, Redacao, ResultadoArea, Tentativa } from './tipos'
import { temaPorId } from './redacao/temas'

export interface Painel {
  simulados: number
  completos: number
  treinos: number
  questoes: number
  respondidas: number
  acertos: number
  percentual: number
  tempoMedioMs: number
  porArea: ResultadoArea[]
  evolucao: { rotulo: string; valor: number }[]
  redacoesConcluidas: number
  temasPraticados: string[]
  atividades: { id: string; data: number; titulo: string; detalhe: string; link: string }[]
}

/** Indicadores do painel calculados só a partir de dados reais salvos (nunca fictícios). */
export function calcularPainel(ts: Tentativa[], rs: Redacao[]): Painel {
  const feitas = ts.filter((t) => t.finalizadaEm && t.resultado).sort((a, b) => a.finalizadaEm! - b.finalizadaEm!)
  const somaArea = new Map<Area, ResultadoArea>()
  for (const t of feitas)
    for (const a of t.resultado!.porArea) {
      const s = somaArea.get(a.area) ?? { area: a.area, total: 0, acertos: 0, erros: 0, brancos: 0 }
      s.total += a.total
      s.acertos += a.acertos
      s.erros += a.erros
      s.brancos += a.brancos
      somaArea.set(a.area, s)
    }
  const questoes = feitas.reduce((s, t) => s + t.resultado!.total, 0)
  const brancos = feitas.reduce((s, t) => s + t.resultado!.brancos, 0)
  const acertos = feitas.reduce((s, t) => s + t.resultado!.acertos, 0)
  const concluidas = rs.filter((r) => r.finalizadaEm)
  const ordem: Area[] = ['LC', 'CH', 'CN', 'MT']

  const atividades = [
    ...ts.map((t) => ({
      id: t.id,
      data: t.finalizadaEm ?? t.atualizadaEm,
      titulo: `Simulado do ${t.dia}º dia${t.modalidade === 'treino' ? ' (treino)' : ''}`,
      detalhe: t.resultado ? `${t.resultado.acertos} de ${t.resultado.total} acertos` : 'Em andamento',
      link: t.finalizadaEm ? `/simulados/resultado/${t.id}` : `/simulados/prova/${t.id}`,
    })),
    ...rs.filter((r) => r.texto.trim() || r.finalizadaEm).map((r) => ({
      id: r.id,
      data: r.finalizadaEm ?? r.atualizadaEm,
      titulo: `Redação: ${temaPorId(r.temaId)?.titulo ?? r.temaId}`,
      detalhe: r.finalizadaEm ? 'Concluída' : 'Rascunho',
      link: `/simulados/redacao/${r.id}`,
    })),
  ].sort((a, b) => b.data - a.data)

  return {
    simulados: feitas.length,
    completos: feitas.filter((t) => t.modalidade === 'completo').length,
    treinos: feitas.filter((t) => t.modalidade === 'treino').length,
    questoes,
    respondidas: questoes - brancos,
    acertos,
    percentual: questoes ? Math.round((acertos / questoes) * 1000) / 10 : 0,
    tempoMedioMs: feitas.length ? feitas.reduce((s, t) => s + t.resultado!.tempoMs, 0) / feitas.length : 0,
    porArea: ordem.filter((a) => somaArea.has(a)).map((a) => somaArea.get(a)!),
    evolucao: feitas.map((t) => ({
      rotulo: new Date(t.finalizadaEm!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      valor: t.resultado!.percentual,
    })),
    redacoesConcluidas: concluidas.length,
    temasPraticados: [...new Set(concluidas.map((r) => r.temaId))],
    atividades,
  }
}
