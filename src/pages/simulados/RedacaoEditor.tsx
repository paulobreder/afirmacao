import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, Circle, Info, Loader2, Pencil, Timer } from 'lucide-react'
import { Seo } from '../../components/Seo'
import { redacoes } from '../../simulados/db'
import { temaPorId } from '../../simulados/redacao/temas'
import { analisar, AUTOAVALIACAO } from '../../simulados/redacao/analise'
import { CartaoTema, EditorRedacao } from '../../simulados/ui/EditorRedacao'
import { formatarDuracao } from '../../simulados/correcao'
import { useCronometro } from '../../simulados/useCronometro'
import type { Redacao } from '../../simulados/tipos'

export default function RedacaoEditor() {
  const { id = '' } = useParams()
  const [r, setR] = useState<Redacao | null | undefined>(undefined)
  useEffect(() => {
    redacoes.obter(id).then((x) => setR(x ?? null), () => setR(null))
  }, [id])

  if (r === undefined)
    return (
      <p role="status" className="container-site flex justify-center gap-2 py-24 text-ink-muted">
        <Loader2 className="size-5 animate-spin" aria-hidden /> Abrindo a redação…
      </p>
    )
  if (!r)
    return (
      <div className="container-site max-w-2xl py-20 text-center">
        <AlertTriangle className="mx-auto size-10 text-action" aria-hidden />
        <h1 className="mt-4 text-2xl font-extrabold">Redação não encontrada neste dispositivo.</h1>
        <Link to="/simulados/redacao" className="btn btn-primary mt-6">
          Ir para o Laboratório de Redação
        </Link>
      </div>
    )
  return <Editor inicial={r} />
}

function Editor({ inicial }: { inicial: Redacao }) {
  const [r, setR] = useState(inicial)
  const tema = temaPorId(r.temaId)
  const finalizada = Boolean(r.finalizadaEm)

  const salvar = useCallback(async (novo: Redacao) => {
    setR(novo)
    await redacoes.salvar(novo)
  }, [])

  return (
    <>
      <Seo title="Redação" description="Editor de redação com salvamento automático e análise orientativa." />
      <section className="bg-paper py-8 md:py-12">
        <div className="container-site max-w-4xl">
          <Link to="/simulados/redacao" className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand hover:text-action">
            <ArrowLeft className="size-4" aria-hidden /> Laboratório de Redação
          </Link>
          <h1 className="mt-3 text-[2rem] leading-tight font-extrabold">{finalizada ? 'Análise da redação' : 'Escrever redação'}</h1>
          {r.tentativaId && <p className="mt-1 text-ink-muted">Redação feita no simulado do 1º dia.</p>}
          <div className="mt-6">{tema ? <CartaoTema tema={tema} /> : <p>Tema não encontrado.</p>}</div>

          {!finalizada && <Cronometro r={r} aoSalvar={salvar} />}

          <div className="mt-6 rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line sm:p-6">
            <EditorRedacao key={finalizada ? 'f' : 'e'} redacao={r} aoAtualizar={setR} bloqueado={finalizada} />
            <div className="mt-5 flex flex-wrap gap-3">
              {!finalizada ? (
                <button type="button" className="btn btn-primary" disabled={!r.texto.trim()} onClick={() => salvar({ ...r, finalizadaEm: Date.now(), atualizadaEm: Date.now() })}>
                  <CheckCircle2 className="size-5" aria-hidden /> Finalizar e analisar
                </button>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={() => salvar({ ...r, finalizadaEm: null, atualizadaEm: Date.now() })}>
                  <Pencil className="size-5" aria-hidden /> Voltar a editar
                </button>
              )}
            </div>
          </div>

          {finalizada && <Analise r={r} palavrasChave={tema?.palavrasChave ?? []} aoSalvar={salvar} />}
        </div>
      </section>
    </>
  )
}

function Cronometro({ r, aoSalvar }: { r: Redacao; aoSalvar: (r: Redacao) => void }) {
  const [ligado, setLigado] = useState(r.cronometro)
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
        <input
          type="checkbox"
          checked={ligado}
          onChange={(e) => {
            setLigado(e.target.checked)
            aoSalvar({ ...r, cronometro: e.target.checked })
          }}
          className="size-5 accent-[var(--color-brand)]"
        />
        Cronometrar
      </label>
      {ligado && <Relogio r={r} aoSalvar={aoSalvar} />}
    </div>
  )
}

function Relogio({ r, aoSalvar }: { r: Redacao; aoSalvar: (r: Redacao) => void }) {
  const ms = useCronometro(r.tempoMs, true, (v) => aoSalvar({ ...r, tempoMs: Math.round(v) }))
  return (
    <p className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-display text-sm font-bold tabular-nums ring-1 ring-line">
      <Timer className="size-4 text-brand" aria-hidden /> {formatarDuracao(ms)}
      <span className="font-sans text-xs font-medium text-ink-subtle">(sugestão: até 1h para a redação)</span>
    </p>
  )
}

function Analise({ r, palavrasChave, aoSalvar }: { r: Redacao; palavrasChave: string[]; aoSalvar: (r: Redacao) => void }) {
  const a = useMemo(() => analisar(r.texto, palavrasChave), [r.texto, palavrasChave])
  const grupos = [...new Set(AUTOAVALIACAO.map((x) => x.grupo))]
  const marcados = Object.values(r.autoavaliacao).filter(Boolean).length
  return (
    <section aria-labelledby="analise" className="mt-8 space-y-6">
      <div className="flex items-start gap-3 rounded-[var(--radius-card)] bg-energy-soft p-5 text-ink">
        <Info className="mt-0.5 size-5 shrink-0 text-brand-strong" aria-hidden />
        <p className="text-[0.95rem]">
          <strong>Análise orientativa, feita por regras automáticas e sem inteligência artificial.</strong> Ela aponta características
          verificáveis do texto (extensão, pontuação, repetições, conectivos) e não avalia a qualidade das ideias. Não é nota do ENEM e
          não substitui a correção de um professor.
        </p>
      </div>

      <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
        <h2 id="analise" className="text-xl font-extrabold">
          Indicadores técnicos
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Palavras', a.palavras],
            ['Linhas (estimadas)', `${a.linhasEstimadas} / 30`],
            ['Parágrafos', a.paragrafos.length],
            ['Palavras por período', a.mediaPalavrasPorFrase.toLocaleString('pt-BR')],
            ['Conectivos diferentes', a.conectivos.distintos],
            ['Períodos', a.frases],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-2xl bg-paper p-4">
              <dt className="text-sm text-ink-muted">{k}</dt>
              <dd className="font-display text-2xl font-extrabold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
        <h2 className="text-xl font-extrabold">Pontos para revisar</h2>
        {a.avisos.length ? (
          <ul className="mt-4 space-y-3">
            {a.avisos.map((av, i) => (
              <li key={i} className="flex gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-action" aria-hidden />
                <span>
                  <span className="text-xs font-bold tracking-[0.08em] text-ink-muted uppercase">{av.criterio}</span>
                  <span className="block text-ink">{av.mensagem}</span>
                  {av.trecho && <span className="mt-1 block rounded-lg bg-paper px-2 py-1 font-mono text-sm text-ink-muted">“{av.trecho}”</span>}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-ink-muted">As regras automáticas não encontraram problemas técnicos. Revise mesmo assim com o checklist abaixo.</p>
        )}
        <p className="mt-4 text-xs text-ink-subtle">A verificação de grafia usa uma lista curta de erros comuns; não é um corretor ortográfico completo.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
          <h2 className="text-xl font-extrabold">Coesão: conectivos usados</h2>
          {Object.keys(a.conectivos.porCategoria).length ? (
            <dl className="mt-4 space-y-2 text-sm">
              {Object.entries(a.conectivos.porCategoria).map(([cat, l]) => (
                <div key={cat}>
                  <dt className="font-semibold text-ink">{cat}</dt>
                  <dd className="text-ink-muted">{l.join(', ')}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-ink-muted">Nenhum conectivo da lista de referência foi encontrado.</p>
          )}
          <p className="mt-4 text-xs text-ink-subtle">Mais conectivos não significa um texto melhor: o importante é a relação lógica correta entre as ideias.</p>
        </div>
        <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
          <h2 className="text-xl font-extrabold">Palavras-chave do tema</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {a.palavrasChave.map((k) => (
              <li key={k.termo} className={`rounded-full px-3 py-1 text-sm ring-1 ${k.presente ? 'bg-brand-soft text-brand-strong ring-brand/30' : 'bg-paper text-ink-muted ring-line'}`}>
                {k.presente ? '✓ ' : ''}
                {k.termo}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-subtle">
            Orientação apenas: usar ou não estas palavras não indica, sozinho, se o texto atende ao tema. Confira o recorte no checklist.
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
        <h2 className="text-xl font-extrabold">Proposta de intervenção: indícios no último parágrafo</h2>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
          {(['agente', 'acao', 'meio', 'finalidade', 'detalhamento'] as const).map((k) => (
            <li key={k} className="rounded-2xl bg-paper p-3 text-sm">
              <span className="font-semibold text-ink capitalize">{k === 'acao' ? 'Ação' : k}</span>
              <span className="mt-1 block text-ink-muted">{a.intervencao[k].length ? `Possível marca: “${a.intervencao[k][0]}”` : 'Nenhuma marca encontrada'}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-subtle">As marcas são só pistas de vocabulário. Confirme cada elemento no checklist.</p>
      </div>

      <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
        <h2 className="text-xl font-extrabold">Checklist de autoavaliação</h2>
        <p className="mt-1 text-sm text-ink-muted" aria-live="polite">
          {marcados} de {AUTOAVALIACAO.length} itens confirmados · salvo automaticamente
        </p>
        {grupos.map((g) => (
          <fieldset key={g} className="mt-5">
            <legend className="font-display font-bold text-ink">{g}</legend>
            <ul className="mt-2 space-y-1">
              {AUTOAVALIACAO.filter((x) => x.grupo === g).map((x) => {
                const ok = Boolean(r.autoavaliacao[x.id])
                return (
                  <li key={x.id}>
                    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-paper">
                      <input
                        type="checkbox"
                        checked={ok}
                        onChange={(e) => aoSalvar({ ...r, autoavaliacao: { ...r.autoavaliacao, [x.id]: e.target.checked }, atualizadaEm: Date.now() })}
                        className="sr-only"
                      />
                      {ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden /> : <Circle className="mt-0.5 size-5 shrink-0 text-ink-subtle" aria-hidden />}
                      <span className="text-ink">{x.pergunta}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </fieldset>
        ))}
      </div>
    </section>
  )
}
