import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Download, FileText, HardDrive, Loader2, PlayCircle, Upload } from 'lucide-react'
import { Seo } from '../../components/Seo'
import { redacoes, tentativas } from '../../simulados/db'
import { baixarArquivo, gerarBackup, restaurarBackup, validarBackup, type Backup } from '../../simulados/backup'
import { formatarDuracao } from '../../simulados/correcao'
import { calcularPainel } from '../../simulados/painel'
import { BarrasPercentual, Indicador, LinhaEvolucao } from '../../simulados/ui/Graficos'
import { Dialogo } from '../../simulados/ui/Dialogo'
import { temaPorId } from '../../simulados/redacao/temas'
import type { Redacao, Tentativa } from '../../simulados/tipos'
import { NOME_CURTO } from '../../simulados/tipos'

export default function Desempenho() {
  const [dados, setDados] = useState<{ t: Tentativa[]; r: Redacao[] } | null>(null)
  const carregar = () => Promise.all([tentativas.listar(), redacoes.listar()]).then(([t, r]) => setDados({ t, r }))
  useEffect(() => {
    carregar().catch(() => setDados({ t: [], r: [] }))
  }, [])

  const p = dados ? calcularPainel(dados.t, dados.r) : null
  const vazio = p && !p.simulados && !p.redacoesConcluidas && !dados!.t.length && !dados!.r.length

  return (
    <>
      <Seo title="Meu Desempenho" description="Acompanhe seus simulados, acertos por área, evolução e redações, com dados salvos só no seu dispositivo." />
      <section className="border-b border-line bg-paper py-10 md:py-14">
        <div className="container-site">
          <Link to="/simulados" className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand hover:text-action">
            <ArrowLeft className="size-4" aria-hidden /> Simulados
          </Link>
          <h1 className="mt-3 text-[2.25rem] leading-[1.1] font-extrabold sm:text-5xl">Meu Desempenho</h1>
          <p className="mt-3 flex max-w-2xl items-start gap-2 text-ink-muted">
            <HardDrive className="mt-1 size-5 shrink-0 text-brand" aria-hidden />
            Seu histórico fica salvo apenas neste navegador. Se você limpar os dados do site ou trocar de aparelho, ele se perde — use o
            backup abaixo para guardar uma cópia.
          </p>
        </div>
      </section>

      {!p ? (
        <p role="status" className="container-site flex justify-center gap-2 py-20 text-ink-muted">
          <Loader2 className="size-5 animate-spin" aria-hidden /> Carregando…
        </p>
      ) : vazio ? (
        <section className="bg-white py-16">
          <div className="container-site max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold">Nenhuma atividade por aqui ainda.</h2>
            <p className="mt-3 text-ink-muted">Faça seu primeiro simulado ou escreva uma redação. Os resultados aparecem aqui automaticamente.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/simulados/dia-1" className="btn btn-primary">
                <PlayCircle className="size-5" aria-hidden /> Começar um simulado
              </Link>
              <Link to="/simulados/redacao" className="btn btn-secondary">
                Escrever uma redação
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section aria-labelledby="resumo" className="bg-white py-10 md:py-14">
            <div className="container-site">
              <h2 id="resumo" className="sr-only">
                Resumo
              </h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Indicador rotulo="Simulados concluídos" valor={String(p.simulados)} detalhe={`${p.completos} completos · ${p.treinos} treinos`} />
                <Indicador rotulo="Questões respondidas" valor={p.respondidas.toLocaleString('pt-BR')} detalhe={`de ${p.questoes.toLocaleString('pt-BR')} apresentadas`} />
                <Indicador rotulo="Acertos" valor={p.acertos.toLocaleString('pt-BR')} detalhe={`${p.percentual.toLocaleString('pt-BR')}% de acertos`} />
                <Indicador rotulo="Tempo médio por prova" valor={p.simulados ? formatarDuracao(p.tempoMedioMs, false) : '—'} detalhe="Simulados completos e treinos" />
              </div>
            </div>
          </section>

          {p.simulados > 0 && (
            <section aria-labelledby="graficos" className="bg-paper py-10 md:py-14">
              <div className="container-site grid grid-cols-1 gap-6 lg:grid-cols-2">
                <h2 id="graficos" className="sr-only">
                  Gráficos
                </h2>
                <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
                  <h3 className="text-xl font-extrabold">Acertos por área</h3>
                  <p className="mt-1 text-sm text-ink-muted">Soma de todos os simulados concluídos.</p>
                  <div className="mt-5">
                    <BarrasPercentual
                      titulo="Percentual de acertos por área"
                      itens={p.porArea.map((a) => ({ rotulo: NOME_CURTO[a.area], valor: a.total ? (a.acertos / a.total) * 100 : 0, detalhe: `${a.acertos} de ${a.total}` }))}
                    />
                  </div>
                </div>
                <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
                  <h3 className="text-xl font-extrabold">Evolução</h3>
                  <p className="mt-1 text-sm text-ink-muted">Percentual de acertos em cada simulado, do mais antigo ao mais recente.</p>
                  <div className="mt-4">
                    <LinhaEvolucao pontos={p.evolucao} />
                  </div>
                </div>
              </div>
            </section>
          )}

          <section aria-labelledby="historico" className="bg-white py-10 md:py-14">
            <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 id="historico" className="text-2xl font-extrabold">
                  Histórico de atividades
                </h2>
                <ul className="mt-5 divide-y divide-line rounded-[var(--radius-card)] ring-1 ring-line">
                  {p.atividades.slice(0, 30).map((at) => (
                    <li key={at.id}>
                      <Link to={at.link} className="flex min-h-14 items-center gap-4 px-5 py-3 hover:bg-paper">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-ink">{at.titulo}</span>
                          <span className="text-sm text-ink-muted">
                            {new Date(at.data).toLocaleDateString('pt-BR')} · {at.detalhe}
                          </span>
                        </span>
                        <ArrowRight className="size-5 shrink-0 text-brand" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">Redação</h2>
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <Indicador rotulo="Redações concluídas" valor={String(p.redacoesConcluidas)} />
                  <Indicador rotulo="Temas praticados" valor={String(p.temasPraticados.length)} />
                </div>
                {p.temasPraticados.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                    {p.temasPraticados.slice(0, 8).map((id) => (
                      <li key={id} className="flex gap-2">
                        <FileText className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden /> {temaPorId(id)?.titulo ?? id}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-xs text-ink-subtle">Indicadores de redação são técnicos (quantidade e conclusão), não notas.</p>
              </div>
            </div>
          </section>
        </>
      )}

      {p && <SecaoBackup aoRestaurar={carregar} />}
    </>
  )
}

function SecaoBackup({ aoRestaurar }: { aoRestaurar: () => Promise<unknown> }) {
  const input = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [pendente, setPendente] = useState<Backup | null>(null)

  async function exportar() {
    const b = await gerarBackup()
    baixarArquivo(`afirmacao-historico-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(b))
    setMsg({ tipo: 'ok', texto: `Backup gerado com ${b.tentativas.length} simulado(s) e ${b.redacoes.length} redação(ões).` })
  }
  async function escolher(f: File | undefined) {
    if (!f) return
    const v = validarBackup(await f.text())
    if (!v.ok) setMsg({ tipo: 'erro', texto: v.erro! })
    else setPendente(v.backup!)
    if (input.current) input.current.value = ''
  }
  async function confirmar(substituir: boolean) {
    const n = await restaurarBackup(pendente!, substituir)
    setPendente(null)
    await aoRestaurar()
    setMsg({ tipo: 'ok', texto: `Histórico importado: ${n.tentativas} simulado(s) e ${n.redacoes} redação(ões).` })
  }

  return (
    <section aria-labelledby="backup" className="border-t border-line bg-paper py-10 md:py-14">
      <div className="container-site max-w-3xl">
        <h2 id="backup" className="text-2xl font-extrabold">
          Backup do histórico
        </h2>
        <p className="mt-2 text-ink-muted">
          Exporte um arquivo JSON com seus simulados e redações para guardar ou levar para outro aparelho. Importar valida o arquivo antes
          de gravar qualquer dado.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" className="btn btn-primary" onClick={exportar}>
            <Download className="size-5" aria-hidden /> Exportar histórico
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => input.current?.click()}>
            <Upload className="size-5" aria-hidden /> Importar histórico
          </button>
          <input ref={input} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => escolher(e.target.files?.[0])} />
        </div>
        {msg && (
          <p role={msg.tipo === 'erro' ? 'alert' : 'status'} className={`mt-4 font-semibold ${msg.tipo === 'erro' ? 'text-action-strong' : 'text-ok-strong'}`}>
            {msg.texto}
          </p>
        )}
      </div>
      {pendente && (
        <Dialogo titulo="Importar este histórico?" aoFechar={() => setPendente(null)}>
          <p className="text-ink-muted">
            O arquivo tem {pendente.tentativas.length} simulado(s) e {pendente.redacoes.length} redação(ões), exportado em{' '}
            {new Date(pendente.exportadoEm).toLocaleDateString('pt-BR')}.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button type="button" className="btn btn-primary" onClick={() => confirmar(false)}>
              Juntar com o histórico atual
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => confirmar(true)}>
              Substituir o histórico atual
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setPendente(null)}>
              Cancelar
            </button>
          </div>
        </Dialogo>
      )}
    </section>
  )
}
