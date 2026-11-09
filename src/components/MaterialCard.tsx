import { Link } from 'react-router-dom'
import { Download, Eye, FileText, Wifi } from 'lucide-react'
import {
  capaUrl,
  getCategoria,
  LIMITE_ARQUIVO_GRANDE,
  nomeDownload,
  pdfUrl,
  type Material,
} from '../data/materiais'
import { formatarTamanho } from '../lib/format'
import { categoriaVisual } from './categoria-visual'

export function MaterialCard({ material, headingLevel = 'h3' }: { material: Material; headingLevel?: 'h2' | 'h3' | 'h4' }) {
  const categoria = getCategoria(material.categoria)
  const { shelf } = categoriaVisual[material.categoria]
  const Heading = headingLevel
  const grande = material.bytes > LIMITE_ARQUIVO_GRANDE

  return (
    <article className="card group relative grid h-full grid-cols-[96px_1fr] overflow-hidden sm:flex sm:flex-col transition-[box-shadow,transform] duration-300 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
      <div className={`relative overflow-hidden p-3 pr-0 sm:aspect-[16/11] sm:p-0 ${shelf}`}>
        <img
          src={capaUrl(material)}
          alt=""
          loading="lazy"
          decoding="async"
          width={480}
          height={645}
          className="h-auto w-full rounded-[4px] bg-white shadow-[0_6px_16px_-6px_rgb(24_41_66/0.35)] ring-1 ring-black/5 transition-transform duration-500 ease-[var(--ease-out)] sm:absolute sm:bottom-0 sm:left-1/2 sm:h-[84%] sm:w-auto sm:-translate-x-1/2 sm:translate-y-[6%] sm:rounded-t-[6px] sm:rounded-b-none sm:object-cover sm:shadow-[0_12px_28px_-8px_rgb(24_41_66/0.35)] sm:group-hover:translate-y-[2%]"
        />
        <span className="absolute top-3 left-3 hidden rounded-full bg-white sm:inline-block px-3 py-1 text-xs font-semibold text-navy shadow-sm">
          {categoria.nomeCurto}
        </span>
      </div>
      <div className="flex min-w-0 flex-col p-4 sm:flex-1 sm:p-5">
        <p className="text-sm font-medium text-ink-subtle">
          {material.disciplina}
          <span className="sm:hidden"> · {categoria.nomeCurto}</span>
        </p>
        <Heading className="mt-1 text-[1.05rem] leading-snug font-bold sm:text-lg">
          <Link
            to={`/materiais/${material.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {material.titulo}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-2 text-[0.925rem] sm:line-clamp-3 leading-relaxed text-ink-muted">{material.descricao}</p>
        <dl className="mt-3 flex sm:mt-4 flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-subtle">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Formato</dt>
            <FileText className="size-4" aria-hidden />
            <dd>PDF</dd>
          </div>
          <div>
            <dt className="sr-only">Páginas</dt>
            <dd>{material.paginas} páginas</dd>
          </div>
          <div>
            <dt className="sr-only">Tamanho</dt>
            <dd>{formatarTamanho(material.bytes)}</dd>
          </div>
        </dl>
        {grande && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[0.825rem] font-medium text-[#7a5200]">
            <Wifi className="size-4" aria-hidden /> Arquivo grande: prefira usar Wi-Fi
          </p>
        )}
      </div>
      <div className="relative z-10 col-span-2 flex gap-2 px-4 pb-4 sm:px-5 sm:pb-5">
        <Link to={`/materiais/${material.slug}`} className="btn btn-primary btn-sm flex-1">
          <Eye className="size-4" aria-hidden />
          Visualizar
        </Link>
        <a
          href={pdfUrl(material)}
          download={nomeDownload(material)}
          className="btn btn-secondary btn-sm flex-1"
          aria-label={`Baixar ${material.titulo} (PDF, ${formatarTamanho(material.bytes)})`}
        >
          <Download className="size-4" aria-hidden />
          Baixar
        </a>
      </div>
    </article>
  )
}
