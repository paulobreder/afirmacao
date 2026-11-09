import { useCallback, useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { ChevronLeft, ChevronRight, CircleAlert, Download, ExternalLink, LoaderCircle, ZoomIn, ZoomOut } from 'lucide-react'

type Status = 'loading' | 'ready' | 'error' | 'missing'

const ZOOMS = [1, 1.25, 1.5, 2, 2.5]

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null
function loadPdfjs() {
  // Carregado sob demanda para não pesar nas demais páginas.
  pdfjsPromise ??= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(
    ([lib, worker]) => {
      lib.GlobalWorkerOptions.workerSrc = worker.default
      return lib
    },
  )
  return pdfjsPromise
}

async function arquivoExiste(url: string) {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok && (res.headers.get('content-type') ?? '').includes('pdf')
  } catch {
    // Sem conexão: não dá para saber; mantém as alternativas de abrir e baixar.
    return true
  }
}

interface Props {
  url: string
  titulo: string
  totalPaginas: number
  pagina: number
  onPaginaChange: (pagina: number) => void
  downloadName: string
}

export function PdfViewer({ url, titulo, totalPaginas, pagina, onPaginaChange, downloadName }: Props) {
  const [status, setStatus] = useState<Status>('loading')
  const [progresso, setProgresso] = useState<number | null>(null)
  const [renderizando, setRenderizando] = useState(false)
  const [desenhado, setDesenhado] = useState(false)
  const [zoomIdx, setZoomIdx] = useState(0)
  const [largura, setLargura] = useState(0)
  const [numPaginas, setNumPaginas] = useState(totalPaginas)
  // Texto digitado no campo de página enquanto o estudante edita (null = mostra a página atual).
  const [digitando, setDigitando] = useState<string | null>(null)
  const paginaDigitada = digitando ?? String(pagina)

  const docRef = useRef<PDFDocumentProxy | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const topoRef = useRef<HTMLDivElement>(null)
  const renderTaskRef = useRef<RenderTask | null>(null)

  // Largura disponível (ajuste à largura da tela).
  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setLargura(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Abre o documento. Os arquivos grandes são lidos por partes (range requests).
  useEffect(() => {
    // O componente recebe uma `key` por material, então a URL não muda durante sua vida.
    let cancelado = false
    let destroy: (() => void) | undefined
    loadPdfjs()
      .then((pdfjs) => {
        if (cancelado) return
        const task = pdfjs.getDocument({ url, disableAutoFetch: true, disableStream: true, rangeChunkSize: 262144 })
        destroy = () => void task.destroy()
        task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (total) setProgresso(Math.min(100, Math.round((loaded / total) * 100)))
        }
        return task.promise.then((doc) => {
          if (cancelado) return
          docRef.current = doc
          setNumPaginas(doc.numPages)
          setStatus('ready')
        })
      })
      .catch(async () => {
        if (cancelado) return
        // Diferencia arquivo ausente (não oferecer download falso) de falha do visualizador.
        const existe = await arquivoExiste(url)
        if (!cancelado) setStatus(existe ? 'error' : 'missing')
      })
    return () => {
      cancelado = true
      renderTaskRef.current?.cancel()
      docRef.current = null
      destroy?.()
    }
  }, [url])

  // Renderiza a página atual.
  useEffect(() => {
    const doc = docRef.current
    const canvas = canvasRef.current
    if (status !== 'ready' || !doc || !canvas || !largura) return
    let ativo = true
    setRenderizando(true)
    doc
      .getPage(Math.min(Math.max(pagina, 1), doc.numPages))
      .then((page) => {
        if (!ativo) return
        const base = page.getViewport({ scale: 1 })
        const larguraAlvo = Math.min(largura, 980) * ZOOMS[zoomIdx]
        const escala = larguraAlvo / base.width
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
        const viewport = page.getViewport({ scale: escala * dpr })
        renderTaskRef.current?.cancel()
        // Desenha fora da tela e só troca quando pronto, evitando piscar.
        const off = document.createElement('canvas')
        off.width = Math.floor(viewport.width)
        off.height = Math.floor(viewport.height)
        const task = page.render({ canvas: off, viewport })
        renderTaskRef.current = task
        return task.promise.then(() => {
          if (!ativo) return
          canvas.width = off.width
          canvas.height = off.height
          canvas.style.width = `${Math.floor(viewport.width / dpr)}px`
          canvas.style.height = `${Math.floor(viewport.height / dpr)}px`
          canvas.getContext('2d')?.drawImage(off, 0, 0)
          setRenderizando(false)
          setDesenhado(true)
        })
      })
      .catch((err: { name?: string }) => {
        if (err?.name === 'RenderingCancelledException') return
        if (ativo) setStatus('error')
      })
    return () => {
      ativo = false
    }
  }, [status, pagina, largura, zoomIdx])

  const irPara = useCallback(
    (n: number, rolar = true) => {
      const alvo = Math.min(Math.max(1, n), numPaginas)
      if (alvo !== pagina) onPaginaChange(alvo)
      if (rolar && topoRef.current && topoRef.current.getBoundingClientRect().top < 0) {
        topoRef.current.scrollIntoView({ block: 'start' })
      }
    },
    [numPaginas, pagina, onPaginaChange],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return
    if (e.key === 'ArrowRight') irPara(pagina + 1)
    if (e.key === 'ArrowLeft') irPara(pagina - 1)
  }

  if (status === 'missing') {
    return (
      <div role="alert" className="card px-6 py-12 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-action-soft text-action-strong">
          <CircleAlert className="size-7" aria-hidden />
        </span>
        <p className="mt-5 font-display text-xl font-bold text-navy">Este arquivo está indisponível no momento</p>
        <p className="mx-auto mt-2 max-w-md text-ink-muted">
          Não encontramos o PDF de “{titulo}” no servidor. Tente novamente mais tarde ou escolha outro material.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div role="alert" className="card px-6 py-12 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-action-soft text-action-strong">
          <CircleAlert className="size-7" aria-hidden />
        </span>
        <p className="mt-5 font-display text-xl font-bold text-navy">Não foi possível mostrar o PDF aqui</p>
        <p className="mx-auto mt-2 max-w-md text-ink-muted">
          Seu navegador pode não ser compatível com o visualizador ou a conexão caiu. Você ainda pode abrir o arquivo no
          leitor do próprio aparelho ou baixá-lo.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={url} target="_blank" rel="noopener" className="btn btn-primary">
            <ExternalLink className="size-4" aria-hidden /> Abrir o PDF
          </a>
          <a href={url} download={downloadName} className="btn btn-secondary">
            <Download className="size-4" aria-hidden /> Baixar PDF
          </a>
        </div>
      </div>
    )
  }

  const botao =
    'inline-flex size-11 items-center justify-center rounded-full text-navy transition-colors hover:bg-brand-soft hover:text-brand disabled:pointer-events-none disabled:opacity-40'

  return (
    <div ref={topoRef} className="scroll-mt-[88px]">
      <div
        className="sticky top-[72px] z-20 flex items-center justify-between gap-1 rounded-2xl bg-white/95 p-1.5 shadow-[var(--shadow-soft)] ring-1 ring-line backdrop-blur"
        role="toolbar"
        aria-label="Controles do visualizador"
      >
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button type="button" className={botao} onClick={() => irPara(pagina - 1)} disabled={pagina <= 1 || status !== 'ready'} aria-label="Página anterior">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <form
            className="flex items-center gap-1.5 text-sm text-ink-muted"
            onSubmit={(e) => {
              e.preventDefault()
              const n = parseInt(paginaDigitada, 10)
              if (!Number.isNaN(n)) irPara(n)
              setDigitando(null)
            }}
          >
            <label htmlFor="pagina-atual" className="sr-only">
              Página atual
            </label>
            <input
              id="pagina-atual"
              type="number"
              inputMode="numeric"
              min={1}
              max={numPaginas}
              value={paginaDigitada}
              onChange={(e) => setDigitando(e.target.value)}
              onBlur={() => setDigitando(null)}
              className="h-10 w-14 rounded-lg sm:w-16 border-0 bg-ice text-center text-base font-semibold text-navy tabular-nums ring-1 ring-line focus:ring-2 focus:ring-brand focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="whitespace-nowrap tabular-nums">de {numPaginas}</span>
          </form>
          <button type="button" className={botao} onClick={() => irPara(pagina + 1)} disabled={pagina >= numPaginas || status !== 'ready'} aria-label="Próxima página">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button type="button" className={botao} onClick={() => setZoomIdx((z) => Math.max(0, z - 1))} disabled={zoomIdx === 0} aria-label="Diminuir zoom">
            <ZoomOut className="size-5" aria-hidden />
          </button>
          <span className="hidden w-12 text-center text-sm font-semibold text-ink-muted tabular-nums sm:inline" aria-live="polite">
            {Math.round(ZOOMS[zoomIdx] * 100)}%
          </span>
          <button type="button" className={botao} onClick={() => setZoomIdx((z) => Math.min(ZOOMS.length - 1, z + 1))} disabled={zoomIdx === ZOOMS.length - 1} aria-label="Aumentar zoom">
            <ZoomIn className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={areaRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`${titulo}, página ${pagina} de ${numPaginas}. Use as setas do teclado para mudar de página.`}
        className="relative mt-4 min-h-[60vh] overflow-x-auto rounded-2xl bg-[#e9edf4] p-2 sm:p-4"
      >
        {(status === 'loading' || !desenhado) && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center" role="status">
            <LoaderCircle className="size-9 animate-spin text-brand" aria-hidden />
            <p className="font-medium text-navy">Abrindo o PDF…</p>
            {progresso !== null && progresso < 100 && (
              <div className="h-2 w-48 overflow-hidden rounded-full bg-white" aria-hidden>
                <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${progresso}%` }} />
              </div>
            )}
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`mx-auto block max-w-none bg-white shadow-[var(--shadow-soft)] transition-opacity duration-200 ${
            desenhado ? '' : 'hidden'
          } ${renderizando ? 'opacity-60' : 'opacity-100'}`}
        />
        {desenhado && renderizando && (
          <span className="pointer-events-none absolute top-6 right-6 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-navy shadow" role="status">
            <LoaderCircle className="size-4 animate-spin text-brand" aria-hidden /> Carregando página…
          </span>
        )}
      </div>

      {status === 'ready' && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => irPara(pagina - 1)} disabled={pagina <= 1}>
            <ChevronLeft className="size-4" aria-hidden /> Anterior
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => irPara(pagina + 1)} disabled={pagina >= numPaginas}>
            Próxima <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}
