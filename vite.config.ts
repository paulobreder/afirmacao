import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

/**
 * O servidor local já responde a pedidos parciais (206), mas não anuncia isso.
 * Sem o cabeçalho, o pdf.js baixa o PDF inteiro antes de mostrar a primeira página.
 * Hospedagens estáticas (GitHub Pages, Netlify, Vercel, nginx) já enviam este cabeçalho.
 */
function acceptRanges(): Plugin {
  const middleware = (req: { url?: string }, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
    if (req.url?.includes('/materiais/')) res.setHeader('Accept-Ranges', 'bytes')
    next()
  }
  return {
    name: 'afirmacao-accept-ranges',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}

// PDFs realmente presentes em public/materiais. Ao publicar no GitHub Pages
// (PUBLICAR_GITHUB=1), arquivos acima do limite de 100 MB do GitHub ficam de fora
// e aparecem no site como indisponíveis.
const LIMITE_GITHUB = 100 * 1024 * 1024
const paraGithub = Boolean(process.env.PUBLICAR_GITHUB)
const pastaPdfs = resolve(import.meta.dirname, 'public/materiais')
const todosPdfs = readdirSync(pastaPdfs).filter((f) => f.endsWith('.pdf'))
const pdfsDisponiveis = todosPdfs.filter((f) => !paraGithub || statSync(resolve(pastaPdfs, f)).size < LIMITE_GITHUB)
const pdfsExcluidos = todosPdfs.filter((f) => !pdfsDisponiveis.includes(f))

// Rotas conhecidas recebem uma cópia do index.html, para que o GitHub Pages as sirva
// com status 200 (sem isso, links diretos funcionam mas chegam como "404" para buscadores).
const slugs = [...readFileSync(resolve(import.meta.dirname, 'src/data/materiais.ts'), 'utf8').matchAll(/(?:revisao|raioX)\('([a-z0-9-]+)'|slug: '([a-z0-9-]+)'/g)].map((m) => m[1] ?? m[2])
const rotasEstaticas = [
  'materiais', 'guia', 'sobre',
  'simulados', 'simulados/dia-1', 'simulados/dia-2', 'simulados/redacao', 'simulados/desempenho',
  ...slugs.map((s) => `materiais/${s}`),
]

/**
 * Ajustes do build: o GitHub Pages serve o 404.html para rotas desconhecidas
 * (ele precisa ser o próprio app), cada rota conhecida ganha seu index.html,
 * e os PDFs excluídos acima não são publicados.
 */
function ajustesPublicacao(): Plugin {
  let outDir = 'dist'
  return {
    name: 'afirmacao-publicacao',
    apply: 'build',
    configResolved: (config) => void (outDir = config.build.outDir),
    closeBundle: () => {
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
      for (const rota of rotasEstaticas) {
        mkdirSync(resolve(outDir, rota), { recursive: true })
        copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, rota, 'index.html'))
      }
      for (const f of pdfsExcluidos) rmSync(resolve(outDir, 'materiais', f), { force: true })
    },
  }
}

export default defineConfig({
  // No GitHub Pages o site fica em /afirmacao/; localmente, na raiz.
  base: process.env.BASE_PATH ?? '/',
  define: { __PDFS_DISPONIVEIS__: JSON.stringify(pdfsDisponiveis) },
  plugins: [react(), tailwindcss(), acceptRanges(), ajustesPublicacao()],
})
