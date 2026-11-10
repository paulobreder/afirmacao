import { Link } from 'react-router-dom'
import { ArrowRight, BookOpenCheck, Compass, HeartHandshake, LibraryBig, Smartphone, UserRoundX } from 'lucide-react'
import { Seo } from '../components/Seo'
import { Logo } from '../components/Logo'
import { categorias, contarPorCategoria } from '../data/materiais'
import { categoriaVisual } from '../components/categoria-visual'

const principios = [
  {
    Icon: HeartHandshake,
    titulo: 'Gratuito de verdade',
    texto: 'Nada de planos, assinaturas ou venda de cursos. Todo o conteúdo é aberto para quem precisa estudar.',
  },
  {
    Icon: UserRoundX,
    titulo: 'Sem cadastro',
    texto: 'Você entra, encontra o material e começa a estudar. Não pedimos login, e-mail nem dados pessoais.',
  },
  {
    Icon: Smartphone,
    titulo: 'Pensado para o celular',
    texto: 'Os PDFs abrem direto no navegador, página por página, e também podem ser baixados para estudar offline.',
  },
  {
    Icon: Compass,
    titulo: 'Organizado e direto',
    texto: 'Materiais separados por categoria e disciplina, com busca, para você achar o que precisa em poucos cliques.',
  },
]

export default function Sobre() {
  return (
    <>
      <Seo
        title="Sobre o Projeto"
        description="A AfirmAção é uma iniciativa de educação popular que oferece gratuitamente materiais e orientações para estudantes que se preparam para o ENEM."
      />

      <section className="bg-waves relative overflow-x-clip border-b border-line bg-paper">
        <div className="container-site grid items-center gap-12 pt-10 pb-14 md:pt-14 md:pb-20 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow">Sobre o projeto</p>
            <h1 className="mt-3 text-[2.25rem] leading-[1.1] font-extrabold sm:text-5xl">
              Educação popular para abrir o caminho até a universidade.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
              A AfirmAção é uma iniciativa de educação popular voltada a apoiar estudantes na preparação para o Exame
              Nacional do Ensino Médio (ENEM). Esta plataforma foi criada para apoiar a formação de quem participa de um
              cursinho popular gratuito e quer conquistar uma vaga no ensino superior.
            </p>
          </div>
          <div className="relative mx-auto flex w-full max-w-sm items-center justify-center" aria-hidden>
            <div className="aspect-square w-[78%] rounded-full bg-white shadow-[var(--shadow-lift)] ring-1 ring-line" />
            <Logo className="absolute h-auto w-[56%]" decorativa />
            <span className="absolute top-[8%] right-[10%] size-10 rounded-full bg-brand-bright" />
            <span className="absolute bottom-[14%] left-[6%] size-5 rounded-full bg-action" />
            <span className="absolute bottom-[4%] right-[22%] size-3 rounded-full bg-energy" />
          </div>
        </div>
      </section>

      <section aria-labelledby="missao" className="bg-white py-16 md:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow">Nossa missão</p>
            <h2 id="missao" className="mt-3 text-[2rem] leading-tight font-extrabold sm:text-[2.6rem]">
              Facilitar o acesso ao conhecimento.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-ink-muted">
            <p>
              Nossa missão é oferecer uma base de estudos organizada e acessível, para que a falta de recursos não seja um
              obstáculo na preparação para o ENEM.
            </p>
            <p>
              Por isso, a plataforma disponibiliza gratuitamente materiais de revisão, exercícios com resoluções, resumos e
              orientações sobre como ingressar e permanecer no ensino superior.
            </p>
            <p className="font-display text-xl font-bold text-ink">
              Conhecimento que vira <span className="text-action">ação</span>.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="oferece" className="bg-paper py-16 md:py-24">
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="eyebrow">O que você encontra aqui</p>
            <h2 id="oferece" className="mt-3 text-[2rem] leading-tight font-extrabold sm:text-[2.6rem]">
              Tudo em um só lugar.
            </h2>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categorias.map((c) => {
              const { Icon, iconBg } = categoriaVisual[c.id]
              return (
                <li key={c.id}>
                  <Link to={`/materiais?categoria=${c.id}`} className="card group flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
                    <span className={`flex size-12 items-center justify-center rounded-2xl ${iconBg}`}>
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-extrabold">{c.nome}</h3>
                    <p className="mt-2 flex-1 leading-relaxed text-ink-muted">{c.descricao}</p>
                    <span className="link-arrow mt-5">
                      {contarPorCategoria(c.id)} materiais <ArrowRight className="size-4" aria-hidden />
                    </span>
                  </Link>
                </li>
              )
            })}
            <li>
              <Link to="/guia" className="card group flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-action text-white">
                  <BookOpenCheck className="size-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-extrabold">Guia do Estudante</h3>
                <p className="mt-2 flex-1 leading-relaxed text-ink-muted">
                  Sisu, ProUni, Fies, permanência estudantil e os documentos de cada etapa.
                </p>
                <span className="link-arrow mt-5">
                  Abrir o guia <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="principios" className="bg-white py-16 md:py-24">
        <div className="container-site">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Como pensamos a plataforma</p>
            <h2 id="principios" className="mt-3 text-[2rem] leading-tight font-extrabold sm:text-[2.6rem]">
              Simples, acolhedora e acessível.
            </h2>
          </div>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principios.map(({ Icon, titulo, texto }) => (
              <li key={titulo} className="rounded-[var(--radius-card)] bg-paper p-6">
                <span className="flex size-12 items-center justify-center rounded-full bg-white text-brand ring-1 ring-line">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-extrabold">{titulo}</h3>
                <p className="mt-2 leading-relaxed text-ink-muted">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-paper py-16 md:py-24">
        <div className="container-site">
          <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-white px-6 py-12 ring-1 ring-line sm:px-12 sm:py-16">
            <span aria-hidden className="absolute -right-20 -bottom-24 size-72 rounded-full border-[32px] border-brand-tint" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <Logo className="h-16 w-auto" />
                  <p className="font-display text-[0.95rem] font-semibold text-ink-muted">Conhecimento que vira ação.</p>
                </div>
                <p className="mt-6 max-w-lg text-lg text-ink-muted">Seu caminho gratuito para o ENEM começa por um material. Escolha o seu.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/materiais" className="btn btn-primary">
                  <LibraryBig className="size-5" aria-hidden /> Explorar materiais
                </Link>
                <Link to="/guia" className="btn btn-secondary">
                  Guia do Estudante
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
