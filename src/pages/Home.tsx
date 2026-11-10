import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, CircleCheck, ClipboardCheck, Compass, FileCheck2, Smartphone, UserRoundX } from 'lucide-react'
import { Seo } from '../components/Seo'
import { Logo } from '../components/Logo'
import { MaterialCard } from '../components/MaterialCard'
import { categoriaVisual } from '../components/categoria-visual'
import { arquivoPublico, categorias, contarPorCategoria, getMaterial, materiais, type CategoriaId } from '../data/materiais'
import { documentosMatricula } from '../data/guia'

const RaioXIcon = categoriaVisual['raio-x'].Icon
const RevisaoIcon = categoriaVisual.revisao.Icon

const totalQuestoesRaioX = materiais.filter((m) => m.categoria === 'raio-x').length * 50

const contagem: Record<CategoriaId, string> = {
  revisao: `${contarPorCategoria('revisao')} apostilas`,
  'raio-x': `${contarPorCategoria('raio-x')} cadernos de questões`,
  resumos: `${contarPorCategoria('resumos')} materiais`,
}

const sugestoes = ['conteudos-mais-cobrados-enem', 'raio-x-matematica', 'revisao-portugues']
  .map((slug) => getMaterial(slug))
  .filter((m) => m !== undefined)

export default function Home() {
  return (
    <>
      <Seo description="Materiais gratuitos de revisão, Raio-X com questões resolvidas, resumos e orientações para ingressar no ensino superior. Seu caminho gratuito para o ENEM." />
      <Hero />
      <Categorias />
      <AcessoSimulados />
      <GuiaDestaque />
      <Sugestoes />
      <Institucional />
    </>
  )
}

function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className="bg-waves relative overflow-x-clip bg-paper">
      {/* formas geométricas discretas */}
      <span aria-hidden className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-brand-soft/70 blur-0" />

      <div className="container-site relative grid gap-10 pt-8 md:pt-12 lg:grid-cols-[1.08fr_1fr] lg:items-end lg:gap-6 lg:pt-6">
        <div className="max-w-xl self-center lg:pb-16">
          <p className="animate-rise inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[0.75rem] font-semibold tracking-[0.12em] text-brand uppercase ring-1 ring-line sm:text-[0.8rem]">
            <span aria-hidden className="size-2 rounded-full bg-energy" />
            Educação gratuita e acessível
          </p>
          <h1
            id="hero-titulo"
            className="animate-rise delay-1 mt-6 text-[2.6rem] leading-[1.06] font-extrabold tracking-[-0.035em] sm:text-[3.4rem] lg:text-[4.1rem]"
          >
            Seu caminho gratuito para o{' '}
            <span className="relative inline-block whitespace-nowrap text-action">
              ENEM
              <svg
                aria-hidden
                viewBox="0 0 200 16"
                preserveAspectRatio="none"
                className="absolute -bottom-1.5 left-0 h-[0.22em] w-full sm:-bottom-2"
              >
                <path d="M3 11c50-7 120-9 194-4" stroke="#F1B521" strokeWidth="7" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            .
          </h1>
          <p className="animate-rise delay-2 mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-muted sm:text-[1.15rem]">
            Encontre materiais de revisão, exercícios resolvidos e conteúdos essenciais para estudar no seu ritmo e se
            preparar para o futuro.
          </p>
          <div className="animate-rise delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link to="/materiais" className="btn btn-primary min-h-14 px-7 text-base">
              Explorar materiais
              <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link
              to="/sobre"
              className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-2 font-semibold text-ink hover:text-brand sm:justify-start"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-white text-brand shadow-[var(--shadow-soft)] ring-1 ring-line transition-transform duration-300 group-hover:scale-105">
                <Compass className="size-5" aria-hidden />
              </span>
              Conheça o projeto
            </Link>
          </div>
          <ul className="animate-rise delay-3 mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[0.925rem] font-medium text-ink-muted">
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-5 text-brand" aria-hidden /> 100% gratuito
            </li>
            <li className="flex items-center gap-2">
              <UserRoundX className="size-5 text-brand" aria-hidden /> Sem cadastro
            </li>
            <li className="flex items-center gap-2">
              <Smartphone className="size-5 text-brand" aria-hidden /> Feito para o celular
            </li>
          </ul>
          {/* No celular os destaques ficam aqui, para não cobrir a estudante nem o caderno com a marca. */}
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:hidden">
            <li>
              <Link to="/materiais?categoria=raio-x" className="flex h-full flex-col gap-2 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-line">
                <span className="flex size-9 items-center justify-center rounded-xl bg-action-soft text-action-strong">
                  <RaioXIcon className="size-[18px]" aria-hidden />
                </span>
                <span className="font-display text-[0.95rem] leading-tight font-extrabold text-ink">{totalQuestoesRaioX} questões resolvidas</span>
              </Link>
            </li>
            <li>
              <Link to="/materiais?categoria=revisao" className="flex h-full flex-col gap-2 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-line">
                <span className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <RevisaoIcon className="size-[18px]" aria-hidden />
                </span>
                <span className="font-display text-[0.95rem] leading-tight font-extrabold text-ink">
                  {contarPorCategoria('revisao')} apostilas de revisão
                </span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[400px] sm:max-w-[440px] lg:mr-0 lg:max-w-[490px]">
          <picture>
            <source media="(max-width: 767px)" srcSet={arquivoPublico('img/estudante-afirmacao-640.webp')} type="image/webp" />
            <img
              src={arquivoPublico('img/estudante-afirmacao.webp')}
              alt="Estudante sorridente de óculos e cabelo cacheado, com mochila azul e cadernos, segurando um caderno amarelo com o logotipo da AfirmAção."
              width={1122}
              height={1402}
              fetchPriority="high"
              decoding="async"
              className="relative block h-auto w-full select-none"
            />
          </picture>

          <Link
            to="/materiais?categoria=raio-x"
            className="animate-floaty absolute top-[34%] hidden sm:flex -right-1 max-w-[11.5rem] items-center gap-3 rounded-2xl bg-white/95 p-3 pr-4 shadow-[var(--shadow-lift)] ring-1 ring-line transition-colors hover:ring-brand sm:-right-4 sm:max-w-none lg:-right-6"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-action-soft text-action-strong">
              <RaioXIcon className="size-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-medium text-ink-subtle">Raio-X ENEM</span>
              <span className="block font-display text-[0.95rem] font-extrabold text-ink sm:text-base">
                {totalQuestoesRaioX} questões resolvidas
              </span>
            </span>
          </Link>

          <Link
            to="/materiais?categoria=revisao"
            className="absolute bottom-[7%] -left-1 hidden w-[12.5rem] sm:block rounded-2xl bg-white/95 p-3.5 shadow-[var(--shadow-lift)] ring-1 ring-line transition-colors hover:ring-brand sm:-left-6 sm:w-[13.5rem] lg:-left-10"
          >
            <span className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <RevisaoIcon className="size-[18px]" aria-hidden />
              </span>
              <span className="font-display text-[0.95rem] font-extrabold text-ink">
                {contarPorCategoria('revisao')} apostilas de revisão
              </span>
            </span>
            <span aria-hidden className="mt-3 flex flex-col gap-2">
              {[
                ['bg-brand-bright', 'w-[78%]'],
                ['bg-action', 'w-[62%]'],
                ['bg-energy', 'w-[70%]'],
              ].map(([dot, w]) => (
                <span key={dot} className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${dot}`} />
                  <span className={`h-1.5 rounded-full bg-line ${w}`} />
                </span>
              ))}
            </span>
          </Link>
        </div>

      </div>
    </section>
  )
}

function Categorias() {
  return (
    <section aria-labelledby="categorias-titulo" className="bg-white py-20 md:py-28">
      <div className="container-site">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Biblioteca de materiais</p>
          <h2 id="categorias-titulo" className="mt-3 text-[2rem] leading-tight font-extrabold sm:text-[2.6rem]">
            O que você quer estudar hoje?
          </h2>
          <p className="mt-4 text-lg text-ink-muted">
            Escolha um caminho. Todos os materiais abrem direto no navegador e podem ser baixados.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-3 md:gap-0">
          {categorias.map((c, i) => {
            const featured = i === 1
            const { Icon } = categoriaVisual[c.id]
            return (
              <li key={c.id} className={featured ? 'md:z-10 md:-my-4' : ''}>
                <Link
                  to={`/materiais?categoria=${c.id}`}
                  className={`group flex h-full flex-col items-center rounded-[var(--radius-card)] px-7 py-10 text-center transition-[transform,box-shadow,background-color] duration-300 ease-[var(--ease-out)] md:py-12 ${
                    featured
                      ? 'bg-action text-white shadow-[0_24px_48px_-20px_rgb(219_56_49/0.5)] md:py-16'
                      : 'bg-paper text-ink hover:-translate-y-1 hover:bg-white hover:shadow-[var(--shadow-lift)] md:rounded-none md:first:rounded-l-[var(--radius-card)] md:last:rounded-r-[var(--radius-card)]'
                  } ${i === 0 ? 'md:rounded-l-[var(--radius-card)]' : ''} ${i === 2 ? 'md:rounded-r-[var(--radius-card)]' : ''}`}
                >
                  <span
                    className={`flex size-16 items-center justify-center rounded-full ${
                      featured ? 'bg-white text-brand' : 'bg-white text-brand ring-1 ring-line'
                    }`}
                  >
                    <Icon className="size-7" aria-hidden />
                  </span>
                  <h3 className={`mt-6 text-[1.35rem] font-bold ${featured ? 'text-white' : ''}`}>{c.nome}</h3>
                  <p className={`mt-3 max-w-[18rem] leading-relaxed ${featured ? 'text-white' : 'text-ink-muted'}`}>
                    {c.descricao}
                  </p>
                  <p
                    className={`mt-5 rounded-full px-3 py-1 text-sm font-semibold ${
                      featured ? 'bg-white/15 text-white' : 'bg-white text-ink-muted ring-1 ring-line'
                    }`}
                  >
                    {contagem[c.id]}
                  </p>
                  <span className={`link-arrow mt-6 ${featured ? 'text-white' : ''}`}>
                    Ver materiais <ArrowRight className="size-4" aria-hidden />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/** Acesso discreto ao módulo de simulados (faixa compacta, sem alterar as seções aprovadas). */
function AcessoSimulados() {
  return (
    <section aria-label="Simulados" className="bg-white pb-16 md:pb-20">
      <div className="container-site">
        <Link
          to="/simulados"
          className="group flex flex-col gap-4 rounded-[var(--radius-card)] bg-paper p-5 ring-1 ring-line transition-shadow hover:shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:gap-5 sm:p-6"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand ring-1 ring-line">
            <ClipboardCheck className="size-6" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block font-display text-lg font-extrabold text-ink">Novo: simulados com questões oficiais do ENEM</span>
            <span className="text-ink-muted">Primeiro e segundo dia, laboratório de redação e acompanhamento do seu desempenho.</span>
          </span>
          <span className="link-arrow">
            Fazer um simulado <ArrowRight className="size-4" aria-hidden />
          </span>
        </Link>
      </div>
    </section>
  )
}

function GuiaDestaque() {
  const topicos = [
    'Sisu: requisitos e documentos para a matrícula',
    'Documentos adicionais para quem ingressa por cotas',
    'ProUni e Fies: critérios e documentação',
    'Programas de permanência estudantil',
  ]
  return (
    <section aria-labelledby="guia-titulo" className="overflow-x-clip bg-paper py-20 md:py-28">
      <div className="container-site grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Composição visual: checklist real do Guia sobre o arco amarelo da marca */}
        <div className="relative mx-auto w-full max-w-[460px] pt-28 pb-2 sm:pt-36" aria-hidden>
          <div className="absolute inset-x-[7%] top-0 bottom-[14%] rounded-t-full bg-energy" />
          <span className="absolute top-[2%] right-[10%] size-10 rounded-full bg-brand-bright sm:size-12" />
          <span className="absolute top-[22%] left-[2%] size-4 rounded-full bg-action" />
          <svg viewBox="0 0 120 120" className="absolute top-[2%] left-[4%] w-24 text-ink/30" fill="none">
            <path d="M4 116C10 56 56 8 116 4" stroke="currentColor" strokeWidth="2.5" strokeDasharray="7 8" strokeLinecap="round" />
          </svg>
          <div className="relative mx-auto w-[88%] rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-lift)] ring-1 ring-line sm:p-6">
            <p className="flex items-center gap-2 font-display text-[1.05rem] font-extrabold text-ink">
              <FileCheck2 className="size-5 text-brand" />
              Checklist de matrícula
            </p>
            <ul className="mt-4 space-y-2.5">
              {documentosMatricula.slice(0, 5).map((d) => (
                <li key={d.item} className="flex items-start gap-2.5 text-[0.9rem] leading-snug text-ink-muted">
                  <CircleCheck className="mt-0.5 size-[18px] shrink-0 text-brand" />
                  {d.item}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-line pt-3 text-sm font-semibold text-brand">
              + {documentosMatricula.length - 5} documentos no guia completo
            </p>
          </div>
          <span className="absolute top-[13%] -right-1 rounded-full bg-white px-4 py-2 font-display text-sm font-extrabold text-ink shadow-[var(--shadow-soft)] ring-1 ring-line sm:-right-3">
            Sisu · ProUni · Fies
          </span>
        </div>

        <div className="max-w-xl">
          <p className="eyebrow">Guia do Estudante</p>
          <h2 id="guia-titulo" className="mt-3 text-[2rem] leading-tight font-extrabold sm:text-[2.6rem]">
            Além do ENEM, prepare-se para o próximo passo.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-muted">
            Encontre informações sobre oportunidades de ingresso, programas educacionais e documentos importantes para sua
            jornada.
          </p>
          <ul className="mt-8 space-y-3.5">
            {topicos.map((t) => (
              <li key={t} className="flex items-start gap-3 text-[1.025rem] font-medium text-ink">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-brand text-white">
                  <CircleCheck className="size-4" aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Link to="/guia" className="btn btn-primary mt-10">
            Acessar Guia do Estudante
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}

function Sugestoes() {
  return (
    <section aria-labelledby="sugestoes-titulo" className="bg-white py-20 md:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Por onde começar</p>
            <h2 id="sugestoes-titulo" className="mt-3 text-[2rem] leading-tight font-extrabold sm:text-[2.6rem]">
              Descubra o que mais cai, pratique e revise.
            </h2>
            <p className="mt-4 text-lg text-ink-muted">
              Uma sugestão de sequência: veja os assuntos mais cobrados, resolva questões e volte à teoria quando precisar.
            </p>
          </div>
          <Link to="/materiais" className="link-arrow shrink-0 py-2">
            Ver todos os {materiais.length} materiais <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sugestoes.map((m, i) => (
            <li key={m.slug} className="flex flex-col">
              <p className="mb-3 flex items-center gap-2 font-display text-sm font-extrabold text-ink-subtle">
                <span className="flex size-7 items-center justify-center rounded-full bg-action text-[0.8rem] text-white">
                  {i + 1}
                </span>
                {['Veja o que mais cai', 'Pratique com questões', 'Revise a teoria'][i]}
              </p>
              <MaterialCard material={m} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Institucional() {
  return (
    <section aria-labelledby="institucional-titulo" className="bg-paper py-20 md:py-28">
      <div className="container-site grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div className="max-w-xl">
          <p className="eyebrow">Sobre a AfirmAção</p>
          <h2 id="institucional-titulo" className="mt-3 text-[2.2rem] leading-tight font-extrabold sm:text-[2.8rem]">
            Conhecimento que vira <span className="text-action">ação</span>.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-muted">
            A AfirmAção é uma iniciativa de educação popular que apoia estudantes de cursinho popular na preparação para o
            ENEM. Reunimos materiais de estudo e orientações em um só lugar, de graça e sem cadastro, para que mais pessoas
            cheguem ao ensino superior.
          </p>
          <Link to="/sobre" className="btn btn-secondary mt-8">
            Conheça o projeto
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-white px-8 py-14 ring-1 ring-line sm:px-12 sm:py-16" aria-hidden>
          <span className="absolute -top-16 -right-16 size-56 rounded-full border-[28px] border-brand-tint" />
          <span className="absolute right-10 bottom-10 size-5 rounded-full bg-energy" />
          <span className="absolute top-10 right-24 size-3 rounded-full bg-action" />
          <div className="relative flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <Logo className="h-28 w-auto sm:h-32" decorativa />
            <p className="font-display text-lg font-semibold text-ink-muted">Conhecimento que vira ação.</p>
          </div>
          <div className="relative mt-10 grid grid-cols-3 gap-3 border-t border-line pt-8 text-ink-muted">
            {['Revisar', 'Praticar', 'Ingressar'].map((t, i) => (
              <p key={t} className="flex items-center gap-2 font-display text-[0.95rem] font-bold">
                <span className={`size-2.5 rounded-full ${['bg-brand-bright', 'bg-action', 'bg-energy'][i]}`} />
                {t}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
