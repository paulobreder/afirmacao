import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Download, ExternalLink, FileText, ListChecks, Wifi } from 'lucide-react'
import { Seo } from '../components/Seo'
import { PdfViewer } from '../components/PdfViewer'
import { MaterialCard } from '../components/MaterialCard'
import { categoriaVisual } from '../components/categoria-visual'
import { getCategoria, getMaterial, LIMITE_ARQUIVO_GRANDE, materiais, nomeDownload, pdfUrl } from '../data/materiais'
import { formatarTamanho } from '../lib/format'
import NotFound from './NotFound'

export default function MaterialPage() {
  const { slug = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const material = getMaterial(slug)
  if (!material) return <NotFound mensagem="Não encontramos este material. Ele pode ter mudado de endereço." />

  const categoria = getCategoria(material.categoria)
  const { badge } = categoriaVisual[material.categoria]
  const paginaParam = parseInt(params.get('pagina') ?? '1', 10)
  const pagina = Number.isNaN(paginaParam) ? 1 : Math.min(Math.max(paginaParam, 1), material.paginas)
  const setPagina = (n: number) => {
    const next = new URLSearchParams(params)
    if (n <= 1) next.delete('pagina')
    else next.set('pagina', String(n))
    setParams(next, { replace: true, preventScrollReset: true })
  }
  const abrirNaPagina = (n: number) => {
    setPagina(n)
    document.getElementById('visualizador')?.scrollIntoView({ block: 'start' })
  }
  const relacionados = materiais
    .filter((m) => m.categoria === material.categoria && m.slug !== material.slug)
    .slice(0, 4)
  const url = pdfUrl(material)

  return (
    <>
      <Seo title={material.titulo} description={`${material.descricao} PDF gratuito com ${material.paginas} páginas.`} />

      <section className="border-b border-line bg-ice">
        <div className="container-site pt-6 pb-8 md:pt-8 md:pb-10">
          <nav aria-label="Você está em" className="text-sm">
            <ol className="flex flex-wrap items-center gap-1 text-ink-muted">
              <li>
                <Link to="/materiais" className="inline-flex min-h-10 items-center gap-1.5 font-medium hover:text-brand">
                  <ArrowLeft className="size-4" aria-hidden /> Materiais
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-4" />
              </li>
              <li>
                <Link to={`/materiais?categoria=${categoria.id}`} className="inline-flex min-h-10 items-center hover:text-brand">
                  {categoria.nome}
                </Link>
              </li>
            </ol>
          </nav>

          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>{categoria.nome}</span>
                <span className="text-sm font-medium text-ink-subtle">{material.disciplina}</span>
              </p>
              <h1 className="mt-3 text-[2rem] leading-tight font-extrabold sm:text-[2.6rem]">{material.titulo}</h1>
              <p className="mt-3 text-lg text-ink-muted">{material.descricao}</p>
              <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.925rem] text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Formato</dt>
                  <FileText className="size-4" aria-hidden />
                  <dd>PDF · {material.paginas} páginas · {formatarTamanho(material.bytes)}</dd>
                </div>
                {material.origem && (
                  <div>
                    <dt className="inline font-medium text-navy">Origem: </dt>
                    <dd className="inline">{material.origem}</dd>
                  </div>
                )}
              </dl>
              {material.bytes > LIMITE_ARQUIVO_GRANDE && (
                <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-energy-soft px-4 py-2.5 text-[0.925rem] font-medium text-[#6b4800]">
                  <Wifi className="mt-0.5 size-4 shrink-0" aria-hidden />
                  Arquivo grande. O visualizador carrega uma página por vez; para baixar o arquivo inteiro, prefira uma rede Wi-Fi.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a href={url} download={nomeDownload(material)} className="btn btn-primary">
                <Download className="size-5" aria-hidden /> Baixar PDF
              </a>
              <a href={url} target="_blank" rel="noopener" className="btn btn-secondary">
                <ExternalLink className="size-5" aria-hidden /> Abrir em nova aba
              </a>
            </div>
          </div>

          {material.paginaResolucoes && (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 pl-4 ring-1 ring-line">
              <ListChecks className="size-5 text-brand" aria-hidden />
              <p className="text-[0.95rem] text-ink-muted">
                Questões nas páginas 2 a {material.paginaResolucoes - 1}; resoluções a partir da página {material.paginaResolucoes}.
              </p>
              <div className="grid w-full grid-cols-2 gap-2 sm:ml-auto sm:flex sm:w-auto">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => abrirNaPagina(2)}>
                  Ver questões
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => abrirNaPagina(material.paginaResolucoes!)}>
                  Ver resoluções
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="visualizador" aria-label="Visualização do PDF" className="scroll-mt-[72px] bg-ice py-6 md:py-10">
        <div className="container-site">
          <PdfViewer
            key={material.slug}
            url={url}
            titulo={material.titulo}
            totalPaginas={material.paginas}
            pagina={pagina}
            onPaginaChange={setPagina}
            downloadName={nomeDownload(material)}
          />
        </div>
      </section>

      {relacionados.length > 0 && (
        <section aria-labelledby="relacionados" className="bg-white py-16 md:py-20">
          <div className="container-site">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 id="relacionados" className="text-2xl font-extrabold sm:text-3xl">
                Mais em {categoria.nome}
              </h2>
              <Link to={`/materiais?categoria=${categoria.id}`} className="link-arrow min-h-11">
                Ver todos <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relacionados.map((m) => (
                <li key={m.slug}>
                  <MaterialCard material={m} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
