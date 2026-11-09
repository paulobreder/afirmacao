import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Download,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  HandCoins,
  Landmark,
  Plus,
  Users,
} from 'lucide-react'
import { Seo } from '../components/Seo'
import {
  bolsasFinanciamento,
  documentosCotas,
  documentosMatricula,
  GUIA_PDF,
  GUIA_REVISADO_EM,
  permanencia,
  sisu,
  type LinkOficial,
  type Programa,
} from '../data/guia'

const secoes = [
  { id: 'sisu', label: 'Sisu' },
  { id: 'documentos', label: 'Documentos de matrícula' },
  { id: 'cotas', label: 'Cotas' },
  { id: 'bolsas', label: 'ProUni e Fies' },
  { id: 'permanencia', label: 'Permanência' },
]

function LinkExterno({ link }: { link: LinkOficial }) {
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-arrow min-h-11 break-words">
      {link.rotulo}
      <ExternalLink className="size-4 shrink-0" aria-hidden />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  )
}

function CabecalhoSecao({ numero, eyebrow, titulo, id, children }: { numero: string; eyebrow: string; titulo: string; id: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">
        <span className="flex size-7 items-center justify-center rounded-full bg-navy text-[0.75rem] tracking-normal text-white">{numero}</span>
        {eyebrow}
      </p>
      <h2 id={id} className="mt-3 scroll-mt-40 text-[1.85rem] leading-tight font-extrabold sm:text-[2.3rem]">
        {titulo}
      </h2>
      {children && <div className="mt-4 text-lg leading-relaxed text-ink-muted">{children}</div>}
    </div>
  )
}

function ListaCriterios({ itens }: { itens: string[] }) {
  return (
    <ul className="space-y-3">
      {itens.map((c) => (
        <li key={c} className="flex items-start gap-3 leading-relaxed text-ink">
          <CircleCheck className="mt-1 size-5 shrink-0 text-brand" aria-hidden />
          {c}
        </li>
      ))}
    </ul>
  )
}

function BlocoDocumentos({ texto }: { texto: string }) {
  return (
    <div className="rounded-2xl bg-brand-tint p-5 ring-1 ring-brand-soft">
      <p className="flex items-center gap-2 font-display font-extrabold text-navy">
        <FileCheck2 className="size-5 text-brand" aria-hidden /> Documentos
      </p>
      <p className="mt-2 leading-relaxed text-ink-muted">{texto}</p>
    </div>
  )
}

export default function Guia() {
  return (
    <>
      <Seo
        title="Guia do Estudante"
        description="Sisu, ProUni, Fies e programas de permanência: critérios e documentos necessários para cada etapa do ingresso no ensino superior."
      />

      <section className="bg-waves border-b border-line bg-ice">
        <div className="container-site grid gap-10 pt-10 pb-12 md:pt-14 md:pb-16 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">Guia do Estudante</p>
            <h1 className="mt-3 text-[2.25rem] leading-[1.1] font-extrabold sm:text-5xl">
              Do ENEM à matrícula: o que você precisa em cada etapa.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
              Reunimos os critérios dos principais programas de acesso e permanência no ensino superior e, principalmente,
              os <strong className="font-semibold text-navy">documentos necessários</strong> para cada um.
            </p>
          </div>
          <aside className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line sm:p-6" aria-label="Aviso importante">
            <p className="flex items-center gap-2 font-display font-extrabold text-navy">
              <CircleAlert className="size-5 text-action" aria-hidden /> Confira sempre o edital
            </p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">
              Regras, valores e prazos mudam a cada edição. Use este guia como ponto de partida e confirme as informações nos
              portais oficiais e no edital vigente. Conteúdo revisado em {GUIA_REVISADO_EM}.
            </p>
            <a href={GUIA_PDF} download="AfirmAcao - Guia do Estudante.pdf" className="btn btn-secondary btn-sm mt-4">
              <Download className="size-4" aria-hidden /> Baixar o guia em PDF
            </a>
          </aside>
        </div>
      </section>

      <nav aria-label="Seções do guia" className="sticky top-[72px] z-30 border-b border-line bg-white/95 backdrop-blur">
        <ul className="container-site flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          {secoes.map((s) => (
            <li key={s.id} className="shrink-0">
              <a href={`#${s.id}`} className="chip">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 1. Sisu */}
      <section aria-labelledby="sisu" className="bg-white py-16 md:py-20">
        <div className="container-site">
          <CabecalhoSecao numero="1" eyebrow="Universidade pública" titulo="Sisu: como ingressar em uma universidade pública" id="sisu">
            <p>{sisu.comoFunciona}</p>
          </CabecalhoSecao>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="card p-6 sm:p-8">
              <h3 className="flex items-center gap-2.5 text-xl font-extrabold">
                <GraduationCap className="size-6 text-brand" aria-hidden /> Quem pode participar
              </h3>
              <div className="mt-5">
                <ListaCriterios itens={sisu.requisitos} />
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-energy-soft p-6 sm:p-8">
              <p className="font-display text-lg font-extrabold text-navy">Atualização</p>
              <p className="leading-relaxed text-ink">{sisu.observacao}</p>
              <div className="mt-auto">
                <LinkExterno link={sisu.link} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentos de matrícula — prioridade do guia */}
      <section aria-labelledby="documentos" className="bg-ice py-16 md:py-20">
        <div className="container-site">
          <CabecalhoSecao numero="2" eyebrow="Mais importante" titulo="Documentos necessários para a matrícula" id="documentos">
            <p>
              Foi aprovado no Sisu? Separe com antecedência os documentos abaixo. Cada instituição publica a lista final no
              próprio edital de matrícula.
            </p>
          </CabecalhoSecao>
          <div className="card mt-10 overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line bg-navy px-6 py-4 text-white sm:px-8">
              <ClipboardList className="size-6 text-energy" aria-hidden />
              <h3 className="text-lg font-extrabold text-white">Checklist de documentos</h3>
              <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-sm font-semibold whitespace-nowrap">{documentosMatricula.length} itens</span>
            </div>
            <ol className="grid sm:grid-cols-2">
              {documentosMatricula.map((d, i) => (
                <li key={d.item} className="flex items-start gap-4 border-b border-line px-6 py-5 sm:px-8 sm:odd:border-r">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft font-display text-sm font-extrabold text-brand tabular-nums">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-navy">{d.item}</span>
                    {d.detalhe && <span className="mt-0.5 block text-[0.925rem] text-ink-muted">{d.detalhe}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Cotas */}
      <section aria-labelledby="cotas" className="bg-white py-16 md:py-20">
        <div className="container-site">
          <CabecalhoSecao numero="3" eyebrow="Reserva de vagas" titulo="Documentos adicionais para quem ingressa por cotas" id="cotas">
            <p>Além do checklist de matrícula, cada modalidade de cota pede comprovações específicas.</p>
          </CabecalhoSecao>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {documentosCotas.map((c) => (
              <li key={c.modalidade} className="card flex flex-col p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Users className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{c.modalidade}</h3>
                <p className="mt-2 leading-relaxed text-ink-muted">{c.documentos}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bolsas e financiamento */}
      <section aria-labelledby="bolsas" className="bg-ice py-16 md:py-20">
        <div className="container-site">
          <CabecalhoSecao numero="4" eyebrow="Instituições privadas" titulo="Programas de bolsas e financiamento" id="bolsas" />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {bolsasFinanciamento.map((p) => (
              <CartaoPrograma key={p.id} programa={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Permanência */}
      <section aria-labelledby="permanencia" className="bg-white py-16 md:py-20">
        <div className="container-site">
          <CabecalhoSecao numero="5" eyebrow="Depois do ingresso" titulo="Programas de permanência estudantil" id="permanencia">
            <p>
              Entrar na universidade é apenas o primeiro passo. Muitos estudantes precisam de auxílio para custear
              alimentação, transporte, moradia e materiais acadêmicos.
            </p>
          </CabecalhoSecao>
          <div className="mt-10 space-y-4">
            {permanencia.map((p, i) => (
              <details key={p.id} className="group card overflow-hidden" open={i === 0}>
                <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-5 py-4 sm:px-7 [&::-webkit-details-marker]:hidden">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-energy-soft text-[#8a5d00]">
                    <HandCoins className="size-5" aria-hidden />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-lg font-extrabold text-navy">{p.sigla}</span>
                    <span className="block text-[0.925rem] text-ink-muted">{p.nome}</span>
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-full bg-ice text-navy transition-transform duration-300 group-open:rotate-45">
                    <Plus className="size-5" aria-hidden />
                  </span>
                </summary>
                <div className="grid gap-6 border-t border-line px-5 py-6 sm:px-7 lg:grid-cols-2">
                  <div className="space-y-5">
                    <p className="leading-relaxed text-ink">{p.resumo}</p>
                    {p.valor && (
                      <div className="rounded-2xl bg-energy-soft p-5">
                        <p className="font-display font-extrabold text-navy">Valor</p>
                        <p className="mt-1 leading-relaxed text-ink">{p.valor}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="mb-3 text-base font-extrabold">Quem pode participar?</h3>
                      <ListaCriterios itens={p.criterios} />
                    </div>
                  </div>
                  <div className="space-y-5">
                    <BlocoDocumentos texto={p.documentos} />
                    {p.comoSolicitar && (
                      <div>
                        <h3 className="text-base font-extrabold">Como solicitar?</h3>
                        <p className="mt-2 leading-relaxed text-ink-muted">{p.comoSolicitar}</p>
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      {p.links.map((l) => (
                        <LinkExterno key={l.url} link={l} />
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ice py-16 md:py-20">
        <div className="container-site">
          <div className="flex flex-col items-start gap-6 rounded-[var(--radius-panel)] bg-brand p-8 text-white sm:p-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 font-display text-sm font-bold tracking-[0.12em] text-white/80 uppercase">
                <Landmark className="size-4" aria-hidden /> Próximo passo
              </p>
              <h2 className="mt-3 text-[1.8rem] leading-tight font-extrabold text-white sm:text-4xl">
                Uma boa nota no ENEM abre todas essas portas.
              </h2>
              <p className="mt-3 text-lg text-white/85">Continue estudando com os materiais gratuitos da biblioteca.</p>
            </div>
            <Link to="/materiais" className="btn shrink-0 bg-white text-brand hover:bg-brand-soft">
              Explorar materiais <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function CartaoPrograma({ programa: p }: { programa: Programa }) {
  return (
    <article className="card flex flex-col p-6 sm:p-8" aria-labelledby={`prog-${p.id}`}>
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
          <GraduationCap className="size-6" aria-hidden />
        </span>
        <div>
          <h3 id={`prog-${p.id}`} className="text-2xl font-extrabold">
            {p.sigla}
          </h3>
          <p className="text-ink-muted">{p.nome}</p>
        </div>
      </div>
      <p className="mt-5 leading-relaxed text-ink">{p.resumo}</p>
      <h4 className="mt-6 mb-3 text-base font-extrabold">Critérios principais</h4>
      <ListaCriterios itens={p.criterios} />
      <div className="mt-6">
        <BlocoDocumentos texto={p.documentos} />
      </div>
      {p.observacao && (
        <div className="mt-4 rounded-2xl bg-energy-soft p-5">
          <p className="font-display font-extrabold text-navy">{p.observacao.titulo}</p>
          <p className="mt-1 leading-relaxed text-ink">{p.observacao.texto}</p>
        </div>
      )}
      <div className="mt-auto pt-5">
        {p.links.map((l) => (
          <LinkExterno key={l.url} link={l} />
        ))}
      </div>
    </article>
  )
}
