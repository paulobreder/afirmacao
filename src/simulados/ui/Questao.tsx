import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Alternativa, Area, QuestaoBanco } from '../tipos'
import { NOME_AREA } from '../tipos'
import { ALTERNATIVAS, origemQuestao } from '../questao-util'
import { urlImagem } from '../banco'

/** Enunciado: recorte fiel do caderno oficial + texto extraído para leitores de tela. */
export function QuestaoEnunciado({ q, area, prioridade = false }: { q: QuestaoBanco; area: Area; prioridade?: boolean }) {
  const [aberto, setAberto] = useState(false)
  const id = useId()
  const largo = q.img.some(([, w]) => w > 1000)
  return (
    <div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
        <span className="rounded-full bg-brand-soft px-2.5 py-0.5 font-semibold text-brand-strong">{q.ano}</span>
        <span>
          {NOME_AREA[area]} · nº {q.n} no caderno original
        </span>
      </p>
      {/* Recortes de páginas em coluna única são largos: no celular, rolam na horizontal dentro da caixa para manter o texto legível. */}
      <div
        className={`mt-4 rounded-2xl bg-white ring-1 ring-line ${largo ? 'overflow-x-auto overscroll-x-contain' : 'overflow-hidden'}`}
        tabIndex={largo ? 0 : undefined}
        role={largo ? 'region' : undefined}
        aria-label={largo ? 'Enunciado (role para os lados para ler)' : undefined}
      >
        {q.img.map(([src, w, h], i) => (
          <img
            key={src}
            src={urlImagem(src)}
            width={w}
            height={h}
            alt={i === 0 ? `Enunciado e alternativas da questão ${q.n} do ENEM ${q.ano}. O texto está disponível em “Ler o texto da questão”.` : ''}
            loading={prioridade && i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={`mx-auto block h-auto ${w > 1000 ? 'w-full max-w-[920px] min-w-[720px]' : 'w-full max-w-[640px]'} ${i > 0 ? 'border-t border-dashed border-line' : ''}`}
          />
        ))}
      </div>
      {largo && <p className="mt-1 text-xs text-ink-subtle md:hidden">Deslize o enunciado para os lados para ler a linha inteira.</p>}
      <p className="mt-2 text-xs text-ink-subtle">Fonte: Inep — {origemQuestao(q, area)}. Reprodução fiel do caderno oficial.</p>
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => setAberto((v) => !v)}
        className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand hover:text-action"
      >
        Ler o texto da questão
        <ChevronDown className={`size-4 transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      <div id={id} hidden={!aberto} className="mt-1 rounded-xl bg-paper p-4 text-[0.95rem] leading-relaxed whitespace-pre-line text-ink">
        <p className="mb-2 text-xs text-ink-subtle">Texto extraído automaticamente do PDF. Fórmulas, tabelas e imagens aparecem de forma fiel apenas no recorte acima.</p>
        {q.txt}
      </div>
    </div>
  )
}

/** Grupo de alternativas A–E (botões de opção nativos, operáveis por teclado). */
export function Alternativas({
  nome,
  valor,
  aoEscolher,
  bloqueado = false,
  correta,
}: {
  nome: string
  valor: Alternativa | undefined
  aoEscolher?: (a: Alternativa | null) => void
  bloqueado?: boolean
  correta?: Alternativa
}) {
  return (
    <fieldset className="mt-6">
      <legend className="font-display text-base font-bold text-ink">{bloqueado ? 'Sua resposta' : 'Marque sua resposta'}</legend>
      <div className="mt-3 grid grid-cols-5 gap-2 sm:gap-3">
        {ALTERNATIVAS.map((alt) => {
          const marcada = valor === alt
          const certa = correta === alt
          const estado = correta
            ? certa
              ? 'bg-ok-soft text-ok-strong ring-2 ring-ok'
              : marcada
                ? 'bg-action-soft text-action-strong ring-2 ring-action'
                : 'bg-white text-ink-muted ring-1 ring-line'
            : marcada
              ? 'bg-brand text-white ring-2 ring-brand shadow-[var(--shadow-brand)]'
              : 'bg-white text-ink ring-1 ring-line-strong hover:ring-brand hover:text-brand'
          return (
            <label
              key={alt}
              className={`relative flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-2xl font-display text-xl font-extrabold transition-[background-color,box-shadow,color] has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${estado} ${bloqueado ? 'cursor-default' : ''}`}
            >
              <input
                type="radio"
                name={nome}
                value={alt}
                checked={marcada}
                disabled={bloqueado}
                onChange={() => aoEscolher?.(alt)}
                onClick={() => marcada && aoEscolher?.(null)}
                className="sr-only"
              />
              {alt}
              {correta && (certa || marcada) && (
                <span className="text-[0.65rem] font-semibold tracking-wide uppercase">{certa ? 'Gabarito' : 'Sua'}</span>
              )}
            </label>
          )
        })}
      </div>
      {!bloqueado && <p className="mt-2 text-xs text-ink-subtle">Clique de novo na alternativa marcada para deixá-la em branco.</p>}
    </fieldset>
  )
}
