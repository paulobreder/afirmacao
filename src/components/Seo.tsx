import { useEffect } from 'react'

const setMeta = (selector: string, content: string) =>
  document.head.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)

/** Atualiza título e descrição de cada página, reaproveitando as tags do index.html. */
export function Seo({ title, description }: { title?: string; description: string }) {
  useEffect(() => {
    const full = title ? `${title} · AfirmAção` : 'AfirmAção — Seu caminho gratuito para o ENEM'
    document.title = full
    setMeta('meta[name="description"]', description)
    setMeta('meta[property="og:title"]', full)
    setMeta('meta[property="og:description"]', description)
  }, [title, description])
  return null
}
