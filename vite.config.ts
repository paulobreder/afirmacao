import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

/**
 * O servidor local já responde a pedidos parciais (206), mas não anuncia isso.
 * Sem o cabeçalho, o pdf.js baixa o PDF inteiro antes de mostrar a primeira página.
 * Hospedagens estáticas (Netlify, Vercel, nginx) já enviam este cabeçalho.
 */
function acceptRanges(): Plugin {
  const middleware = (req: { url?: string }, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
    if (req.url?.startsWith('/materiais/')) res.setHeader('Accept-Ranges', 'bytes')
    next()
  }
  return {
    name: 'afirmacao-accept-ranges',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), acceptRanges()],
})
