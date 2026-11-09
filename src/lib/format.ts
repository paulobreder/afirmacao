export function formatarTamanho(bytes: number) {
  const mb = bytes / 1_000_000
  if (mb < 1) return `${Math.round(bytes / 1000)} KB`
  return `${mb.toLocaleString('pt-BR', { maximumFractionDigits: mb < 10 ? 1 : 0 })} MB`
}

/** Remove acentos e caixa para buscas tolerantes ("matematica" encontra "Matemática"). */
export function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function slugify(texto: string) {
  return normalizar(texto).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
