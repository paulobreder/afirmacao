import type { Redacao, Tentativa } from './tipos'
import { db, redacoes, tentativas } from './db'

export const VERSAO_BACKUP = 1

export interface Backup {
  app: 'afirmacao'
  versao: number
  exportadoEm: string
  tentativas: Tentativa[]
  redacoes: Redacao[]
}

export async function gerarBackup(agora = new Date()): Promise<Backup> {
  return {
    app: 'afirmacao',
    versao: VERSAO_BACKUP,
    exportadoEm: agora.toISOString(),
    tentativas: await tentativas.listar(),
    redacoes: await redacoes.listar(),
  }
}

const ehObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const ALT = /^[A-E]$/

function tentativaValida(t: unknown): t is Tentativa {
  if (!ehObj(t)) return false
  return (
    typeof t.id === 'string' &&
    (t.dia === 1 || t.dia === 2) &&
    Array.isArray(t.questoes) &&
    t.questoes.every((q) => typeof q === 'string') &&
    Array.isArray(t.blocos) &&
    ehObj(t.respostas) &&
    Object.values(t.respostas).every((v) => typeof v === 'string' && ALT.test(v)) &&
    Array.isArray(t.revisar) &&
    typeof t.tempoMs === 'number' &&
    typeof t.criadaEm === 'number'
  )
}

function redacaoValida(r: unknown): r is Redacao {
  if (!ehObj(r)) return false
  return typeof r.id === 'string' && typeof r.temaId === 'string' && typeof r.texto === 'string' && typeof r.criadaEm === 'number'
}

export interface Validacao {
  ok: boolean
  erro?: string
  backup?: Backup
}

/** Valida um arquivo de backup antes de qualquer gravação. */
export function validarBackup(texto: string): Validacao {
  let dados: unknown
  try {
    dados = JSON.parse(texto)
  } catch {
    return { ok: false, erro: 'O arquivo não é um JSON válido.' }
  }
  if (!ehObj(dados) || dados.app !== 'afirmacao') return { ok: false, erro: 'Este arquivo não é um backup da AfirmAção.' }
  if (typeof dados.versao !== 'number' || dados.versao > VERSAO_BACKUP) {
    return { ok: false, erro: 'Versão de backup não reconhecida.' }
  }
  if (!Array.isArray(dados.tentativas) || !Array.isArray(dados.redacoes)) return { ok: false, erro: 'O backup está incompleto.' }
  const ruins = dados.tentativas.filter((t) => !tentativaValida(t)).length + dados.redacoes.filter((r) => !redacaoValida(r)).length
  if (ruins) return { ok: false, erro: `O backup tem ${ruins} registro(s) corrompido(s); nada foi importado.` }
  return { ok: true, backup: dados as unknown as Backup }
}

/**
 * Restaura um backup já validado. `substituir` apaga o histórico atual antes;
 * caso contrário, mescla (registros com o mesmo ID ficam com a versão mais recente).
 */
export async function restaurarBackup(b: Backup, substituir: boolean) {
  const d = await db()
  const tx = d.transaction(['tentativas', 'redacoes'], 'readwrite')
  if (substituir) {
    await tx.objectStore('tentativas').clear()
    await tx.objectStore('redacoes').clear()
  }
  for (const t of b.tentativas) {
    const atual = substituir ? undefined : await tx.objectStore('tentativas').get(t.id)
    if (!atual || (atual.atualizadaEm ?? 0) <= (t.atualizadaEm ?? 0)) await tx.objectStore('tentativas').put(t)
  }
  for (const r of b.redacoes) {
    const atual = substituir ? undefined : await tx.objectStore('redacoes').get(r.id)
    if (!atual || (atual.atualizadaEm ?? 0) <= (r.atualizadaEm ?? 0)) await tx.objectStore('redacoes').put(r)
  }
  await tx.done
  return { tentativas: b.tentativas.length, redacoes: b.redacoes.length }
}

export function baixarArquivo(nome: string, conteudo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
