import { TEMAS_BRUTOS } from './temas-dados'

export interface Tema {
  id: string
  titulo: string
  eixo: string
  contexto: string
  proposta: string
  palavrasChave: string[]
  referencias: string[]
}

export function propostaDe(titulo: string) {
  return (
    'A partir da contextualização e de seus conhecimentos construídos ao longo de sua formação, redija um texto ' +
    'dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema ' +
    `“${titulo}”, apresentando proposta de intervenção que respeite os direitos humanos. ` +
    'Selecione, organize e relacione, de forma coerente e coesa, argumentos e fatos para defesa de seu ponto de vista.'
  )
}

export const TEMAS: Tema[] = TEMAS_BRUTOS.map(([id, eixo, titulo, contexto, chaves, refs]) => ({
  id,
  eixo,
  titulo,
  contexto,
  proposta: propostaDe(titulo),
  palavrasChave: chaves.split(';').map((s) => s.trim()).filter(Boolean),
  referencias: (refs ?? '').split('|').map((s) => s.trim()).filter(Boolean),
}))

export const EIXOS = [...new Set(TEMAS.map((t) => t.eixo))]
export const temaPorId = (id: string) => TEMAS.find((t) => t.id === id)

/** Sorteio local, ilimitado, evitando temas usados recentemente sempre que possível. */
export function sortearTema(opts: { eixo?: string | null; recentes?: string[]; aleatorio?: () => number } = {}): Tema {
  const aleatorio = opts.aleatorio ?? Math.random
  const pool = opts.eixo ? TEMAS.filter((t) => t.eixo === opts.eixo) : TEMAS
  const recentes = new Set(opts.recentes ?? [])
  const novos = pool.filter((t) => !recentes.has(t.id))
  const base = novos.length ? novos : pool
  return base[Math.floor(aleatorio() * base.length)]
}
