export type Area = 'LC' | 'CH' | 'CN' | 'MT'
export type Lingua = 'ingles' | 'espanhol'
export type Alternativa = 'A' | 'B' | 'C' | 'D' | 'E'
export type Dia = 1 | 2

/** Registro compacto publicado em public/simulados/banco/{AREA}.json */
export interface QuestaoBanco {
  id: string
  ano: number
  n: number // número no caderno oficial
  l: Lingua | null
  g: Alternativa // gabarito oficial
  img: [src: string, w: number, h: number][]
  txt: string // texto extraído (acessibilidade e busca)
}

export interface IndiceBanco {
  anos: number[]
  areas: Record<Area, { total: number; ingles: number; espanhol: number; anos: Record<string, number>; hash: string }>
}

export type Modalidade = 'completo' | 'treino'

export interface Tentativa {
  id: string
  dia: Dia
  modalidade: Modalidade
  lingua: Lingua | null
  /** IDs das questões sorteadas, na ordem da prova (fixos depois do sorteio). */
  questoes: string[]
  /** Áreas na ordem, com o índice inicial de cada uma em `questoes`. */
  blocos: { area: Area; inicio: number; fim: number }[]
  respostas: Record<string, Alternativa>
  revisar: string[]
  atual: number
  /** Tempo efetivo de prova (ms), acumulado enquanto a página está aberta. */
  tempoMs: number
  duracaoRefMs: number
  criadaEm: number
  atualizadaEm: number
  finalizadaEm: number | null
  resultado: Resultado | null
  /** Primeiro dia: tema de redação sorteado e redação vinculada. */
  temaRedacao: string | null
  redacaoId: string | null
}

export interface ResultadoArea {
  area: Area
  total: number
  acertos: number
  erros: number
  brancos: number
}

export interface Resultado {
  total: number
  acertos: number
  erros: number
  brancos: number
  percentual: number
  porArea: ResultadoArea[]
  tempoMs: number
  /** Gabarito de cada questão no momento da correção (permite revisar mesmo se o banco mudar). */
  gabaritos: Record<string, Alternativa>
}

export interface Redacao {
  id: string
  temaId: string
  texto: string
  criadaEm: number
  atualizadaEm: number
  finalizadaEm: number | null
  tempoMs: number
  cronometro: boolean
  tentativaId: string | null
  autoavaliacao: Record<string, boolean>
}

export const NOME_AREA: Record<Area, string> = {
  LC: 'Linguagens, Códigos e suas Tecnologias',
  CH: 'Ciências Humanas e suas Tecnologias',
  CN: 'Ciências da Natureza e suas Tecnologias',
  MT: 'Matemática e suas Tecnologias',
}
export const NOME_CURTO: Record<Area, string> = { LC: 'Linguagens', CH: 'Humanas', CN: 'Natureza', MT: 'Matemática' }
export const AREAS_DIA: Record<Dia, [Area, Area]> = { 1: ['LC', 'CH'], 2: ['CN', 'MT'] }
export const DURACAO_REF_MS: Record<Dia, number> = { 1: 5.5 * 3600_000, 2: 5 * 3600_000 }
export const QUESTOES_POR_AREA = 45
export const QUESTOES_LINGUA = 5
