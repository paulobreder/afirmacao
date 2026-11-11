import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import { Logo } from './Logo'
import { navItems } from './nav'


export function Header() {
  const location = useLocation()
  // O menu fica aberto apenas na página em que foi aberto: trocar de rota o fecha.
  const [openPath, setOpenPath] = useState<string | null>(null)
  const open = openPath === location.pathname
  const setOpen = (v: boolean | ((prev: boolean) => boolean)) =>
    setOpenPath((typeof v === 'function' ? v(open) : v) ? location.pathname : null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    requestAnimationFrame(onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenPath(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-200 ${
        scrolled || open ? 'border-line bg-white/95 shadow-[0_1px_0_rgb(42_37_35/0.02)] backdrop-blur' : 'border-transparent bg-paper'
      }`}
    >
      <div className="container-site flex h-[72px] items-center justify-between gap-4">
        <Link to="/" className="shrink-0 rounded-lg" aria-label="AfirmAção — página inicial">
          <Logo className="h-16 w-auto" decorativa />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-0.5 lg:gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `relative inline-flex min-h-11 items-center rounded-full px-2.5 text-[0.95rem] font-medium whitespace-nowrap transition-colors lg:px-3 xl:px-4 ${
                      isActive ? 'text-brand' : 'text-ink-muted hover:text-ink'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span aria-hidden className="absolute inset-x-2.5 -bottom-[3px] h-[3px] rounded-full bg-energy lg:inset-x-3 xl:inset-x-4" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/materiais?buscar=1" className="btn btn-primary btn-sm hidden xl:inline-flex">
            <Search className="size-4" aria-hidden />
            Buscar materiais
          </Link>
          <button
            type="button"
            className="inline-flex size-12 items-center justify-center rounded-full text-ink hover:bg-brand-soft md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      <nav
        id="menu-mobile"
        aria-label="Principal (celular)"
        hidden={!open}
        className="border-t border-line bg-white md:hidden"
      >
        <ul className="container-site flex flex-col gap-1 py-4">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-h-12 items-center rounded-xl px-4 text-base font-semibold ${
                    isActive ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-paper'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          <li className="pt-2">
            <Link to="/materiais?buscar=1" className="btn btn-primary w-full">
              <Search className="size-4" aria-hidden />
              Buscar materiais
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
