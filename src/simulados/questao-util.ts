import type { Alternativa, Area, QuestaoBanco } from './tipos'

export const ALTERNATIVAS: Alternativa[] = ['A', 'B', 'C', 'D', 'E']

export function origemQuestao(q: QuestaoBanco, area: Area) {
  const dia = q.ano === 2016 ? (area === 'CH' || area === 'CN' ? 1 : 2) : area === 'LC' || area === 'CH' ? 1 : 2
  const lingua = q.l === 'ingles' ? ' · Inglês' : q.l === 'espanhol' ? ' · Espanhol' : ''
  return `ENEM ${q.ano} · ${dia}º dia · Caderno ${dia === 1 ? 1 : 7} Azul · Questão ${q.n}${lingua}`
}

