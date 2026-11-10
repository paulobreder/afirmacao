/**
 * Integridade do banco PUBLICADO (public/simulados/banco), gerado pelo pipeline.
 * Garante que só itens válidos chegam ao navegador.
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import type { Area, IndiceBanco, QuestaoBanco } from '../tipos'

const RAIZ = join(__dirname, '../../../public/simulados')
const AREAS: Area[] = ['LC', 'CH', 'CN', 'MT']
const existe = existsSync(join(RAIZ, 'banco/indice.json'))
const ler = <T,>(p: string) => JSON.parse(readFileSync(join(RAIZ, p), 'utf8')) as T

describe.runIf(existe)('banco publicado', () => {
  const indice = existe ? ler<IndiceBanco>('banco/indice.json') : null!
  const bancos = Object.fromEntries(AREAS.map((a) => [a, existe ? ler<QuestaoBanco[]>(`banco/${a}.json`) : []])) as Record<Area, QuestaoBanco[]>
  const todas = Object.values(bancos).flat()

  it('tem IDs únicos em todo o banco', () => {
    expect(new Set(todas.map((q) => q.id)).size).toBe(todas.length)
  })
  it('cada questão tem gabarito A–E, ano válido, número e enunciado', () => {
    for (const q of todas) {
      expect(['A', 'B', 'C', 'D', 'E'], q.id).toContain(q.g)
      expect(q.ano, q.id).toBeGreaterThanOrEqual(2016)
      expect(q.ano, q.id).toBeLessThanOrEqual(2025)
      expect(q.n, q.id).toBeGreaterThan(0)
      expect(q.txt.length, q.id).toBeGreaterThan(30)
      expect(q.id.startsWith(String(q.ano)), q.id).toBe(true)
    }
  })
  it('área do arquivo corresponde à área do ID e à numeração oficial', () => {
    for (const a of AREAS)
      for (const q of bancos[a]) {
        expect(q.id.split('-')[1], q.id).toBe(a)
        const dia1 = q.ano === 2016 ? ['CH', 'CN'] : ['LC', 'CH']
        const off = dia1.includes(a) ? 0 : 90
        const ordem = (q.ano === 2016 ? ['CH', 'CN', 'LC', 'MT'] : ['LC', 'CH', 'CN', 'MT']).indexOf(a) % 2
        expect(q.n - off, q.id).toBeGreaterThan(ordem * 45)
        expect(q.n - off, q.id).toBeLessThanOrEqual(ordem * 45 + 45)
      }
  })
  it('língua estrangeira só nas 5 primeiras de Linguagens, com marcação coerente', () => {
    for (const q of todas) {
      if (q.l) {
        expect(q.id, q.id).toMatch(/-LC-\d{3}-(ing|esp)$/)
        expect(q.l === 'ingles' ? q.id.endsWith('-ing') : q.id.endsWith('-esp'), q.id).toBe(true)
      } else expect(q.id, q.id).not.toMatch(/-(ing|esp)$/)
    }
  })
  it('todos os recortes referenciados existem e têm dimensões declaradas', () => {
    for (const q of todas) {
      expect(q.img.length, q.id).toBeGreaterThan(0)
      for (const [src, w, h] of q.img) {
        const p = join(RAIZ, 'q', src)
        expect(existsSync(p), src).toBe(true)
        expect(statSync(p).size, src).toBeGreaterThan(1000)
        expect(w * h, src).toBeGreaterThan(0)
      }
    }
  })
  it('o índice confere com os arquivos (contagens e hash)', () => {
    for (const a of AREAS) {
      const corpo = readFileSync(join(RAIZ, `banco/${a}.json`), 'utf8')
      expect(indice.areas[a].total).toBe(bancos[a].length)
      expect(indice.areas[a].hash).toBe(createHash('sha256').update(corpo).digest('hex').slice(0, 12))
    }
    expect(indice.areas.LC.ingles).toBe(bancos.LC.filter((q) => q.l === 'ingles').length)
  })
  it('não há enunciados duplicados (deduplicação)', () => {
    const chave = (t: string) => t.toLowerCase().replace(/\W+/g, '').slice(0, 400)
    const longos = todas.filter((q) => chave(q.txt).length > 120)
    expect(new Set(longos.map((q) => chave(q.txt))).size).toBe(longos.length)
  })
})
