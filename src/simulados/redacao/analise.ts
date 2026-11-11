/**
 * Analisador DETERMINÍSTICO de redação (regras fixas, sem IA, sem rede).
 * Mede apenas características verificáveis no texto. Não avalia sentido,
 * qualidade argumentativa nem atribui nota — é um apoio à revisão.
 */
import { normalizar } from '../../lib/format'

/** Média aproximada de palavras por linha manuscrita na folha do ENEM (redações nota 1000
 * costumam ter de 350 a 420 palavras em até 30 linhas). É estimativa: varia com a letra. */
export const PALAVRAS_POR_LINHA = 13
/** Margem da estimativa antes de avisar que o texto pode não caber. */
export const LINHAS_TOLERANCIA = 2
export const LINHAS_MAX = 30
export const LINHAS_MIN = 7

export const CONECTIVOS: Record<string, string[]> = {
  Adição: ['além disso', 'ademais', 'outrossim', 'também', 'não só', 'mas também', 'além de', 'bem como', 'inclusive'],
  Oposição: ['entretanto', 'contudo', 'todavia', 'no entanto', 'porém', 'embora', 'apesar de', 'ainda que', 'mesmo que', 'por outro lado', 'em contrapartida', 'não obstante'],
  Causa: ['porque', 'visto que', 'uma vez que', 'já que', 'dado que', 'devido a', 'em virtude de', 'em razão de', 'haja vista'],
  Consequência: ['portanto', 'logo', 'por isso', 'assim', 'dessa forma', 'desse modo', 'consequentemente', 'por conseguinte', 'de modo que', 'de forma que'],
  Conclusão: ['em suma', 'em síntese', 'por fim', 'enfim', 'conclui-se', 'diante do exposto', 'diante disso', 'em resumo'],
  Exemplificação: ['por exemplo', 'como exemplo', 'a exemplo de', 'é o caso de', 'isto é', 'ou seja', 'como se observa'],
  Finalidade: ['a fim de', 'para que', 'com o objetivo de', 'com a finalidade de', 'com o intuito de', 'de modo a'],
  Tempo: ['primeiramente', 'em primeiro lugar', 'em segundo lugar', 'inicialmente', 'atualmente', 'hoje em dia', 'posteriormente', 'nesse sentido', 'nesse contexto'],
}

/** Grafias equivocadas frequentes → forma recomendada (lista curta e conservadora). */
export const ERROS_COMUNS: Record<string, string> = {
  concerteza: 'com certeza', derrepente: 'de repente', apartir: 'a partir', porisso: 'por isso',
  atravéz: 'através', excessão: 'exceção', previlégio: 'privilégio', previlegio: 'privilégio', beneficiente: 'beneficente', mendingo: 'mendigo',
  menas: 'menos', seje: 'seja', esteje: 'esteja', mortandela: 'mortadela', impecilho: 'empecilho', iorgute: 'iogurte', ancioso: 'ansioso',
  analizar: 'analisar', paralizar: 'paralisar', pesquizar: 'pesquisar', descriminação: 'discriminação (se o sentido for preconceito)',
  encima: 'em cima', denovo: 'de novo', exitar: 'hesitar', insentivo: 'incentivo', insentivar: 'incentivar',
  nescessário: 'necessário', nescessidade: 'necessidade', necessáriamente: 'necessariamente', excencial: 'essencial', essêncial: 'essencial',
  cidadões: 'cidadãos', poblema: 'problema', pobrema: 'problema', propia: 'própria', propio: 'próprio',
  tambem: 'também', voce: 'você', alem: 'além', atraves: 'através', saude: 'saúde', publico: 'público (se for substantivo/adjetivo)',
}

const ORALIDADE = ['vc', 'vcs', 'pq', 'tbm', 'tb', 'né', 'tipo assim', 'aí', 'daí', 'pra', 'pro', 'tá', 'tô', 'a gente', 'galera', 'massa', 'coisa']

const STOP = new Set(
  ('a o e é de da do das dos em no na nos nas um uma uns umas que se por para com como mais mas ao aos à às ou ser são foi era ' +
    'pelo pela pelos pelas sua seu suas seus isso esse essa esses essas este esta estes estas não nao também tambem já ja ' +
    'há ha entre sobre quando onde muito muitos muita muitas ainda assim pois sem sob até ate cada outro outra outros outras ' +
    'ele ela eles elas lhe nós nos você voce tem têm ter sido estar está esta estão forma modo maneira todo toda todos todas ' +
    'mesmo mesma porque devem deve pode podem seja sejam fazer faz isso aquilo aquele aquela além alem brasil brasileira brasileiro sociedade')
    .split(' '),
)

export interface Aviso {
  criterio: 'Norma escrita' | 'Coesão' | 'Estrutura' | 'Extensão'
  mensagem: string
  trecho?: string
}

export interface Analise {
  palavras: number
  caracteres: number
  linhasEstimadas: number
  paragrafos: { palavras: number; frases: number; linhas: number }[]
  frases: number
  mediaPalavrasPorFrase: number
  conectivos: { total: number; distintos: number; porCategoria: Record<string, string[]> }
  repeticoes: { palavra: string; vezes: number }[]
  grafias: { escrito: string; sugestao: string; vezes: number }[]
  oralidade: string[]
  avisos: Aviso[]
  palavrasChave: { termo: string; presente: boolean }[]
  intervencao: Record<'agente' | 'acao' | 'meio' | 'finalidade' | 'detalhamento', string[]>
}

const palavrasDe = (t: string) => t.match(/[\p{L}\p{N}]+(?:[-'][\p{L}]+)*/gu) ?? []
const frasesDe = (t: string) => t.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter((s) => palavrasDe(s).length > 0)

function contarExpressao(textoNorm: string, expr: string) {
  const e = normalizar(expr).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return (textoNorm.match(new RegExp(`(^|[^\\p{L}])${e}(?=$|[^\\p{L}])`, 'gu')) ?? []).length
}

export function estimarLinhas(texto: string) {
  return texto
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .reduce((s, p) => s + Math.max(1, Math.ceil(palavrasDe(p).length / PALAVRAS_POR_LINHA)), 0)
}

export function analisar(texto: string, palavrasChave: string[] = []): Analise {
  const limpo = texto.replace(/\r/g, '').trim()
  const norm = normalizar(limpo)
  const pars = limpo.split(/\n+/).map((p) => p.trim()).filter(Boolean)
  const todas = palavrasDe(limpo)
  const frases = frasesDe(limpo)
  const avisos: Aviso[] = []

  const paragrafos = pars.map((p) => ({
    palavras: palavrasDe(p).length,
    frases: frasesDe(p).length,
    linhas: Math.max(1, Math.ceil(palavrasDe(p).length / PALAVRAS_POR_LINHA)),
  }))
  const linhasEstimadas = estimarLinhas(limpo)

  // Extensão e estrutura (aproximadas)
  if (todas.length && linhasEstimadas < LINHAS_MIN)
    avisos.push({ criterio: 'Extensão', mensagem: `O texto ocupa cerca de ${linhasEstimadas} linha(s). No ENEM, redações com até 7 linhas recebem nota zero.` })
  if (linhasEstimadas > LINHAS_MAX + LINHAS_TOLERANCIA)
    avisos.push({ criterio: 'Extensão', mensagem: `O texto ocuparia cerca de ${linhasEstimadas} linhas manuscritas (estimativa); a folha do ENEM tem ${LINHAS_MAX}. Confira escrevendo à mão ou considere condensar.` })
  if (pars.length && pars.length < 3)
    avisos.push({ criterio: 'Estrutura', mensagem: `Foram encontrados ${pars.length} parágrafo(s). O texto dissertativo-argumentativo costuma ter introdução, desenvolvimento e conclusão em parágrafos separados.` })
  paragrafos.forEach((p, i) => {
    if (p.palavras > 150) avisos.push({ criterio: 'Estrutura', mensagem: `O ${i + 1}º parágrafo tem ${p.palavras} palavras. Parágrafos muito extensos podem dificultar a leitura.` })
    if (p.frases === 1 && p.palavras > 60) avisos.push({ criterio: 'Norma escrita', mensagem: `O ${i + 1}º parágrafo é formado por um único período longo. Verifique a pontuação.` })
  })

  // Pontuação
  frases.forEach((f) => {
    const n = palavrasDe(f).length
    if (n > 55) avisos.push({ criterio: 'Norma escrita', mensagem: `Período com ${n} palavras. Períodos muito longos podem prejudicar a clareza.`, trecho: f.slice(0, 90) + '…' })
  })
  const pontuacao: [RegExp, string][] = [
    [/\s+[,.;:!?]/g, 'Espaço antes de sinal de pontuação.'],
    [/[,;:](?=[\p{L}])/gu, 'Falta espaço depois de vírgula, ponto e vírgula ou dois-pontos.'],
    [/[!?]{2,}|\.{4,}/g, 'Sinais de pontuação repetidos não são adequados ao registro formal.'],
    [/[.!?]\s+[a-zà-ú]/g, 'Frase iniciada com letra minúscula depois de ponto.'],
  ]
  for (const [re, msg] of pontuacao) {
    const m = limpo.match(re)
    if (m) avisos.push({ criterio: 'Norma escrita', mensagem: `${msg} (${m.length} ocorrência${m.length > 1 ? 's' : ''})`, trecho: m[0].trim() })
  }
  if (/!/.test(limpo)) avisos.push({ criterio: 'Norma escrita', mensagem: 'Há ponto de exclamação. Em texto dissertativo-argumentativo, prefira a afirmação objetiva.' })

  // Grafias frequentes e marcas de oralidade
  const grafias = Object.entries(ERROS_COMUNS)
    .map(([escrito, sugestao]) => ({ escrito, sugestao, vezes: contarExpressao(norm, escrito) }))
    .filter((g) => g.vezes > 0)
  const oralidade = ORALIDADE.filter((o) => contarExpressao(norm, o) > 0)

  // Conectivos (diversidade, não quantidade, é o que importa)
  const porCategoria: Record<string, string[]> = {}
  let total = 0
  for (const [cat, lista] of Object.entries(CONECTIVOS)) {
    const achados = lista.filter((c) => {
      const n = contarExpressao(norm, c)
      total += n
      return n > 0
    })
    if (achados.length) porCategoria[cat] = achados
  }
  const distintos = Object.values(porCategoria).flat().length
  if (pars.length >= 2 && distintos < 3)
    avisos.push({ criterio: 'Coesão', mensagem: 'Poucos conectivos diferentes foram encontrados. Verifique se as relações entre as ideias e entre os parágrafos estão explícitas.' })

  // Repetições de palavras de conteúdo
  const contagem = new Map<string, number>()
  for (const w of todas) {
    const k = normalizar(w)
    if (k.length < 4 || STOP.has(k)) continue
    contagem.set(k, (contagem.get(k) ?? 0) + 1)
  }
  const limiar = todas.length > 250 ? 5 : 4
  const repeticoes = [...contagem]
    .filter(([, v]) => v >= limiar)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([palavra, vezes]) => ({ palavra, vezes }))
  if (repeticoes.length)
    avisos.push({ criterio: 'Coesão', mensagem: `Palavras repetidas com frequência: ${repeticoes.map((r) => `“${r.palavra}” (${r.vezes}×)`).join(', ')}. Considere sinônimos, pronomes ou reformulações.` })

  // Palavras-chave do tema (só orientação: presença de palavras não comprova adequação ao tema)
  const kw = palavrasChave.map((termo) => ({ termo, presente: contarExpressao(norm, termo) > 0 || normalizar(termo).split(/\s+/).every((p) => p.length < 4 || norm.includes(p)) }))

  // Pistas da proposta de intervenção no último parágrafo (indícios, não avaliação)
  const ultimo = normalizar(pars[pars.length - 1] ?? '')
  const pistas = (lista: string[]) => lista.filter((e) => contarExpressao(ultimo, e) > 0)
  const intervencao = {
    agente: pistas(['governo', 'estado', 'ministerio', 'ministério', 'escola', 'escolas', 'familia', 'família', 'midia', 'mídia', 'ongs', 'sociedade civil', 'poder publico', 'poder público', 'prefeituras', 'congresso', 'empresas']),
    acao: pistas(['deve', 'devem', 'cabe', 'compete', 'é necessário', 'é preciso', 'precisa', 'precisam', 'promover', 'criar', 'ampliar', 'garantir']),
    meio: pistas(['por meio de', 'por intermédio de', 'mediante', 'através de', 'com o auxílio de', 'via']),
    finalidade: pistas(['a fim de', 'para que', 'com o objetivo de', 'com a finalidade de', 'com o intuito de', 'de modo a', 'visando']),
    detalhamento: pistas(['ou seja', 'isto é', 'por exemplo', 'a exemplo de', 'de modo que', 'especialmente', 'sobretudo']),
  }

  return {
    palavras: todas.length,
    caracteres: limpo.length,
    linhasEstimadas,
    paragrafos,
    frases: frases.length,
    mediaPalavrasPorFrase: frases.length ? Math.round((todas.length / frases.length) * 10) / 10 : 0,
    conectivos: { total, distintos, porCategoria },
    repeticoes,
    grafias,
    oralidade,
    avisos: [
      ...avisos,
      ...grafias.map((g) => ({ criterio: 'Norma escrita' as const, mensagem: `Possível desvio de grafia: “${g.escrito}” → ${g.sugestao}.` })),
      ...(oralidade.length ? [{ criterio: 'Norma escrita' as const, mensagem: `Marcas de oralidade ou informalidade: ${oralidade.map((o) => `“${o}”`).join(', ')}.` }] : []),
    ],
    palavrasChave: kw,
    intervencao,
  }
}

export const AUTOAVALIACAO: { id: string; grupo: string; pergunta: string }[] = [
  { id: 'tema-recorte', grupo: 'Compreensão do tema', pergunta: 'Meu texto discute exatamente o recorte proposto no título, e não apenas o assunto geral?' },
  { id: 'tema-tipo', grupo: 'Compreensão do tema', pergunta: 'Escrevi um texto dissertativo-argumentativo (e não narrativo, carta ou poema)?' },
  { id: 'tese', grupo: 'Argumentação', pergunta: 'A introdução apresenta com clareza o meu ponto de vista (tese)?' },
  { id: 'arg1', grupo: 'Argumentação', pergunta: 'Cada parágrafo de desenvolvimento defende um argumento diferente que sustenta a tese?' },
  { id: 'repertorio', grupo: 'Argumentação', pergunta: 'Usei repertório (dados, fatos, conceitos, leis, obras) de forma pertinente e explicada, não apenas citado?' },
  { id: 'coesao', grupo: 'Coesão', pergunta: 'As ideias estão ligadas entre parágrafos e dentro deles, sem saltos bruscos?' },
  { id: 'agente', grupo: 'Proposta de intervenção', pergunta: 'Indiquei QUEM deve agir (agente)?' },
  { id: 'acao', grupo: 'Proposta de intervenção', pergunta: 'Indiquei O QUE deve ser feito (ação)?' },
  { id: 'meio', grupo: 'Proposta de intervenção', pergunta: 'Indiquei COMO será feito (meio ou modo)?' },
  { id: 'finalidade', grupo: 'Proposta de intervenção', pergunta: 'Indiquei PARA QUE será feito (finalidade)?' },
  { id: 'detalhamento', grupo: 'Proposta de intervenção', pergunta: 'Detalhei algum dos elementos da proposta?' },
  { id: 'dh', grupo: 'Proposta de intervenção', pergunta: 'Minha proposta respeita os direitos humanos?' },
]
