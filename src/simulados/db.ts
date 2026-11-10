import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Redacao, Tentativa } from './tipos'

/**
 * Armazenamento local (IndexedDB). Nada sai do dispositivo: sem login,
 * sem servidor. Se o navegador apagar os dados do site, o histórico se perde —
 * por isso existe o backup em JSON (backup.ts).
 */
interface Esquema extends DBSchema {
  tentativas: { key: string; value: Tentativa; indexes: { criadaEm: number } }
  redacoes: { key: string; value: Redacao; indexes: { criadaEm: number } }
  meta: { key: string; value: { chave: string; valor: unknown } }
}

const NOME = 'afirmacao-simulados'
let conexao: Promise<IDBPDatabase<Esquema>> | null = null

export function db() {
  conexao ??= openDB<Esquema>(NOME, 1, {
    upgrade(d) {
      d.createObjectStore('tentativas', { keyPath: 'id' }).createIndex('criadaEm', 'criadaEm')
      d.createObjectStore('redacoes', { keyPath: 'id' }).createIndex('criadaEm', 'criadaEm')
      d.createObjectStore('meta', { keyPath: 'chave' })
    },
  })
  return conexao
}

/** Só para testes: fecha e esquece a conexão. */
export async function _reiniciarConexao() {
  if (conexao) (await conexao).close()
  conexao = null
}

export const tentativas = {
  salvar: async (t: Tentativa) => void (await (await db()).put('tentativas', t)),
  obter: async (id: string) => (await db()).get('tentativas', id),
  listar: async () => (await (await db()).getAllFromIndex('tentativas', 'criadaEm')).reverse(),
  remover: async (id: string) => (await db()).delete('tentativas', id),
}

export const redacoes = {
  salvar: async (r: Redacao) => void (await (await db()).put('redacoes', r)),
  obter: async (id: string) => (await db()).get('redacoes', id),
  listar: async () => (await (await db()).getAllFromIndex('redacoes', 'criadaEm')).reverse(),
  remover: async (id: string) => (await db()).delete('redacoes', id),
}

export const meta = {
  async obter<T>(chave: string, padrao: T): Promise<T> {
    const r = await (await db()).get('meta', chave)
    return (r?.valor as T) ?? padrao
  },
  async definir(chave: string, valor: unknown) {
    await (await db()).put('meta', { chave, valor })
  },
}

/** Questões já vistas em simulados anteriores (para evitar repetições recentes). */
export async function questoesVistas(limiteTentativas = 6): Promise<Set<string>> {
  const ts = await tentativas.listar()
  return new Set(ts.slice(0, limiteTentativas).flatMap((t) => t.questoes))
}

/** Temas de redação usados recentemente. */
export async function temasRecentes(limite = 15): Promise<string[]> {
  const rs = await redacoes.listar()
  return rs.slice(0, limite).map((r) => r.temaId)
}

export async function novaRedacao(temaId: string, tentativaId: string | null = null): Promise<Redacao> {
  const agora = Date.now()
  const r: Redacao = { id: `r-${agora.toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`, temaId, texto: '', criadaEm: agora, atualizadaEm: agora, finalizadaEm: null, tempoMs: 0, cronometro: false, tentativaId, autoavaliacao: {} }
  await redacoes.salvar(r)
  return r
}
