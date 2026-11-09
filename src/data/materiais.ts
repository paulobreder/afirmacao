/**
 * Catálogo da biblioteca AfirmAção.
 *
 * Para adicionar um novo material:
 * 1. Copie o PDF para `public/materiais/<slug>.pdf` (nome sem acentos ou espaços).
 * 2. (Opcional) Salve uma capa em `public/capas/<slug>.webp`.
 * 3. Acrescente um item a `materiais` abaixo. A interface se atualiza sozinha.
 *
 * Os dados abaixo foram extraídos dos próprios arquivos (páginas, tamanho,
 * editora/coleção impressa na capa e na ficha catalográfica).
 */

export type CategoriaId = 'revisao' | 'raio-x' | 'resumos'

export interface Categoria {
  id: CategoriaId
  nome: string
  nomeCurto: string
  descricao: string
}

export const categorias: Categoria[] = [
  {
    id: 'revisao',
    nome: 'Revisão',
    nomeCurto: 'Revisão',
    descricao: 'Apostilas e materiais de estudo organizados por disciplina.',
  },
  {
    id: 'raio-x',
    nome: 'Raio-X ENEM',
    nomeCurto: 'Raio-X',
    descricao: 'Questões, exercícios e resoluções para praticar.',
  },
  {
    id: 'resumos',
    nome: 'Resumos e conteúdos essenciais',
    nomeCurto: 'Resumos',
    descricao: 'Fichas de resumo e materiais sobre os assuntos mais cobrados.',
  },
]

export interface Material {
  slug: string
  titulo: string
  categoria: CategoriaId
  /** Disciplina principal; use "Várias disciplinas" para materiais multidisciplinares. */
  disciplina: string
  descricao: string
  /** Coleção ou origem impressa no próprio documento. */
  origem?: string
  paginas: number
  bytes: number
  /** Nome do arquivo original entregue pela equipe (para rastreabilidade). */
  arquivoOriginal: string
  /** Página em que começam as resoluções, quando existir. */
  paginaResolucoes?: number
}

const revisao = (
  slug: string,
  disciplina: string,
  paginas: number,
  bytes: number,
  arquivoOriginal: string,
): Material => ({
  slug,
  titulo: `Revisão de ${disciplina}`,
  categoria: 'revisao',
  disciplina,
  descricao: `Apostila de revisão de ${disciplina} do ensino médio, em volume único, para retomar os conteúdos que caem no ENEM.`,
  origem: 'Coleção Ser Protagonista — Revisão (Edições SM, 2014)',
  paginas,
  bytes,
  arquivoOriginal,
})

const raioX = (
  slug: string,
  disciplina: string,
  paginas: number,
  bytes: number,
  paginaResolucoes: number,
  arquivoOriginal: string,
): Material => ({
  slug,
  titulo: `Raio-X ENEM: ${disciplina}`,
  categoria: 'raio-x',
  disciplina,
  descricao: `50 questões de ${disciplina} com resoluções comentadas ao final do caderno, a partir da página ${paginaResolucoes}.`,
  origem: 'Raio X do Enem (SAS, 2019)',
  paginas,
  bytes,
  paginaResolucoes,
  arquivoOriginal,
})

export const materiais: Material[] = [
  revisao('revisao-biologia', 'Biologia', 186, 12764595, 'Revisão Biologia.pdf'),
  revisao('revisao-fisica', 'Física', 194, 33722255, 'Revisão Física.pdf'),
  revisao('revisao-quimica', 'Química', 170, 23502386, 'Revisão Química.pdf'),
  revisao('revisao-matematica', 'Matemática', 180, 32210526, 'Revisão Matemática.pdf'),
  revisao('revisao-portugues', 'Língua Portuguesa', 162, 5813008, 'Revisão Português.pdf'),
  revisao('revisao-historia', 'História', 170, 11963895, 'Revisão História.pdf'),
  revisao('revisao-geografia', 'Geografia', 162, 18243305, 'Revisão Geografia.pdf'),

  raioX('raio-x-biologia', 'Biologia', 36, 1450547, 29, 'rx-biologia.pdf'),
  raioX('raio-x-fisica', 'Física', 34, 2202041, 29, 'rx-fisica.pdf'),
  raioX('raio-x-quimica', 'Química', 38, 2821730, 32, 'rx-quimica.pdf'),
  raioX('raio-x-matematica', 'Matemática', 37, 1508084, 31, 'rx-matematica.pdf'),
  raioX('raio-x-historia', 'História', 32, 2383601, 27, 'rx-historia.pdf'),
  raioX('raio-x-geografia', 'Geografia', 33, 1389866, 28, 'rx-geografia.pdf'),
  raioX('raio-x-filosofia', 'Filosofia', 32, 687929, 27, 'rx-filosofia.pdf'),
  raioX('raio-x-sociologia', 'Sociologia', 32, 2348274, 28, 'rx-sociologia.pdf'),
  raioX('raio-x-ingles', 'Inglês', 33, 3876204, 29, 'rx-ingles.pdf'),

  {
    slug: 'conteudos-mais-cobrados-enem',
    titulo: 'Conteúdos e habilidades mais cobrados do ENEM',
    categoria: 'resumos',
    disciplina: 'Várias disciplinas',
    descricao:
      'Levantamento dos assuntos que mais aparecem no ENEM, com o número de questões por conteúdo e as habilidades cobradas em Linguagens, Ciências da Natureza, Matemática e Ciências Humanas.',
    paginas: 14,
    bytes: 290456,
    arquivoOriginal: 'Conteúdos que mais caem ENEM.pdf',
  },
  {
    slug: 'fichas-resumo-objetivo-1',
    titulo: 'Fichas-Resumo — volume 1',
    categoria: 'resumos',
    disciplina: 'Várias disciplinas',
    descricao:
      'Fichas de resumo com esquemas, mapas e fórmulas de Física, Inglês, História, Biologia, Química, Geografia, Português e Matemática.',
    origem: 'Coleção Objetivo — Fichas-Resumo 1',
    paginas: 214,
    bytes: 176467211,
    arquivoOriginal: 'Ficha resumo objetivo -1.pdf',
  },
]

/** Arquivos acima deste tamanho recebem um aviso para usar Wi-Fi. */
export const LIMITE_ARQUIVO_GRANDE = 25_000_000

/** Endereço público de um arquivo de `public/`, respeitando o subcaminho de publicação (ex.: GitHub Pages). */
export const arquivoPublico = (caminho: string) => `${import.meta.env.BASE_URL}${caminho}`

export const pdfUrl = (m: Material) => arquivoPublico(`materiais/${m.slug}.pdf`)
export const capaUrl = (m: Material) => arquivoPublico(`capas/${m.slug}.webp`)
export const nomeDownload = (m: Material) => `AfirmAcao - ${m.titulo.replace(/[:/]/g, ' -')}.pdf`

/** O PDF existe nesta publicação? (alguns arquivos grandes podem ficar fora dela) */
export const disponivel = (m: Material) => __PDFS_DISPONIVEIS__.includes(`${m.slug}.pdf`)

export const getMaterial = (slug: string) => materiais.find((m) => m.slug === slug)
export const getCategoria = (id: CategoriaId) => categorias.find((c) => c.id === id)!
export const contarPorCategoria = (id: CategoriaId) => materiais.filter((m) => m.categoria === id).length

/** Ordem das disciplinas nos filtros. */
export const disciplinas = [
  'Língua Portuguesa',
  'Inglês',
  'Matemática',
  'Biologia',
  'Física',
  'Química',
  'História',
  'Geografia',
  'Filosofia',
  'Sociologia',
  'Várias disciplinas',
].filter((d) => materiais.some((m) => m.disciplina === d))
