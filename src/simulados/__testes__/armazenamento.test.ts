import { beforeEach, describe, expect, it } from 'vitest'
import { _reiniciarConexao, novaRedacao, questoesVistas, redacoes, tentativas } from '../db'
import { gerarBackup, restaurarBackup, validarBackup } from '../backup'
import type { Tentativa } from '../tipos'

function tentativa(id: string, extra: Partial<Tentativa> = {}): Tentativa {
  return {
    id, dia: 2, modalidade: 'completo', lingua: null, questoes: ['2020-CN-091', '2021-MT-140'],
    blocos: [{ area: 'CN', inicio: 0, fim: 0 }, { area: 'MT', inicio: 1, fim: 1 }],
    respostas: {}, revisar: [], atual: 0, tempoMs: 0, duracaoRefMs: 1, criadaEm: 1, atualizadaEm: 1,
    finalizadaEm: null, resultado: null, temaRedacao: null, redacaoId: null, ...extra,
  }
}

beforeEach(async () => {
  await _reiniciarConexao()
  indexedDB.deleteDatabase('afirmacao-simulados')
})

describe('persistência das tentativas', () => {
  it('salva e retoma a tentativa com as mesmas questões, respostas e tempo', async () => {
    await tentativas.salvar(tentativa('t1', { respostas: { '2020-CN-091': 'C' }, tempoMs: 42_000, atual: 1 }))
    await _reiniciarConexao() // simula fechar e reabrir o navegador
    const t = await tentativas.obter('t1')
    expect(t?.questoes).toEqual(['2020-CN-091', '2021-MT-140'])
    expect(t?.respostas).toEqual({ '2020-CN-091': 'C' })
    expect(t?.tempoMs).toBe(42_000)
    expect(t?.atual).toBe(1)
  })
  it('lista da mais recente para a mais antiga e informa questões vistas', async () => {
    await tentativas.salvar(tentativa('a', { criadaEm: 1 }))
    await tentativas.salvar(tentativa('b', { criadaEm: 2, questoes: ['2016-CH-001'] }))
    expect((await tentativas.listar()).map((t) => t.id)).toEqual(['b', 'a'])
    expect([...(await questoesVistas())].sort()).toEqual(['2016-CH-001', '2020-CN-091', '2021-MT-140'])
  })
})

describe('salvamento das redações', () => {
  it('cria, atualiza e recupera o texto', async () => {
    const r = await novaRedacao('T010')
    await redacoes.salvar({ ...r, texto: 'Primeiro parágrafo.', atualizadaEm: r.atualizadaEm + 1 })
    await _reiniciarConexao()
    expect((await redacoes.obter(r.id))?.texto).toBe('Primeiro parágrafo.')
  })
})

describe('exportação e importação', () => {
  it('exporta e restaura o histórico (substituindo)', async () => {
    await tentativas.salvar(tentativa('x'))
    await novaRedacao('T001')
    const json = JSON.stringify(await gerarBackup(new Date(0)))
    indexedDB.deleteDatabase('afirmacao-simulados')
    await _reiniciarConexao()
    await tentativas.salvar(tentativa('outra'))
    const v = validarBackup(json)
    expect(v.ok).toBe(true)
    await restaurarBackup(v.backup!, true)
    expect((await tentativas.listar()).map((t) => t.id)).toEqual(['x'])
    expect(await redacoes.listar()).toHaveLength(1)
  })
  it('mescla mantendo a versão mais recente de cada registro', async () => {
    await tentativas.salvar(tentativa('m', { atualizadaEm: 10, tempoMs: 10 }))
    const b = await gerarBackup()
    b.tentativas[0] = { ...b.tentativas[0], atualizadaEm: 5, tempoMs: 5 }
    b.tentativas.push(tentativa('novo'))
    await restaurarBackup(b, false)
    expect((await tentativas.obter('m'))?.tempoMs).toBe(10)
    expect(await tentativas.obter('novo')).toBeTruthy()
  })
  it('recusa arquivos inválidos sem gravar nada', async () => {
    expect(validarBackup('não é json').ok).toBe(false)
    expect(validarBackup(JSON.stringify({ app: 'outro' })).ok).toBe(false)
    const ruim = { app: 'afirmacao', versao: 1, exportadoEm: '', tentativas: [{ id: 1 }], redacoes: [] }
    expect(validarBackup(JSON.stringify(ruim))).toMatchObject({ ok: false })
    const respostaInvalida = { app: 'afirmacao', versao: 1, exportadoEm: '', tentativas: [tentativa('z', { respostas: { q: 'F' as never } })], redacoes: [] }
    expect(validarBackup(JSON.stringify(respostaInvalida)).ok).toBe(false)
    expect(validarBackup(JSON.stringify({ app: 'afirmacao', versao: 99, tentativas: [], redacoes: [] })).ok).toBe(false)
  })
})
