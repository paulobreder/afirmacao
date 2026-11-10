import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Clock3, Languages, NotebookPen, PenLine, PlayCircle, ShieldCheck } from 'lucide-react'
import { Seo } from '../../components/Seo'
import { carregarIndice } from '../../simulados/banco'
import { tentativas } from '../../simulados/db'
import type { IndiceBanco, Tentativa } from '../../simulados/tipos'
import { NOME_CURTO } from '../../simulados/tipos'
import { formatarDuracao } from '../../simulados/correcao'

export default function SimuladosHub() {
  const [indice, setIndice] = useState<IndiceBanco | null>(null)
  const [erro, setErro] = useState(false)
  const [emAndamento, setEmAndamento] = useState<Tentativa[]>([])

  useEffect(() => {
    carregarIndice().then(setIndice, () => setErro(true))
    tentativas.listar().then((ts) => setEmAndamento(ts.filter((t) => !t.finalizadaEm)), () => {})
  }, [])

  const dias = [
    {
      dia: 1,
      titulo: 'Primeiro dia',
      itens: ['45 questões de Linguagens (com 5 de inglês ou espanhol)', '45 questões de Ciências Humanas', 'Proposta de redação'],
      duracao: '5h30 de referência',
      Icon: Languages,
    },
    {
      dia: 2,
      titulo: 'Segundo dia',
      itens: ['45 questões de Ciências da Natureza', '45 questões de Matemática'],
      duracao: '5h de referência',
      Icon: Clock3,
    },
  ]

  return (
    <>
      <Seo
        title="Simulados ENEM"
        description="Simulados gratuitos com questões oficiais do ENEM (Inep, 2016–2025), laboratório de redação e acompanhamento do seu desempenho, sem cadastro."
      />
      <section className="bg-waves relative overflow-x-clip border-b border-line bg-paper">
        <div className="container-site pt-10 pb-12 md:pt-14 md:pb-16">
          <p className="eyebrow">Simulados</p>
          <h1 className="mt-3 max-w-3xl text-[2.25rem] leading-[1.1] font-extrabold sm:text-5xl">Treine com questões oficiais do ENEM.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Cada simulado sorteia questões de edições diferentes (2016 a 2025), na mesma estrutura da prova. Tudo funciona no seu
            navegador: sem cadastro, sem custo e com o progresso salvo automaticamente.
          </p>
          {emAndamento.length > 0 && (
            <div className="mt-8 flex flex-col gap-3 rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-brand/40 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-ink">
                <strong className="font-display">Você tem {emAndamento.length === 1 ? 'um simulado' : `${emAndamento.length} simulados`} em andamento.</strong>{' '}
                <span className="text-ink-muted">
                  {emAndamento[0].dia}º dia · {Object.keys(emAndamento[0].respostas).length} de {emAndamento[0].questoes.length} respondidas ·{' '}
                  {formatarDuracao(emAndamento[0].tempoMs, false)} de prova
                </span>
              </p>
              <Link to={`/simulados/prova/${emAndamento[0].id}`} className="btn btn-primary btn-sm">
                <PlayCircle className="size-5" aria-hidden /> Retomar
              </Link>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="provas" className="bg-white py-14 md:py-20">
        <div className="container-site">
          <h2 id="provas" className="text-[1.75rem] leading-tight font-extrabold sm:text-[2.1rem]">
            Escolha a prova
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {dias.map(({ dia, titulo, itens, duracao, Icon }) => (
              <li key={dia}>
                <Link
                  to={`/simulados/dia-${dia}`}
                  className="card group flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-8"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold">{titulo}</h3>
                  <ul className="mt-3 flex-1 space-y-1.5 text-ink-muted">
                    {itens.map((i) => (
                      <li key={i} className="flex gap-2">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-energy" />
                        {i}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-ink-subtle">{duracao} · 90 questões objetivas</p>
                  <span className="link-arrow mt-5">
                    Preparar simulado <ArrowRight className="size-4" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/simulados/redacao" className="card group flex h-full items-start gap-5 p-6 transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-8">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-action text-white">
                  <PenLine className="size-6" aria-hidden />
                </span>
                <span>
                  <span className="block font-display text-xl font-extrabold text-ink">Laboratório de Redação</span>
                  <span className="mt-2 block text-ink-muted">100 temas para sortear, editor com contagem de linhas e análise orientativa do seu texto.</span>
                  <span className="link-arrow mt-4">
                    Escrever uma redação <ArrowRight className="size-4" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
            <li>
              <Link to="/simulados/desempenho" className="card group flex h-full items-start gap-5 p-6 transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-8">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-energy-soft text-brand-strong">
                  <BarChart3 className="size-6" aria-hidden />
                </span>
                <span>
                  <span className="block font-display text-xl font-extrabold text-ink">Meu Desempenho</span>
                  <span className="mt-2 block text-ink-muted">Acertos por área, evolução, redações e o backup do seu histórico.</span>
                  <span className="link-arrow mt-4">
                    Ver meu desempenho <ArrowRight className="size-4" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="banco" className="bg-paper py-14 md:py-20">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Banco de questões</p>
            <h2 id="banco" className="mt-3 text-[1.75rem] leading-tight font-extrabold sm:text-[2.1rem]">
              Questões reais, conferidas e com o gabarito oficial.
            </h2>
            <p className="mt-4 text-ink-muted">
              As questões vêm das provas e gabaritos publicados pelo Inep (aplicação regular). Cada uma aparece exatamente como no
              caderno original. Só entram no sorteio as que passaram nas verificações de integridade; questões anuladas ficam de fora.
            </p>
            <p className="mt-3 text-sm text-ink-subtle">
              Fonte: Inep/MEC — provas e gabaritos do ENEM, publicados no portal gov.br sob licença Creative Commons
              Atribuição-SemDerivações 3.0. As questões são reproduzidas sem alteração, com a indicação de edição e número. Textos e imagens
              de terceiros citados nas questões mantêm a autoria indicada em cada uma.
            </p>
            <p className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              Seu histórico fica salvo apenas neste dispositivo. Nenhuma resposta ou redação é enviada para a internet.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
            {erro ? (
              <p className="text-ink-muted">Não foi possível carregar o banco de questões. Verifique sua conexão e recarregue a página.</p>
            ) : !indice ? (
              <p className="text-ink-muted" role="status">
                Carregando o banco…
              </p>
            ) : (
              <>
                <p className="text-sm font-semibold text-ink-muted">Questões disponíveis para sorteio</p>
                <dl className="mt-4 grid grid-cols-2 gap-4">
                  {(['LC', 'CH', 'CN', 'MT'] as const).map((a) => (
                    <div key={a} className="rounded-2xl bg-paper p-4">
                      <dt className="text-sm text-ink-muted">{NOME_CURTO[a]}</dt>
                      <dd className="font-display text-2xl font-extrabold text-ink tabular-nums">{indice.areas[a]?.total ?? 0}</dd>
                      {a === 'LC' && (
                        <dd className="text-xs text-ink-subtle">
                          {indice.areas.LC.ingles} de inglês · {indice.areas.LC.espanhol} de espanhol
                        </dd>
                      )}
                    </div>
                  ))}
                </dl>
                <p className="mt-4 flex items-center gap-2 text-sm text-ink-subtle">
                  <NotebookPen className="size-4" aria-hidden /> Edições de {indice.anos[0]} a {indice.anos[indice.anos.length - 1]}
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
