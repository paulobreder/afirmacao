import { useId } from 'react'

/** Símbolo oficial: A geométrico com haste azul, haste vermelha, ponta de lápis e travessão amarelos. */
export function LogoSymbol({ className = 'h-9 w-auto', title }: { className?: string; title?: string }) {
  const id = useId()
  return (
    <svg
      viewBox="36 30 540 580"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <clipPath id={`${id}l`}>
          <rect x="0" y="170" width="306" height="500" />
        </clipPath>
        <clipPath id={`${id}r`}>
          <rect x="306" y="170" width="400" height="500" />
        </clipPath>
      </defs>
      <path d="M306 35 375 162H237Z" fill="#F2B544" />
      <path d="M97 548 374 16" stroke="#2B50CC" strokeWidth="110" strokeLinecap="round" clipPath={`url(#${id}l)`} />
      <path d="M515 548 238 16" stroke="#D94D45" strokeWidth="110" strokeLinecap="round" clipPath={`url(#${id}r)`} />
      <rect x="176" y="432" width="260" height="68" rx="34" fill="#F2B544" />
    </svg>
  )
}

/** Logotipo completo. `tone="dark"` para aplicação sobre fundo azul-marinho. */
export function Logo({
  tone = 'light',
  size = 'md',
  slogan = false,
}: {
  tone?: 'light' | 'dark'
  size?: 'md' | 'lg'
  slogan?: boolean
}) {
  const symbol = size === 'lg' ? 'h-14 w-auto' : 'h-9 w-auto'
  const word = size === 'lg' ? 'text-[2.4rem]' : 'text-[1.55rem]'
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoSymbol className={symbol} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-extrabold tracking-[-0.035em] ${word}`}>
          <span className={tone === 'dark' ? 'text-white' : 'text-navy'}>Afirm</span>
          <span className="text-action">Ação</span>
        </span>
        {slogan && (
          <span className={`mt-1.5 font-display text-[0.95rem] font-semibold ${tone === 'dark' ? 'text-white/85' : 'text-ink-muted'}`}>
            Conhecimento que vira ação.
          </span>
        )}
      </span>
    </span>
  )
}
