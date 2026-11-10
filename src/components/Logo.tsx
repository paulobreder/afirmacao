import { arquivoPublico } from '../data/materiais'

/**
 * Logo institucional original da AfirmAção (punho vermelho com lápis amarelo e lettering próprio).
 * É a arte fornecida pela coordenação, apenas com o fundo removido: nunca redesenhar nem
 * recriar com fontes do site. Arquivo: public/img/marca/logo-afirmacao.webp (552 × 318).
 */
export function Logo({ className = 'h-14 w-auto', decorativa = false }: { className?: string; decorativa?: boolean }) {
  return (
    <img
      src={arquivoPublico('img/marca/logo-afirmacao.webp')}
      alt={decorativa ? '' : 'AfirmAção — Rede de Cursinhos Populares'}
      width={552}
      height={318}
      decoding="async"
      className={`block select-none ${className}`}
      draggable={false}
    />
  )
}
