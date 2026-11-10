import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Diálogo modal nativo (<dialog>): foco preso, Esc fecha, clique fora fecha. */
export function Dialogo({ titulo, aoFechar, children }: { titulo: string; aoFechar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    // Ao desmontar, o <dialog> sai do DOM e fecha sozinho; chamar close() aqui
    // dispararia onClose e fecharia o diálogo recém-aberto (modo estrito do React).
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])
  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      onClick={(e) => e.target === ref.current && aoFechar()}
      aria-labelledby="dialogo-titulo"
      className="m-auto w-[min(92vw,34rem)] rounded-[var(--radius-card)] bg-white p-0 text-ink shadow-[var(--shadow-lift)] backdrop:bg-ink/50"
    >
      <div className="max-h-[85dvh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="dialogo-titulo" className="text-xl font-extrabold">
            {titulo}
          </h2>
          <button type="button" onClick={aoFechar} className="-mt-2 -mr-2 flex size-11 items-center justify-center rounded-full text-ink-muted hover:bg-paper" aria-label="Fechar">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  )
}
