import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, FileText, PenLine, Search, Shuffle } from 'lucide-react'
import { Seo } from '../../components/Seo'
import { novaRedacao, redacoes, temasRecentes } from '../../simulados/db'
import { EIXOS, sortearTema, TEMAS, temaPorId, type Tema } from '../../simulados/redacao/temas'
import { CartaoTema } from '../../simulados/ui/EditorRedacao'
import { normalizar } from '../../lib/format'
import type { Redacao } from '../../simulados/tipos'

export default function RedacaoLab() {
  const navigate = useNavigate()
  const [eixo, setEixo] = useState<string>('')
  const [sorteado, setSorteado] = useState<Tema | null>(null)
  const [historico, setHistorico] = useState<Redacao[]>([])
  const [busca, setBusca] = useState('')
  const [eixoLista, setEixoLista] = useState('')

  useEffect(() => {
    redacoes.listar().then(setHistorico, () => {})
  }, [])

  async function sortear() {
    const recentes = [...(await temasRecentes()), ...(sorteado ? [sorteado.id] : [])]
    setSorteado(sortearTema({ eixo: eixo || null, recentes }))
  }
  async function escrever(temaId: string) {
    const r = await novaRedacao(temaId)
    navigate(`/simulados/redacao/${r.id}`)
  }

  const lista = useMemo(() => {
    const b = normalizar(busca)
    return TEMAS.filter((t) => (!eixoLista || t.eixo === eixoLista) && (!b || normalizar(`${t.titulo} ${t.palavrasChave.join(' ')}`).includes(b)))
  }, [busca, eixoLista])

  return (
    <>
      <Seo title="Laboratório de Redação" description="Sorteie entre 100 temas, escreva com contagem de linhas e receba uma análise orientativa do seu texto, sem cadastro." />
      <section className="bg-waves relative overflow-x-clip border-b border-line bg-paper">
        <div className="container-site pt-10 pb-12 md:pt-14">
          <Link to="/simulados" className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand hover:text-action">
            <ArrowLeft className="size-4" aria-hidden /> Simulados
          </Link>
          <h1 className="mt-4 text-[2.25rem] leading-[1.1] font-extrabold sm:text-5xl">Laboratório de Redação</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            {TEMAS.length} propostas autorais sobre temas brasileiros, em {EIXOS.length} eixos. Escreva, salve automaticamente e use a análise
            por regras para revisar o texto.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start">
            <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
              <h2 className="font-display text-lg font-bold">Sortear um tema</h2>
              <label htmlFor="eixo" className="mt-4 block text-sm font-semibold">
                Eixo temático
              </label>
              <select id="eixo" value={eixo} onChange={(e) => setEixo(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl bg-white px-3 ring-1 ring-line-strong">
                <option value="">Todos os eixos</option>
                {EIXOS.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
              <button type="button" onClick={sortear} className="btn btn-primary mt-4 w-full">
                <Shuffle className="size-5" aria-hidden /> {sorteado ? 'Sortear outro' : 'Sortear tema'}
              </button>
              <p className="mt-3 text-xs text-ink-subtle">O sorteio evita os temas que você usou recentemente.</p>
            </div>
            <div aria-live="polite">
              {sorteado ? (
                <div>
                  <CartaoTema tema={sorteado} compacto />
                  <button type="button" onClick={() => escrever(sorteado.id)} className="btn btn-primary mt-4">
                    <PenLine className="size-5" aria-hidden /> Escrever sobre este tema
                  </button>
                </div>
              ) : (
                <div className="flex h-full min-h-40 items-center justify-center rounded-[var(--radius-card)] border-2 border-dashed border-line-strong p-6 text-center text-ink-muted">
                  O tema sorteado aparece aqui.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {historico.length > 0 && (
        <section aria-labelledby="minhas" className="bg-white py-10 md:py-14">
          <div className="container-site">
            <h2 id="minhas" className="text-2xl font-extrabold">
              Minhas redações
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              {historico.map((r) => (
                <li key={r.id}>
                  <Link to={`/simulados/redacao/${r.id}`} className="card group flex items-center gap-4 p-4 hover:shadow-[var(--shadow-lift)]">
                    <FileText className="size-6 shrink-0 text-brand" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{temaPorId(r.temaId)?.titulo ?? r.temaId}</span>
                      <span className="text-sm text-ink-muted">
                        {r.finalizadaEm ? 'Finalizada' : 'Rascunho'} · {new Date(r.atualizadaEm).toLocaleDateString('pt-BR')}
                        {r.tentativaId ? ' · do simulado' : ''}
                      </span>
                    </span>
                    <ArrowRight className="size-5 text-brand" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="temas" className="bg-paper py-10 md:py-14">
        <div className="container-site">
          <h2 id="temas" className="text-2xl font-extrabold">
            Todos os temas
          </h2>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Buscar tema</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-subtle" aria-hidden />
              <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por palavra" className="min-h-12 w-full rounded-full bg-white pr-4 pl-11 ring-1 ring-line-strong" />
            </label>
            <label>
              <span className="sr-only">Filtrar por eixo</span>
              <select value={eixoLista} onChange={(e) => setEixoLista(e.target.value)} className="min-h-12 w-full rounded-full bg-white px-4 ring-1 ring-line-strong sm:w-64">
                <option value="">Todos os eixos</option>
                {EIXOS.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-3 text-sm text-ink-muted" aria-live="polite">
            {lista.length} {lista.length === 1 ? 'tema' : 'temas'}
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {lista.map((t) => (
              <li key={t.id} className="flex flex-col rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line">
                <p className="text-xs font-semibold tracking-[0.08em] text-brand uppercase">{t.eixo}</p>
                <h3 className="mt-1.5 text-base leading-snug font-bold">{t.titulo}</h3>
                <p className="mt-2 flex-1 text-sm text-ink-muted">{t.contexto}</p>
                <button type="button" onClick={() => escrever(t.id)} className="link-arrow mt-3 min-h-11 self-start">
                  Escrever sobre este tema <ArrowRight className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
