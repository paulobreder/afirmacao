import { useEffect, useRef, useState } from 'react'
import { TempoEfetivo } from './relogio'

/**
 * Cronômetro de tempo efetivo: soma o tempo apenas enquanto a página está visível.
 * Fechar a aba e voltar depois não reinicia nem "cobra" o tempo fechado.
 * `inicialMs` só é lido na montagem (monte o componente depois de carregar a tentativa).
 * `aoPersistir` é chamado a cada `intervaloSalvarMs` e ao ocultar/sair da página.
 */
export function useCronometro(inicialMs: number, ativo: boolean, aoPersistir: (ms: number) => void, intervaloSalvarMs = 10_000) {
  const [ms, setMs] = useState(inicialMs)
  const relogio = useRef<TempoEfetivo | null>(null)
  const persistir = useRef(aoPersistir)
  useEffect(() => {
    persistir.current = aoPersistir
  })

  useEffect(() => {
    if (!ativo) return
    relogio.current ??= new TempoEfetivo(inicialMs)
    const r = relogio.current
    const agora = () => performance.now()
    const iniciar = () => document.visibilityState === 'visible' && r.iniciar(agora())
    const pausar = () => {
      const v = r.pausar(agora())
      setMs(v)
      persistir.current(v)
    }
    iniciar()
    const tick = setInterval(() => setMs(r.valor(agora())), 1000)
    const salvar = setInterval(() => r.rodando && persistir.current(r.valor(agora())), intervaloSalvarMs)
    const visibilidade = () => (document.visibilityState === 'visible' ? iniciar() : pausar())
    document.addEventListener('visibilitychange', visibilidade)
    window.addEventListener('pagehide', pausar)
    return () => {
      pausar()
      clearInterval(tick)
      clearInterval(salvar)
      document.removeEventListener('visibilitychange', visibilidade)
      window.removeEventListener('pagehide', pausar)
    }
    // inicialMs é lido só na criação do relógio
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, intervaloSalvarMs])

  return ms
}
