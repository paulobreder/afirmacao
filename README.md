# AfirmAção — Seu caminho gratuito para o ENEM

Plataforma pública e gratuita com materiais de estudo e orientações para estudantes de cursinho popular.

React + TypeScript + Vite + Tailwind CSS · ícones Lucide · visualizador de PDF com pdf.js.

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:5173.

Outros comandos: `npm run build` (gera `dist/`), `npm run preview` (serve o build), `npm run lint`.

## Estrutura

- `src/pages/` — Início, Materiais, Material (visualizador), Guia do Estudante, Sobre, 404.
- `src/components/` — Header, Footer, Logo (SVG oficial), MaterialCard, PdfViewer.
- `src/data/materiais.ts` — catálogo da biblioteca.
- `src/data/guia.ts` — conteúdo do Guia do Estudante.
- `public/materiais/` — cópias dos PDFs (nomes sem acento). `public/capas/` — capas em WebP.

## Adicionar um material

1. Copie o PDF para `public/materiais/<slug>.pdf`.
2. Salve uma capa em `public/capas/<slug>.webp` (opcional, ~480px de largura).
3. Acrescente o item em `src/data/materiais.ts`.

## Publicação

Site estático (pasta `dist/`). Inclui `_redirects` (Netlify) e `vercel.json` para as rotas do React.
O servidor precisa aceitar pedidos parciais (`Accept-Ranges: bytes`) para os PDFs grandes abrirem por partes — Netlify, Vercel e nginx fazem isso por padrão.

**Arquivo fora do repositório:** `public/materiais/fichas-resumo-objetivo-1.pdf` (168 MB) passa do limite de 100 MB do GitHub e está no `.gitignore`.
Para tê-lo localmente ou na hospedagem, copie `CONTEUDOS_SITE/rx-sociologia/Ficha resumo objetivo -1.pdf` para esse caminho. Sem ele, a página do material mostra o aviso de arquivo indisponível.

Situação atual e pendências: [docs/STATUS.md](docs/STATUS.md).
