import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, Flag, Grid3x3, Loader2, PenLine, Timer } from 'lucide-react'
import { Seo } from '../../components/Seo'
import { carregarAreas, mapaPorId } from '../../simulados/banco'
import { novaRedacao, redacoes, tentativas } from '../../simulados/db'
import { alternarRevisao, finalizar, formatarDuracao, responder } from '../../simulados/correcao'
import { useCronometro } from '../../simulados/useCronometro'
import { Alternativas, QuestaoEnunciado } from '../../simulados/ui/Questao'
import { CartaoTema, EditorRedacao } from '../../simulados/ui/EditorRedacao'
import { Dialogo } from '../../simulados/ui/Dialogo'
import { temaPorId } from '../../simulados/redacao/temas'
import type { Alternativa, Area, QuestaoBanco, Redacao, Tentativa } from '../../simulados/tipos'
import { NOME_CURTO } from '../../simulados/tipos'

export default function Prova() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [t, setT] = useState<Tentativa | null>(null)
  const [porId, setPorId] = useState<Map<string, QuestaoBanco> | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    tentativas
      .obter(id)
      .then(async (tt) => {
        if (!tt) throw new Error('Simulado não encontrado neste dispositivo.')
        if (tt.finalizadaEm) {
          navigate(`/simulados/resultado/${tt.id}`, { replace: true })
          return
        }
        const bancos = await carregarAreas(tt.blocos.map((b) => b.area))
        if (!vivo) return
        setPorId(mapaPorId(bancos))
        setT(tt)
      })
      .catch((e) => vivo && setErro(e instanceof Error ? e.message : 'Não foi possível abrir o simulado.'))
    return () => {
      vivo = false
    }
  }, [id, navigate])

  if (erro)
    return (
      <div className="container-site max-w-2xl py-20 text-center">
        <AlertTriangle className="mx-auto size-10 text-action" aria-hidden />
        <h1 className="mt-4 text-2xl font-extrabold">{erro}</h1>
        <p className="mt-2 text-ink-muted">O histórico fica salvo apenas no navegador em que o simulado foi iniciado.</p>
        <Link to="/simulados" className="btn btn-primary mt-6">
          Voltar aos simulados
        </Link>
      </div>
    )
  if (!t || !porId)
    return (
      <p role="status" className="container-site flex items-center justify-center gap-2 py-24 text-ink-muted">
        <Loader2 className="size-5 animate-spin" aria-hidden /> Abrindo o simulado…
      </p>
    )
  return <ProvaAberta inicial={t} porId={porId} />
}

function ProvaAberta({ inicial, porId }: { inicial: Tentativa; porId: Map<string, QuestaoBanco> }) {
  const navigate = useNavigate()
  const [t, setT] = useState(inicial)
  const tRef = useRef(t)
  const [mapaAberto, setMapaAberto] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [redacao, setRedacao] = useState<Redacao | null>(null)
  const topoRef = useRef<HTMLHeadingElement>(null)
  const temRedacao = Boolean(t.temaRedacao)
  const idxRedacao = t.questoes.length
  const naRedacao = temRedacao && t.atual === idxRedacao

  const atualizar = useCallback((f: (x: Tentativa) => Tentativa) => {
    const novo = f(tRef.current)
    if (novo === tRef.current) return
    tRef.current = novo
    setT(novo)
    void tentativas.salvar(novo)
  }, [])

  const ms = useCronometro(inicial.tempoMs, true, (v) => atualizar((x) => ({ ...x, tempoMs: Math.round(v) })))

  // Redação vinculada ao primeiro dia
  useEffect(() => {
    if (!temRedacao) return
    ;(async () => {
      let r = t.redacaoId ? await redacoes.obter(t.redacaoId) : undefined
      if (!r) {
        r = await novaRedacao(t.temaRedacao!, t.id)
        atualizar((x) => ({ ...x, redacaoId: r!.id }))
      }
      setRedacao(r)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temRedacao])

  const irPara = (i: number) => {
    atualizar((x) => ({ ...x, atual: i }))
    setMapaAberto(false)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      topoRef.current?.focus({ preventScroll: true })
    })
  }

  const qid = t.questoes[Math.min(t.atual, t.questoes.length - 1)]
  const q = porId.get(qid)
  const area = useMemo<Area>(() => t.blocos.find((b) => t.atual >= b.inicio && t.atual <= b.fim)?.area ?? t.blocos[t.blocos.length - 1].area, [t.atual, t.blocos])
  const respondidas = Object.keys(t.respostas).length
  const pendentes = t.questoes.length - respondidas
  const restante = t.duracaoRefMs - ms
  const ultimo = temRedacao ? idxRedacao : t.questoes.length - 1

  async function concluir() {
    const comTempo = { ...tRef.current, tempoMs: Math.round(ms) }
    const fim = finalizar(comTempo, porId)
    tRef.current = fim
    await tentativas.salvar(fim)
    if (redacao && redacao.texto.trim()) await redacoes.salvar({ ...redacao, finalizadaEm: Date.now(), atualizadaEm: Date.now() })
    navigate(`/simulados/resultado/${fim.id}`, { replace: true })
  }

  const mapa = (
    <MapaQuestoes t={t} temRedacao={temRedacao} redacaoIniciada={Boolean(redacao?.texto.trim())} aoIr={irPara} />
  )

  return (
    <>
      <Seo title={`Simulado — ${t.dia}º dia`} description="Simulado em andamento." />
      {/* Barra da prova */}
      <div className="sticky top-[73px] z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-site flex min-h-16 items-center justify-between gap-3 py-2">
          <p className="shrink-0 text-sm whitespace-nowrap text-ink-muted">
            <span className="font-display font-bold text-ink">
              {t.dia}º dia<span className="hidden sm:inline">{t.modalidade === 'treino' ? ' · Treino' : ''}</span>
            </span>
            <span className="hidden sm:inline"> · {respondidas} de {t.questoes.length} respondidas</span>
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <p className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-sm font-bold tabular-nums ${restante < 0 ? 'bg-action-soft text-action-strong' : 'bg-paper text-ink'}`}>
              <Timer className="size-4" aria-hidden />
              <span className="sr-only">Tempo de prova: </span>
              {formatarDuracao(ms)}
              <span className="hidden font-sans text-xs font-medium text-ink-subtle sm:inline">/ {formatarDuracao(t.duracaoRefMs, false)}</span>
            </p>
            <button type="button" onClick={() => setMapaAberto(true)} className="btn btn-secondary btn-sm lg:hidden" aria-haspopup="dialog">
              <Grid3x3 className="size-4" aria-hidden /> <span className="max-[400px]:sr-only">Questões</span>
            </button>
            <button type="button" onClick={() => setConfirmar(true)} className="btn btn-primary btn-sm">
              Finalizar
            </button>
          </div>
        </div>
        {restante < 0 && (
          <p className="bg-action-soft py-1.5 text-center text-xs font-semibold text-action-strong">
            O tempo de referência da prova acabou. Você pode continuar, mas no ENEM a prova já teria sido recolhida.
          </p>
        )}
      </div>

      <div className="container-site grid grid-cols-1 gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {naRedacao ? (
            <div className="space-y-6">
              <h1 ref={topoRef} tabIndex={-1} className="text-2xl font-extrabold outline-none">
                Proposta de redação
              </h1>
              {t.temaRedacao && temaPorId(t.temaRedacao) && <CartaoTema tema={temaPorId(t.temaRedacao)!} />}
              {redacao ? <EditorRedacao redacao={redacao} aoAtualizar={setRedacao} /> : <p role="status">Abrindo editor…</p>}
              <p className="text-sm text-ink-muted">A análise orientativa do texto aparece no Laboratório de Redação depois que você finalizar o simulado.</p>
            </div>
          ) : q ? (
            <article aria-labelledby="titulo-questao">
              <h1 id="titulo-questao" ref={topoRef} tabIndex={-1} className="text-2xl font-extrabold outline-none">
                Questão {t.atual + 1} <span className="text-base font-semibold text-ink-muted">de {t.questoes.length} · {NOME_CURTO[area]}</span>
              </h1>
              <div className="mt-4">
                <QuestaoEnunciado key={q.id} q={q} area={area} prioridade />
              </div>
              <Alternativas
                nome={`resp-${q.id}`}
                valor={t.respostas[q.id]}
                aoEscolher={(a: Alternativa | null) => atualizar((x) => responder(x, q.id, a))}
              />
              <button
                type="button"
                aria-pressed={t.revisar.includes(q.id)}
                onClick={() => atualizar((x) => alternarRevisao(x, q.id))}
                className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 transition-colors ${t.revisar.includes(q.id) ? 'bg-energy-soft text-ink ring-energy' : 'bg-white text-ink-muted ring-line-strong hover:text-brand hover:ring-brand'}`}
              >
                <Flag className="size-4" aria-hidden /> {t.revisar.includes(q.id) ? 'Marcada para revisão' : 'Marcar para revisão'}
              </button>
            </article>
          ) : (
            <p className="text-action-strong">Esta questão não está mais no banco carregado.</p>
          )}

          <nav aria-label="Navegação entre questões" className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <button type="button" className="btn btn-secondary" disabled={t.atual === 0} onClick={() => irPara(t.atual - 1)}>
              <ArrowLeft className="size-5" aria-hidden /> Anterior
            </button>
            {t.atual < ultimo ? (
              <button type="button" className="btn btn-primary" onClick={() => irPara(t.atual + 1)}>
                {temRedacao && t.atual + 1 === idxRedacao ? 'Ir para a redação' : 'Próxima'} <ArrowRight className="size-5" aria-hidden />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => setConfirmar(true)}>
                Finalizar prova
              </button>
            )}
          </nav>
        </div>

        <aside className="hidden lg:block" aria-label="Mapa de questões">
          <div className="sticky top-[160px] max-h-[calc(100dvh-180px)] overflow-y-auto rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line">{mapa}</div>
        </aside>
      </div>

      {mapaAberto && (
        <Dialogo titulo="Mapa de questões" aoFechar={() => setMapaAberto(false)}>
          {mapa}
        </Dialogo>
      )}
      {confirmar && (
        <Dialogo titulo="Finalizar a prova?" aoFechar={() => setConfirmar(false)}>
          <p className="text-ink-muted">
            Depois de finalizar, não será possível alterar as respostas. Você verá o gabarito e o seu desempenho.
          </p>
          <ul className="mt-4 space-y-1 text-ink">
            <li>
              <strong>{respondidas}</strong> respondidas
            </li>
            <li className={pendentes ? 'text-action-strong' : ''}>
              <strong>{pendentes}</strong> em branco
            </li>
            <li>
              <strong>{t.revisar.length}</strong> marcadas para revisão
            </li>
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
            <button type="button" className="btn btn-primary" onClick={concluir}>
              Finalizar e ver resultado
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmar(false)}>
              Continuar a prova
            </button>
          </div>
        </Dialogo>
      )}
    </>
  )
}

function MapaQuestoes({ t, temRedacao, redacaoIniciada, aoIr }: { t: Tentativa; temRedacao: boolean; redacaoIniciada: boolean; aoIr: (i: number) => void }) {
  const respondidas = Object.keys(t.respostas).length
  return (
    <div>
      <p className="text-sm text-ink-muted" aria-live="polite">
        <strong className="text-ink">{respondidas}</strong> respondidas · <strong className="text-ink">{t.questoes.length - respondidas}</strong> pendentes ·{' '}
        <strong className="text-ink">{t.revisar.length}</strong> para revisar
      </p>
      {t.blocos.map((b) => (
        <div key={b.area} className="mt-5">
          <h2 className="text-xs font-bold tracking-[0.08em] text-ink-muted uppercase">{NOME_CURTO[b.area]}</h2>
          <ol className="mt-2 grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-6">
            {t.questoes.slice(b.inicio, b.fim + 1).map((qid, k) => {
              const i = b.inicio + k
              const resp = t.respostas[qid]
              const rev = t.revisar.includes(qid)
              const atual = i === t.atual
              return (
                <li key={qid}>
                  <button
                    type="button"
                    onClick={() => aoIr(i)}
                    aria-current={atual ? 'step' : undefined}
                    aria-label={`Questão ${i + 1}: ${resp ? `respondida (${resp})` : 'em branco'}${rev ? ', marcada para revisão' : ''}`}
                    className={`relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold tabular-nums transition-colors ${resp ? 'bg-brand text-white' : 'bg-paper text-ink ring-1 ring-line hover:ring-brand'} ${atual ? 'outline-3 outline-offset-1 outline-ink' : ''}`}
                  >
                    {i + 1}
                    {rev && <span aria-hidden className="absolute -top-1 -right-1 size-3 rounded-full bg-energy ring-2 ring-white" />}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
      {temRedacao && (
        <button
          type="button"
          onClick={() => aoIr(t.questoes.length)}
          aria-current={t.atual === t.questoes.length ? 'step' : undefined}
          className={`mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold ring-1 ${redacaoIniciada ? 'bg-brand-soft text-brand-strong ring-brand' : 'bg-paper text-ink ring-line'} ${t.atual === t.questoes.length ? 'outline-3 outline-offset-1 outline-ink' : ''}`}
        >
          <PenLine className="size-4" aria-hidden /> Redação {redacaoIniciada ? '(iniciada)' : ''}
        </button>
      )}
      <ul className="mt-5 space-y-1.5 text-xs text-ink-muted">
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-3.5 rounded bg-brand" /> Respondida
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-3.5 rounded bg-paper ring-1 ring-line" /> Em branco
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-full bg-energy" /> Marcada para revisão
        </li>
      </ul>
    </div>
  )
}
