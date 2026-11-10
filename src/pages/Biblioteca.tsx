import { useEffect, useId, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search, SearchX, X } from 'lucide-react'
import { Seo } from '../components/Seo'
import { MaterialCard } from '../components/MaterialCard'
import { categoriaVisual } from '../components/categoria-visual'
import { categorias, disciplinas, materiais, type CategoriaId, type Material } from '../data/materiais'
import { normalizar } from '../lib/format'

const TODAS = 'todas'

function corresponde(m: Material, termo: string) {
  if (!termo) return true
  const alvo = normalizar(
    [m.titulo, m.disciplina, m.descricao, m.origem ?? '', categorias.find((c) => c.id === m.categoria)?.nome ?? ''].join(' '),
  )
  return normalizar(termo)
    .split(/\s+/)
    .every((palavra) => alvo.includes(palavra))
}

export default function Biblioteca() {
  const [params, setParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const searchId = useId()

  const categoriaParam = params.get('categoria')
  const categoria = categorias.some((c) => c.id === categoriaParam) ? (categoriaParam as CategoriaId) : null
  const disciplina = params.get('disciplina') ?? TODAS
  const busca = params.get('q') ?? ''

  useEffect(() => {
    if (params.get('buscar')) {
      inputRef.current?.focus()
      const next = new URLSearchParams(params)
      next.delete('buscar')
      setParams(next, { replace: true })
    }
  }, [params, setParams])

  const atualizar = (chave: string, valor: string | null) => {
    const next = new URLSearchParams(params)
    if (valor === null || valor === '' || valor === TODAS) next.delete(chave)
    else next.set(chave, valor)
    setParams(next, { replace: chave === 'q', preventScrollReset: true })
  }

  const daCategoria = categoria ? materiais.filter((m) => m.categoria === categoria) : materiais
  const disciplinasDisponiveis = disciplinas.filter((d) => daCategoria.some((m) => m.disciplina === d))
  const disciplinaAtiva = disciplinasDisponiveis.includes(disciplina) ? disciplina : TODAS

  const resultados = daCategoria.filter(
    (m) => (disciplinaAtiva === TODAS || m.disciplina === disciplinaAtiva) && corresponde(m, busca),
  )

  const temFiltro = Boolean(categoria || disciplinaAtiva !== TODAS || busca)
  const agrupar = !categoria && disciplinaAtiva === TODAS && !busca
  const limpar = () => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true })

  const resumo =
    resultados.length === 0
      ? 'Nenhum material encontrado.'
      : `${resultados.length} ${resultados.length === 1 ? 'material encontrado' : 'materiais encontrados'}${
          busca ? ` para “${busca}”` : ''
        }.`

  return (
    <>
      <Seo
        title="Materiais"
        description="Biblioteca gratuita da AfirmAção: apostilas de revisão, Raio-X ENEM com questões resolvidas, fichas de resumo e os conteúdos mais cobrados. Visualize ou baixe em PDF."
      />

      <section className="bg-waves border-b border-line bg-paper">
        <div className="container-site pt-10 pb-10 md:pt-14 md:pb-14">
          <p className="eyebrow">Biblioteca</p>
          <h1 className="mt-3 text-[2.25rem] leading-tight font-extrabold sm:text-5xl">Materiais de estudo</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            Apostilas, questões resolvidas e resumos para estudar para o ENEM. Abra no navegador ou baixe o PDF, sem
            cadastro.
          </p>

          <form role="search" className="mt-8 max-w-2xl" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor={searchId} className="mb-2 block text-sm font-semibold text-ink">
              Buscar por título, disciplina ou assunto
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-subtle" aria-hidden />
              <input
                ref={inputRef}
                id={searchId}
                type="search"
                inputMode="search"
                autoComplete="off"
                enterKeyHint="search"
                placeholder="Ex.: biologia, resumo, matemática"
                value={busca}
                onChange={(e) => atualizar('q', e.target.value)}
                className="h-14 w-full rounded-2xl border-0 bg-white pr-14 pl-12 text-base text-ink shadow-[var(--shadow-soft)] ring-1 ring-line-strong placeholder:text-ink-subtle focus:ring-2 focus:ring-brand focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => {
                    atualizar('q', null)
                    inputRef.current?.focus()
                  }}
                  className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-paper hover:text-ink"
                  aria-label="Limpar busca"
                >
                  <X className="size-5" aria-hidden />
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section aria-label="Filtros" className="border-b border-line bg-white">
        <div className="container-site space-y-5 py-6">
          <div>
            <h2 className="mb-3 font-sans text-sm font-semibold tracking-normal text-ink-muted">Categoria</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="chip"
                aria-pressed={!categoria}
                onClick={() => atualizar('categoria', null)}
              >
                Todas
                <span className="tabular-nums opacity-70">{materiais.length}</span>
              </button>
              {categorias.map((c) => {
                const { Icon } = categoriaVisual[c.id]
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="chip"
                    aria-pressed={categoria === c.id}
                    onClick={() => atualizar('categoria', c.id)}
                  >
                    <Icon className="size-4" aria-hidden />
                    {c.nome}
                    <span className="tabular-nums opacity-70">{materiais.filter((m) => m.categoria === c.id).length}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-sans text-sm font-semibold tracking-normal text-ink-muted" id="disc-label">
              Disciplina
            </h2>
            <select
              aria-labelledby="disc-label"
              value={disciplinaAtiva}
              onChange={(e) => atualizar('disciplina', e.target.value)}
              className="h-12 w-full rounded-xl border-0 bg-white px-4 text-base text-ink ring-1 ring-line-strong focus:ring-2 focus:ring-brand focus:outline-none sm:hidden"
            >
              <option value={TODAS}>Todas as disciplinas</option>
              {disciplinasDisponiveis.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="hidden flex-wrap gap-2 sm:flex" role="group" aria-labelledby="disc-label">
              <button
                type="button"
                className="chip"
                aria-pressed={disciplinaAtiva === TODAS}
                onClick={() => atualizar('disciplina', null)}
              >
                Todas
              </button>
              {disciplinasDisponiveis.map((d) => (
                <button
                  key={d}
                  type="button"
                  className="chip"
                  aria-pressed={disciplinaAtiva === d}
                  onClick={() => atualizar('disciplina', d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="resultados-titulo" className="bg-paper py-10 md:py-14">
        <div className="container-site">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <h2 id="resultados-titulo" className="sr-only">
              Resultados
            </h2>
            <p role="status" aria-live="polite" className="text-[0.95rem] font-medium text-ink-muted">
              {resumo}
            </p>
            {temFiltro && resultados.length > 0 && (
              <button type="button" onClick={limpar} className="btn btn-ghost btn-sm">
                <X className="size-4" aria-hidden /> Limpar filtros
              </button>
            )}
          </div>

          {resultados.length === 0 ? (
            <div className="card mx-auto max-w-lg px-6 py-12 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                <SearchX className="size-7" aria-hidden />
              </span>
              <p className="mt-5 font-display text-xl font-bold text-ink">Nada encontrado com esses filtros</p>
              <p className="mt-2 text-ink-muted">
                Tente outra palavra (por exemplo, o nome da disciplina) ou veja todos os materiais.
              </p>
              <button type="button" onClick={limpar} className="btn btn-primary mt-6">
                Ver todos os materiais
              </button>
            </div>
          ) : agrupar ? (
            <div className="space-y-16">
              {categorias.map((c) => {
                const itens = resultados.filter((m) => m.categoria === c.id)
                const { Icon, iconBg } = categoriaVisual[c.id]
                return (
                  <section key={c.id} aria-labelledby={`grupo-${c.id}`}>
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className={`flex size-12 items-center justify-center rounded-2xl ${iconBg}`}>
                          <Icon className="size-6" aria-hidden />
                        </span>
                        <div>
                          <h3 id={`grupo-${c.id}`} className="text-2xl font-extrabold">
                            {c.nome}
                          </h3>
                          <p className="text-ink-muted">{c.descricao}</p>
                        </div>
                      </div>
                      <button type="button" className="link-arrow min-h-11" onClick={() => atualizar('categoria', c.id)}>
                        Ver só {c.nomeCurto} ({itens.length}) <ArrowRight className="size-4" aria-hidden />
                      </button>
                    </div>
                    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {itens.map((m) => (
                        <li key={m.slug}>
                          <MaterialCard material={m} headingLevel="h4" />
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {resultados.map((m) => (
                <li key={m.slug}>
                  <MaterialCard material={m} />
                </li>
              ))}
            </ul>
          )}

          <aside className="mt-16 flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="font-display text-lg font-extrabold text-ink">Procurando informações sobre Sisu, ProUni ou Fies?</p>
              <p className="mt-1 text-ink-muted">Os documentos e critérios de cada programa estão no Guia do Estudante.</p>
            </div>
            <Link to="/guia" className="btn btn-secondary shrink-0">
              Abrir o Guia <ArrowRight className="size-4" aria-hidden />
            </Link>
          </aside>
        </div>
      </section>
    </>
  )
}
