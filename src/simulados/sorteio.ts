import type { Area, Dia, Lingua, QuestaoBanco, Tentativa, Modalidade } from './tipos'
import { AREAS_DIA, DURACAO_REF_MS, QUESTOES_LINGUA, QUESTOES_POR_AREA } from './tipos'

/** Gerador pseudoaleatório com semente (mulberry32): sorteios reprodutíveis nos testes. */
export function rng(semente: number) {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function embaralhar<T>(lista: T[], aleatorio: () => number): T[] {
  const a = lista.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Escolhe `qtd` itens distribuídos entre os anos (rodízio por ano), preferindo
 * questões que o estudante ainda não viu. Nunca repete um item.
 */
export function escolherDistribuido(pool: QuestaoBanco[], qtd: number, vistas: Set<string>, aleatorio: () => number): QuestaoBanco[] {
  const unicos = [...new Map(pool.map((q) => [q.id, q])).values()]
  const novas = unicos.filter((q) => !vistas.has(q.id))
  const antigas = unicos.filter((q) => vistas.has(q.id))
  const escolhidas: QuestaoBanco[] = []
  for (const grupo of [novas, antigas]) {
    if (escolhidas.length >= qtd) break
    const porAno = new Map<number, QuestaoBanco[]>()
    for (const q of embaralhar(grupo, aleatorio)) {
      porAno.set(q.ano, [...(porAno.get(q.ano) ?? []), q])
    }
    const anos = embaralhar([...porAno.keys()], aleatorio)
    while (escolhidas.length < qtd && anos.some((a) => porAno.get(a)!.length)) {
      for (const a of anos) {
        const fila = porAno.get(a)!
        if (fila.length && escolhidas.length < qtd) escolhidas.push(fila.shift()!)
      }
    }
  }
  return escolhidas
}

export interface Disponibilidade {
  area: Area
  necessario: number
  disponivel: number
}

/** Quantas questões validadas existem por área para a prova escolhida. */
export function disponibilidade(dia: Dia, lingua: Lingua | null, bancos: Record<Area, QuestaoBanco[]>): Disponibilidade[] {
  return AREAS_DIA[dia].flatMap((area): Disponibilidade[] => {
    const b = bancos[area] ?? []
    if (area === 'LC') {
      return [
        { area, necessario: QUESTOES_LINGUA, disponivel: b.filter((q) => q.l === lingua).length },
        { area, necessario: QUESTOES_POR_AREA - QUESTOES_LINGUA, disponivel: b.filter((q) => !q.l).length },
      ]
    }
    return [{ area, necessario: QUESTOES_POR_AREA, disponivel: b.length }]
  })
}

export function completoDisponivel(dia: Dia, lingua: Lingua | null, bancos: Record<Area, QuestaoBanco[]>) {
  return disponibilidade(dia, lingua, bancos).every((d) => d.disponivel >= d.necessario)
}

export interface OpcoesSorteio {
  dia: Dia
  lingua: Lingua | null
  modalidade: Modalidade
  /** Itens por área no treino reduzido. */
  porAreaTreino?: number
  vistas?: Set<string>
  semente?: number
  agora?: number
  id?: string
}

/** Monta uma tentativa nova. Lança erro se o banco não tiver itens suficientes (nunca inventa questões). */
export function montarTentativa(bancos: Record<Area, QuestaoBanco[]>, o: OpcoesSorteio): Tentativa {
  const aleatorio = rng(o.semente ?? Math.floor(Math.random() * 2 ** 31))
  const vistas = o.vistas ?? new Set<string>()
  const treino = o.modalidade === 'treino'
  if (o.dia === 1 && !o.lingua) throw new Error('Escolha inglês ou espanhol para o primeiro dia.')
  if (!treino && !completoDisponivel(o.dia, o.lingua, bancos)) {
    throw new Error('O banco validado ainda não tem questões suficientes para o simulado completo.')
  }
  const questoes: string[] = []
  const blocos: Tentativa['blocos'] = []
  for (const area of AREAS_DIA[o.dia]) {
    const b = bancos[area] ?? []
    const inicio = questoes.length
    let alvo = treino ? Math.min(o.porAreaTreino ?? 10, QUESTOES_POR_AREA) : QUESTOES_POR_AREA
    if (area === 'LC') {
      // As 5 de língua estrangeira (da língua escolhida) abrem a prova, como no ENEM.
      const nLingua = treino ? Math.min(QUESTOES_LINGUA, Math.max(1, Math.round(alvo / 9))) : QUESTOES_LINGUA
      const lingua = escolherDistribuido(b.filter((q) => q.l === o.lingua), nLingua, vistas, aleatorio)
      const resto = escolherDistribuido(b.filter((q) => !q.l), alvo - lingua.length, vistas, aleatorio)
      questoes.push(...lingua.map((q) => q.id), ...resto.map((q) => q.id))
      alvo = lingua.length + resto.length
    } else {
      questoes.push(...escolherDistribuido(b, alvo, vistas, aleatorio).map((q) => q.id))
    }
    if (questoes.length > inicio) blocos.push({ area, inicio, fim: questoes.length - 1 })
  }
  if (!questoes.length) throw new Error('Ainda não há questões validadas para esta prova.')
  const agora = o.agora ?? Date.now()
  return {
    id: o.id ?? `t-${agora.toString(36)}-${Math.floor(aleatorio() * 1e6).toString(36)}`,
    dia: o.dia,
    modalidade: o.modalidade,
    lingua: o.dia === 1 ? o.lingua : null,
    questoes,
    blocos,
    respostas: {},
    revisar: [],
    atual: 0,
    tempoMs: 0,
    duracaoRefMs: treino ? Math.round((DURACAO_REF_MS[o.dia] * questoes.length) / 90) : DURACAO_REF_MS[o.dia],
    criadaEm: agora,
    atualizadaEm: agora,
    finalizadaEm: null,
    resultado: null,
    temaRedacao: null,
    redacaoId: null,
  }
}
