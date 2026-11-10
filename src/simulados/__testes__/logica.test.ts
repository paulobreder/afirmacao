import { describe, expect, it } from 'vitest'
import type { Area, QuestaoBanco, Tentativa } from '../tipos'
import { completoDisponivel, disponibilidade, escolherDistribuido, montarTentativa, rng } from '../sorteio'
import { alternarRevisao, corrigir, finalizar, responder } from '../correcao'
import { TempoEfetivo } from '../relogio'
import { calcularPainel } from '../painel'

// Banco sintético (só para testar a lógica; não é publicado)
function banco(area: Area, n: number, extra: Partial<QuestaoBanco> = {}, prefixo = ''): QuestaoBanco[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${2016 + (i % 10)}-${area}-${prefixo}${String(i).padStart(3, '0')}`,
    ano: 2016 + (i % 10),
    n: i + 1,
    l: null,
    g: (['A', 'B', 'C', 'D', 'E'] as const)[i % 5],
    img: [[`x/${i}.webp`, 600, 400]],
    txt: 'texto',
    ...extra,
  }))
}
const bancos = (): Record<Area, QuestaoBanco[]> => ({
  LC: [...banco('LC', 120), ...banco('LC', 12, { l: 'ingles' }, 'ing'), ...banco('LC', 12, { l: 'espanhol' }, 'esp')],
  CH: banco('CH', 100),
  CN: banco('CN', 100),
  MT: banco('MT', 100),
})

describe('sorteio', () => {
  it('monta o 1º dia com 90 questões: 5 da língua escolhida + 40 de LC + 45 de CH, sem repetição', () => {
    const b = bancos()
    const t = montarTentativa(b, { dia: 1, lingua: 'espanhol', modalidade: 'completo', semente: 7 })
    expect(t.questoes).toHaveLength(90)
    expect(new Set(t.questoes).size).toBe(90)
    const porId = new Map(Object.values(b).flat().map((q) => [q.id, q]))
    const lc = t.questoes.slice(0, 45).map((id) => porId.get(id)!)
    expect(lc.slice(0, 5).every((q) => q.l === 'espanhol')).toBe(true)
    expect(lc.slice(5).every((q) => q.l === null && q.id.includes('-LC-'))).toBe(true)
    expect(t.questoes.slice(45).every((id) => id.includes('-CH-'))).toBe(true)
    expect(t.blocos).toEqual([
      { area: 'LC', inicio: 0, fim: 44 },
      { area: 'CH', inicio: 45, fim: 89 },
    ])
  })

  it('monta o 2º dia com 45 de CN e 45 de MT e sem língua estrangeira', () => {
    const t = montarTentativa(bancos(), { dia: 2, lingua: null, modalidade: 'completo', semente: 3 })
    expect(t.lingua).toBeNull()
    expect(t.questoes.filter((id) => id.includes('-CN-'))).toHaveLength(45)
    expect(t.questoes.filter((id) => id.includes('-MT-'))).toHaveLength(45)
  })

  it('distribui as questões entre vários anos', () => {
    const t = montarTentativa(bancos(), { dia: 2, lingua: null, modalidade: 'completo', semente: 11 })
    const anos = new Set(t.questoes.map((id) => id.slice(0, 4)))
    expect(anos.size).toBe(10)
  })

  it('prioriza questões ainda não vistas', () => {
    const pool = banco('CN', 60)
    const vistas = new Set(pool.slice(0, 30).map((q) => q.id))
    const escolhidas = escolherDistribuido(pool, 30, vistas, rng(1))
    expect(escolhidas.every((q) => !vistas.has(q.id))).toBe(true)
  })

  it('não inventa questões: recusa o simulado completo quando o banco é insuficiente', () => {
    const b = bancos()
    b.MT = banco('MT', 20)
    expect(completoDisponivel(2, null, b)).toBe(false)
    expect(disponibilidade(2, null, b).find((d) => d.area === 'MT')).toMatchObject({ necessario: 45, disponivel: 20 })
    expect(() => montarTentativa(b, { dia: 2, lingua: null, modalidade: 'completo' })).toThrow()
    const treino = montarTentativa(b, { dia: 2, lingua: null, modalidade: 'treino', porAreaTreino: 10, semente: 2 })
    expect(treino.modalidade).toBe('treino')
    expect(treino.questoes).toHaveLength(20)
  })

  it('exige a escolha da língua no 1º dia', () => {
    expect(() => montarTentativa(bancos(), { dia: 1, lingua: null, modalidade: 'completo' })).toThrow(/inglês ou espanhol/)
  })

  it('é reprodutível com a mesma semente', () => {
    const a = montarTentativa(bancos(), { dia: 2, lingua: null, modalidade: 'completo', semente: 99, agora: 1 })
    const b = montarTentativa(bancos(), { dia: 2, lingua: null, modalidade: 'completo', semente: 99, agora: 1 })
    expect(a.questoes).toEqual(b.questoes)
  })
})

describe('correção', () => {
  const b = bancos()
  const porId = new Map(Object.values(b).flat().map((q) => [q.id, q]))
  const base = (): Tentativa => montarTentativa(b, { dia: 2, lingua: null, modalidade: 'completo', semente: 5 })

  it('conta acertos, erros, brancos e percentual por área', () => {
    let t = base()
    const [q1, q2, q3] = t.questoes
    t = responder(t, q1, porId.get(q1)!.g)
    t = responder(t, q2, porId.get(q2)!.g === 'A' ? 'B' : 'A')
    t = responder(t, q3, porId.get(q3)!.g)
    const r = corrigir({ ...t, tempoMs: 1234 }, porId)
    expect(r).toMatchObject({ total: 90, acertos: 2, erros: 1, brancos: 87, tempoMs: 1234 })
    expect(r.percentual).toBeCloseTo(2.2, 1)
    expect(r.porArea[0]).toMatchObject({ area: 'CN', total: 45, acertos: 2, erros: 1, brancos: 42 })
    expect(Object.keys(r.gabaritos)).toHaveLength(90)
  })

  it('permite apagar uma resposta (deixar em branco)', () => {
    let t = base()
    t = responder(t, t.questoes[0], 'C')
    t = responder(t, t.questoes[0], null)
    expect(t.respostas).toEqual({})
  })

  it('bloqueia alterações depois de finalizar', () => {
    let t = base()
    t = responder(t, t.questoes[0], 'A')
    t = finalizar(t, porId, 1000)
    expect(t.finalizadaEm).toBe(1000)
    expect(responder(t, t.questoes[0], 'B').respostas[t.questoes[0]]).toBe('A')
    expect(alternarRevisao(t, t.questoes[1]).revisar).toEqual([])
    expect(finalizar(t, porId, 2000).finalizadaEm).toBe(1000)
  })

  it('ignora respostas para questões fora da tentativa', () => {
    const t = base()
    expect(responder(t, 'inexistente', 'A')).toBe(t)
  })
})

describe('cronômetro (tempo efetivo)', () => {
  it('soma só o tempo com a página aberta e retoma do valor salvo', () => {
    const r = new TempoEfetivo(60_000)
    r.iniciar(1000)
    expect(r.valor(4000)).toBe(63_000)
    expect(r.pausar(5000)).toBe(64_000)
    // página fechada por 1 hora: não conta
    r.iniciar(3_605_000)
    expect(r.valor(3_606_000)).toBe(65_000)
    const retomado = new TempoEfetivo(r.pausar(3_606_000))
    expect(retomado.valor(0)).toBe(65_000)
  })
  it('iniciar duas vezes não duplica o tempo', () => {
    const r = new TempoEfetivo()
    r.iniciar(0)
    r.iniciar(500)
    expect(r.pausar(1000)).toBe(1000)
  })
})

describe('painel de desempenho', () => {
  it('fica vazio sem histórico (sem dados fictícios)', () => {
    const p = calcularPainel([], [])
    expect(p).toMatchObject({ simulados: 0, questoes: 0, acertos: 0, percentual: 0, redacoesConcluidas: 0 })
    expect(p.evolucao).toEqual([])
    expect(p.atividades).toEqual([])
  })
  it('agrega simulados finalizados e ignora os em andamento', () => {
    const b = bancos()
    const porId = new Map(Object.values(b).flat().map((q) => [q.id, q]))
    let t1 = montarTentativa(b, { dia: 2, lingua: null, modalidade: 'completo', semente: 1, id: 'a', agora: 1 })
    t1 = finalizar(responder(t1, t1.questoes[0], porId.get(t1.questoes[0])!.g), porId, 10)
    let t2 = montarTentativa(b, { dia: 2, lingua: null, modalidade: 'treino', porAreaTreino: 5, semente: 2, id: 'b', agora: 2 })
    t2 = finalizar(t2, porId, 20)
    const t3 = montarTentativa(b, { dia: 2, lingua: null, modalidade: 'completo', semente: 3, id: 'c', agora: 3 })
    const p = calcularPainel([t3, t2, t1], [
      { id: 'r1', temaId: 'T001', texto: 'x', criadaEm: 1, atualizadaEm: 1, finalizadaEm: 5, tempoMs: 0, cronometro: false, tentativaId: null, autoavaliacao: {} },
      { id: 'r2', temaId: 'T002', texto: '', criadaEm: 2, atualizadaEm: 2, finalizadaEm: null, tempoMs: 0, cronometro: false, tentativaId: null, autoavaliacao: {} },
    ])
    expect(p).toMatchObject({ simulados: 2, completos: 1, treinos: 1, questoes: 100, acertos: 1, respondidas: 1, redacoesConcluidas: 1 })
    expect(p.temasPraticados).toEqual(['T001'])
    expect(p.evolucao.map((e) => e.valor)).toEqual([1.1, 0])
    expect(p.atividades).toHaveLength(5)
  })
})
