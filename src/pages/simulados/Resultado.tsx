import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, CircleSlash, Info, Loader2, PenLine, RotateCcw, XCircle } from 'lucide-react'
import { Seo } from '../../components/Seo'
import { carregarAreas, mapaPorId } from '../../simulados/banco'
import { tentativas } from '../../simulados/db'
import { formatarDuracao } from '../../simulados/correcao'
import { Alternativas, QuestaoEnunciado } from '../../simulados/ui/Questao'
import { BarrasPercentual, Indicador } from '../../simulados/ui/Graficos'
import type { Area, QuestaoBanco, Tentativa } from '../../simulados/tipos'
import { NOME_AREA, NOME_CURTO } from '../../simulados/tipos'

type Filtro = 'todas' | 'erros' | 'brancos' | 'acertos' | 'revisar'

export default function Resultado() {
  const { id = '' } = useParams()
  const [t, setT] = useState<Tentativa | null | undefined>(undefined)
  const [porId, setPorId] = useState<Map<string, QuestaoBanco> | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('todas')

  useEffect(() => {
    tentativas.obter(id).then(async (tt) => {
      setT(tt ?? null)
      if (tt) setPorId(mapaPorId(await carregarAreas(tt.blocos.map((b) => b.area))))
    }, () => setT(null))
  }, [id])

  const itens = useMemo(() => {
    if (!t?.resultado) return []
    return t.questoes.map((qid, i) => {
      const area = t.blocos.find((b) => i >= b.inicio && i <= b.fim)!.area
      const resp = t.respostas[qid]
      const gab = t.resultado!.gabaritos[qid]
      const situacao = !resp ? 'branco' : resp === gab ? 'acerto' : 'erro'
      return { qid, i, area, resp, gab, situacao }
    })
  }, [t])

  if (t === undefined)
    return (
      <p role="status" className="container-site flex justify-center gap-2 py-24 text-ink-muted">
        <Loader2 className="size-5 animate-spin" aria-hidden /> Carregando resultado…
      </p>
    )
  if (!t || !t.resultado)
    return (
      <div className="container-site max-w-2xl py-20 text-center">
        <AlertTriangle className="mx-auto size-10 text-action" aria-hidden />
        <h1 className="mt-4 text-2xl font-extrabold">{t ? 'Este simulado ainda não foi finalizado.' : 'Resultado não encontrado neste dispositivo.'}</h1>
        <Link to={t ? `/simulados/prova/${t.id}` : '/simulados'} className="btn btn-primary mt-6">
          {t ? 'Voltar à prova' : 'Ir para os simulados'}
        </Link>
      </div>
    )

  const r = t.resultado
  const filtrados = itens.filter((x) =>
    filtro === 'todas' ? true : filtro === 'erros' ? x.situacao === 'erro' : filtro === 'brancos' ? x.situacao === 'branco' : filtro === 'acertos' ? x.situacao === 'acerto' : t.revisar.includes(x.qid),
  )
  const data = new Date(t.finalizadaEm!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <>
      <Seo title="Resultado do simulado" description="Desempenho no simulado e revisão das questões com o gabarito oficial." />
      <section className="border-b border-line bg-paper py-10 md:py-14">
        <div className="container-site">
          <p className="eyebrow">
            Resultado · {t.dia}º dia{t.modalidade === 'treino' ? ' · Treino reduzido' : ''}
          </p>
          <h1 className="mt-3 text-[2rem] leading-tight font-extrabold sm:text-[2.6rem]">
            Você acertou {r.acertos} de {r.total} questões.
          </h1>
          <p className="mt-2 text-ink-muted">Finalizado em {data}.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Indicador rotulo="Acertos" valor={String(r.acertos)} />
            <Indicador rotulo="Erros" valor={String(r.erros)} />
            <Indicador rotulo="Em branco" valor={String(r.brancos)} />
            <Indicador rotulo="Percentual de acertos" valor={`${r.percentual.toLocaleString('pt-BR')}%`} />
            <Indicador rotulo="Tempo de prova" valor={formatarDuracao(r.tempoMs, false)} detalhe={`Referência: ${formatarDuracao(t.duracaoRefMs, false)}`} />
          </div>
          <p className="mt-6 flex max-w-3xl items-start gap-2 text-sm text-ink-muted">
            <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            Este é um resultado objetivo de acertos. A nota oficial do ENEM usa a Teoria de Resposta ao Item (TRI), que não pode ser
            reproduzida apenas com a contagem de acertos; por isso não exibimos uma nota estimada.
          </p>
        </div>
      </section>

      <section aria-labelledby="por-area" className="bg-white py-10 md:py-14">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 id="por-area" className="text-2xl font-extrabold">
              Desempenho por área
            </h2>
            <div className="mt-6">
              <BarrasPercentual
                titulo="Percentual de acertos por área"
                itens={r.porArea.map((a) => ({
                  rotulo: NOME_CURTO[a.area],
                  valor: a.total ? (a.acertos / a.total) * 100 : 0,
                  detalhe: `${a.acertos} de ${a.total}`,
                }))}
              />
            </div>
            <div className="sr-only">
            <table>
              <caption>Resultado por área</caption>
              <thead>
                <tr>
                  <th>Área</th>
                  <th>Acertos</th>
                  <th>Erros</th>
                  <th>Em branco</th>
                </tr>
              </thead>
              <tbody>
                {r.porArea.map((a) => (
                  <tr key={a.area}>
                    <td>{NOME_AREA[a.area]}</td>
                    <td>{a.acertos}</td>
                    <td>{a.erros}</td>
                    <td>{a.brancos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {t.redacaoId && (
              <Link to={`/simulados/redacao/${t.redacaoId}`} className="card group flex items-center gap-4 p-5 hover:shadow-[var(--shadow-lift)]">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-action text-white">
                  <PenLine className="size-6" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block font-display font-bold text-ink">Ver a redação deste simulado</span>
                  <span className="text-sm text-ink-muted">Análise orientativa e checklist de autoavaliação</span>
                </span>
                <ArrowRight className="size-5 text-brand" aria-hidden />
              </Link>
            )}
            <Link to={`/simulados/dia-${t.dia}`} className="card group flex items-center gap-4 p-5 hover:shadow-[var(--shadow-lift)]">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <RotateCcw className="size-6" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-display font-bold text-ink">Fazer outro simulado do {t.dia}º dia</span>
                <span className="text-sm text-ink-muted">Novo sorteio, priorizando questões que você ainda não viu</span>
              </span>
              <ArrowRight className="size-5 text-brand" aria-hidden />
            </Link>
            <Link to="/simulados/desempenho" className="link-arrow self-start">
              Ver Meu Desempenho <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="revisao" className="bg-paper py-10 md:py-14">
        <div className="container-site max-w-4xl">
          <h2 id="revisao" className="text-2xl font-extrabold">
            Revisar questões
          </h2>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar questões">
            {(
              [
                ['todas', `Todas (${itens.length})`],
                ['erros', `Erros (${r.erros})`],
                ['brancos', `Em branco (${r.brancos})`],
                ['acertos', `Acertos (${r.acertos})`],
                ['revisar', `Marcadas (${t.revisar.length})`],
              ] as [Filtro, string][]
            ).map(([f, rot]) => (
              <button key={f} type="button" className="chip" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
                {rot}
              </button>
            ))}
          </div>
          {!porId ? (
            <p role="status" className="mt-6 text-ink-muted">
              Carregando questões…
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {filtrados.map((x) => (
                <ItemRevisao key={x.qid} x={x} q={porId.get(x.qid)} />
              ))}
              {!filtrados.length && <li className="text-ink-muted">Nenhuma questão neste filtro.</li>}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

function ItemRevisao({ x, q }: { x: { qid: string; i: number; area: Area; resp?: string; gab: string; situacao: string }; q?: QuestaoBanco }) {
  const [aberto, setAberto] = useState(false)
  const Icone = x.situacao === 'acerto' ? CheckCircle2 : x.situacao === 'erro' ? XCircle : CircleSlash
  const cor = x.situacao === 'acerto' ? 'text-ok' : x.situacao === 'erro' ? 'text-action' : 'text-ink-subtle'
  const rotulo = x.situacao === 'acerto' ? 'Acerto' : x.situacao === 'erro' ? 'Erro' : 'Em branco'
  return (
    <li className="rounded-[var(--radius-card)] bg-white ring-1 ring-line">
      <details onToggle={(e) => setAberto((e.target as HTMLDetailsElement).open)}>
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 py-3">
          <Icone className={`size-6 shrink-0 ${cor}`} aria-hidden />
          <span className="flex-1">
            <span className="font-display font-bold text-ink">Questão {x.i + 1}</span>{' '}
            <span className="text-sm text-ink-muted">
              · {NOME_CURTO[x.area]} · ENEM {q?.ano}
            </span>
          </span>
          <span className="text-sm text-ink-muted tabular-nums">
            <span className="sr-only">{rotulo}. </span>
            Sua: <strong className="text-ink">{x.resp ?? '—'}</strong> · Gabarito: <strong className="text-ink">{x.gab}</strong>
          </span>
        </summary>
        {aberto && q && (
          <div className="border-t border-line px-5 pt-4 pb-6">
            <QuestaoEnunciado q={q} area={x.area} />
            <Alternativas nome={`rev-${x.qid}`} valor={x.resp as never} bloqueado correta={x.gab as never} />
          </div>
        )}
      </details>
    </li>
  )
}
