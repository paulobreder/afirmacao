import type { Area, IndiceBanco, QuestaoBanco } from './tipos'

/**
 * Banco estático de questões (gerado por scripts/enem/import_enem.py).
 * Carregado sob demanda, só nas páginas de simulado; nunca consulta o Inep.
 */
const base = `${import.meta.env.BASE_URL}simulados/`
const cacheArea = new Map<Area, Promise<QuestaoBanco[]>>()
let cacheIndice: Promise<IndiceBanco> | null = null

async function json<T>(url: string): Promise<T> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`Não foi possível carregar ${url} (${r.status}).`)
  return r.json() as Promise<T>
}

export function carregarIndice() {
  cacheIndice ??= json<IndiceBanco>(`${base}banco/indice.json`).catch((e) => {
    cacheIndice = null
    throw e
  })
  return cacheIndice
}

export function carregarArea(area: Area) {
  let p = cacheArea.get(area)
  if (!p) {
    p = carregarIndice()
      .then((ind) => json<QuestaoBanco[]>(`${base}banco/${area}.json?v=${ind.areas[area]?.hash ?? ''}`))
      .catch((e) => {
        cacheArea.delete(area)
        throw e
      })
    cacheArea.set(area, p)
  }
  return p
}

export async function carregarAreas(areas: Area[]) {
  const listas = await Promise.all(areas.map(carregarArea))
  const bancos = {} as Record<Area, QuestaoBanco[]>
  areas.forEach((a, i) => (bancos[a] = listas[i]))
  return bancos
}

export function urlImagem(src: string) {
  return `${base}q/${src}`
}

export function mapaPorId(bancos: Partial<Record<Area, QuestaoBanco[]>>) {
  return new Map(Object.values(bancos).flatMap((l) => (l ?? []).map((q) => [q.id, q] as const)))
}
