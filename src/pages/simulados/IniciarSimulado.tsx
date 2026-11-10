import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, Dumbbell, Loader2, PlayCircle } from 'lucide-react'
import { Seo } from '../../components/Seo'
import { carregarAreas } from '../../simulados/banco'
import { questoesVistas, tentativas, temasRecentes } from '../../simulados/db'
import { completoDisponivel, disponibilidade, montarTentativa } from '../../simulados/sorteio'
import { sortearTema } from '../../simulados/redacao/temas'
import type { Area, Dia, Lingua, QuestaoBanco } from '../../simulados/tipos'
import { AREAS_DIA, NOME_CURTO } from '../../simulados/tipos'

export default function IniciarSimulado() {
  const { dia: param } = useParams()
  const dia = (param === 'dia-1' ? 1 : param === 'dia-2' ? 2 : null) as Dia | null
  const navigate = useNavigate()
  const [bancos, setBancos] = useState<Record<Area, QuestaoBanco[]> | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [lingua, setLingua] = useState<Lingua>('ingles')
  const [porArea, setPorArea] = useState(10)
  const [iniciando, setIniciando] = useState(false)

  useEffect(() => {
    if (!dia) return
    carregarAreas(AREAS_DIA[dia]).then(setBancos, () => setErro('Não foi possível carregar o banco de questões. Verifique sua conexão.'))
  }, [dia])

  const disp = useMemo(() => (bancos && dia ? disponibilidade(dia, dia === 1 ? lingua : null, bancos) : []), [bancos, dia, lingua])
  if (!dia) return <Navigate to="/simulados" replace />
  const completo = bancos ? completoDisponivel(dia, dia === 1 ? lingua : null, bancos) : false

  async function iniciar(modalidade: 'completo' | 'treino') {
    if (!bancos || !dia) return
    setIniciando(true)
    try {
      const t = montarTentativa(bancos, { dia, lingua: dia === 1 ? lingua : null, modalidade, porAreaTreino: porArea, vistas: await questoesVistas() })
      if (dia === 1 && modalidade === 'completo') t.temaRedacao = sortearTema({ recentes: await temasRecentes() }).id
      await tentativas.salvar(t)
      navigate(`/simulados/prova/${t.id}`)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível iniciar o simulado.')
      setIniciando(false)
    }
  }

  return (
    <>
      <Seo title={`Simulado — ${dia}º dia`} description={`Prepare um simulado do ${dia}º dia do ENEM com questões oficiais sorteadas de várias edições.`} />
      <section className="bg-paper py-10 md:py-14">
        <div className="container-site max-w-3xl">
          <Link to="/simulados" className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand hover:text-action">
            <ArrowLeft className="size-4" aria-hidden /> Simulados
          </Link>
          <h1 className="mt-4 text-[2rem] leading-tight font-extrabold sm:text-[2.6rem]">{dia === 1 ? 'Primeiro dia' : 'Segundo dia'}</h1>
          <p className="mt-3 text-lg text-ink-muted">
            {dia === 1
              ? '45 questões de Linguagens e 45 de Ciências Humanas, mais uma proposta de redação. Duração de referência: 5h30.'
              : '45 questões de Ciências da Natureza e 45 de Matemática. Duração de referência: 5 horas.'}
          </p>

          <div className="mt-8 space-y-6 rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line sm:p-8">
            {dia === 1 && (
              <fieldset>
                <legend className="font-display text-lg font-bold text-ink">Língua estrangeira</legend>
                <p className="mt-1 text-sm text-ink-muted">As 5 primeiras questões de Linguagens serão da língua escolhida.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {(['ingles', 'espanhol'] as const).map((l) => (
                    <label key={l} className={`chip cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand ${lingua === l ? 'bg-brand text-white ring-brand' : ''}`}>
                      <input type="radio" name="lingua" value={l} checked={lingua === l} onChange={() => setLingua(l)} className="sr-only" />
                      {l === 'ingles' ? 'Inglês' : 'Espanhol'}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div>
              <h2 className="font-display text-lg font-bold">Questões validadas disponíveis</h2>
              {erro && (
                <p role="alert" className="mt-3 flex items-start gap-2 text-action-strong">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden /> {erro}
                </p>
              )}
              {!bancos && !erro && (
                <p role="status" className="mt-3 flex items-center gap-2 text-ink-muted">
                  <Loader2 className="size-4 animate-spin" aria-hidden /> Carregando o banco…
                </p>
              )}
              {bancos && (
                <ul className="mt-3 divide-y divide-line">
                  {disp.map((d, i) => {
                    const ok = d.disponivel >= d.necessario
                    const nome = d.area === 'LC' && d.necessario === 5 ? `${lingua === 'ingles' ? 'Inglês' : 'Espanhol'}` : d.area === 'LC' ? 'Linguagens (demais)' : NOME_CURTO[d.area]
                    return (
                      <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                        <span className="text-ink">{nome}</span>
                        <span className={`flex items-center gap-1.5 text-sm tabular-nums ${ok ? 'text-ok-strong' : 'text-action-strong'}`}>
                          {ok ? <CheckCircle2 className="size-4" aria-hidden /> : <AlertTriangle className="size-4" aria-hidden />}
                          {d.disponivel} disponíveis · {d.necessario} necessárias
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <ul className="space-y-2 text-sm text-ink-muted">
              <li>• O cronômetro conta o tempo em que a prova está aberta; você pode fechar e retomar depois, com as mesmas questões.</li>
              <li>• Respostas são salvas automaticamente neste dispositivo.</li>
              <li>• O gabarito só aparece depois que você finalizar a prova.</li>
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" className="btn btn-primary" disabled={!completo || iniciando} onClick={() => iniciar('completo')}>
                {iniciando ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <PlayCircle className="size-5" aria-hidden />}
                Começar simulado completo
              </button>
            </div>
            {bancos && !completo && (
              <p className="text-sm text-action-strong">
                O simulado completo fica indisponível até o banco validado ter questões suficientes em todas as áreas. Use o treino reduzido abaixo.
              </p>
            )}
          </div>

          <div className="mt-6 rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line sm:p-8">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Dumbbell className="size-5 text-brand" aria-hidden /> Treino reduzido
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Prática mais curta com as mesmas regras, identificada como treino no seu histórico. Não inclui redação.
            </p>
            <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="qtd">
              Questões por área
            </label>
            <select id="qtd" value={porArea} onChange={(e) => setPorArea(Number(e.target.value))} className="mt-1.5 min-h-11 rounded-xl bg-white px-3 ring-1 ring-line-strong">
              {[5, 10, 15, 20, 30].map((n) => (
                <option key={n} value={n}>
                  {n} por área ({n * 2} no total)
                </option>
              ))}
            </select>
            <div className="mt-4">
              <button type="button" className="btn btn-secondary" disabled={!bancos || iniciando} onClick={() => iniciar('treino')}>
                Começar treino
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
