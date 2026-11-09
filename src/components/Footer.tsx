import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { navItems } from './nav'
import { categorias } from '../data/materiais'

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
        <div className="max-w-sm">
          <Link to="/" aria-label="AfirmAção — página inicial" className="inline-block rounded-lg">
            <Logo tone="dark" slogan />
          </Link>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-white/75">
            Iniciativa de educação popular que reúne, de forma gratuita, materiais de estudo e orientações para
            estudantes que se preparam para o ENEM.
          </p>
        </div>
        <nav aria-label="Rodapé — páginas">
          <h2 className="font-display text-sm font-bold tracking-[0.1em] text-energy uppercase">Navegação</h2>
          <ul className="mt-4 space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="inline-flex min-h-10 items-center text-white/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Rodapé — materiais">
          <h2 className="font-display text-sm font-bold tracking-[0.1em] text-energy uppercase">Materiais</h2>
          <ul className="mt-4 space-y-1">
            {categorias.map((c) => (
              <li key={c.id}>
                <Link to={`/materiais?categoria=${c.id}`} className="inline-flex min-h-10 items-center text-white/80 hover:text-white">
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-6 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>AfirmAção · Seu caminho gratuito para o ENEM.</p>
          <p>Plataforma gratuita, sem cadastro e sem fins comerciais.</p>
        </div>
      </div>
    </footer>
  )
}
