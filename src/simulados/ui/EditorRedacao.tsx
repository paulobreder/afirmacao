import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Save } from 'lucide-react'
import type { Redacao } from '../tipos'
import type { Tema } from '../redacao/temas'
import { estimarLinhas, LINHAS_MAX, LINHAS_MIN } from '../redacao/analise'
import { redacoes } from '../db'

export function CartaoTema({ tema, compacto = false }: { tema: Tema; compacto?: boolean }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
      <p className="eyebrow">{tema.eixo}</p>
      <h2 className="mt-2 text-xl leading-snug font-extrabold sm:text-2xl">{tema.titulo}</h2>
      <p className="mt-3 leading-relaxed text-ink-muted">{tema.contexto}</p>
      {!compacto && (
        <>
          <p className="mt-4 rounded-2xl bg-paper p-4 text-[0.95rem] leading-relaxed text-ink">{tema.proposta}</p>
          {tema.referencias.length > 0 && (
            <div className="mt-4 text-sm text-ink-muted">
              <p className="font-semibold text-ink">Referências de apoio</p>
              <ul className="mt-1 list-inside list-disc">
                {tema.referencias.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-4 text-xs text-ink-subtle">Proposta autoral da AfirmAção, criada para treino. Não é uma proposta oficial do ENEM.</p>
        </>
      )}
    </div>
  )
}

/**
 * Editor com salvamento automático (IndexedDB), contagem de palavras e estimativa
 * de linhas da folha oficial (30 linhas). O texto nunca sai do dispositivo.
 */
export function EditorRedacao({
  redacao,
  aoAtualizar,
  bloqueado = false,
}: {
  redacao: Redacao
  aoAtualizar: (r: Redacao) => void
  bloqueado?: boolean
}) {
  const [texto, setTexto] = useState(redacao.texto)
  const [salvo, setSalvo] = useState(true)
  const ultimo = useRef(redacao)
  const id = useId()
  useEffect(() => {
    ultimo.current = redacao
  })

  // Salva 600 ms depois da última digitação
  useEffect(() => {
    if (texto === ultimo.current.texto) return
    setSalvo(false)
    const h = setTimeout(async () => {
      const novo = { ...ultimo.current, texto, atualizadaEm: Date.now() }
      await redacoes.salvar(novo)
      aoAtualizar(novo)
      setSalvo(true)
    }, 600)
    return () => clearTimeout(h)
  }, [texto, aoAtualizar])

  const palavras = useMemo(() => (texto.match(/[\p{L}\p{N}]+/gu) ?? []).length, [texto])
  const linhas = useMemo(() => estimarLinhas(texto), [texto])
  const estadoLinhas = linhas > LINHAS_MAX ? 'text-action-strong' : linhas > 0 && linhas <= LINHAS_MIN ? 'text-action-strong' : 'text-ink'

  return (
    <div>
      <label htmlFor={id} className="font-display text-lg font-bold text-ink">
        Sua redação
      </label>
      <p id={`${id}-dica`} className="mt-1 text-sm text-ink-muted">
        Separe os parágrafos com uma linha em branco (Enter). A estimativa considera cerca de 68 caracteres por linha manuscrita.
      </p>
      <textarea
        id={id}
        aria-describedby={`${id}-dica ${id}-contagem`}
        value={texto}
        readOnly={bloqueado}
        onChange={(e) => setTexto(e.target.value)}
        spellCheck
        lang="pt-BR"
        rows={18}
        className="mt-3 block min-h-[24rem] w-full resize-y rounded-2xl bg-white p-4 text-[1.05rem] leading-[1.9] text-ink ring-1 ring-line-strong outline-none focus-visible:ring-2 focus-visible:ring-brand read-only:bg-paper sm:p-6"
        placeholder="Comece pelo parágrafo de introdução…"
      />
      <div id={`${id}-contagem`} className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm" aria-live="polite">
        <p className="flex flex-wrap gap-x-5 gap-y-1 text-ink-muted tabular-nums">
          <span>
            <strong className="text-ink">{palavras}</strong> palavras
          </span>
          <span className={estadoLinhas}>
            <strong>≈ {linhas}</strong> de {LINHAS_MAX} linhas
          </span>
        </p>
        {!bloqueado && (
          <p className="flex items-center gap-1.5 text-ink-subtle">
            {salvo ? <CheckCircle2 className="size-4 text-ok" aria-hidden /> : <Save className="size-4" aria-hidden />}
            {salvo ? 'Salvo neste dispositivo' : 'Salvando…'}
          </p>
        )}
      </div>
    </div>
  )
}
