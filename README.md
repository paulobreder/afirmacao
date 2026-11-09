# AfirmAção — Seu caminho gratuito para o ENEM

Plataforma pública e gratuita com materiais de estudo e orientações para estudantes de cursinho popular.

**Site no ar:** https://paulobreder.github.io/afirmacao/

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

Para publicar ou atualizar o site no GitHub Pages, rode no seu computador:

```bash
npm run deploy
```

O comando gera o build com `BASE_PATH=/afirmacao/` (o site fica nesse subendereço) e envia a pasta `dist/` para a branch `gh-pages`.
O site atualiza em cerca de 1 a 2 minutos. Alterações feitas só no GitHub (por exemplo, pelo github.dev) precisam de `git pull` seguido de `npm run deploy`.

Também funciona em outras hospedagens estáticas (pasta `dist/`; inclui `_redirects` para Netlify e `vercel.json`).
O servidor precisa aceitar pedidos parciais (`Accept-Ranges: bytes`) para os PDFs grandes abrirem por partes — Netlify, Vercel e nginx fazem isso por padrão.

**Arquivo fora do repositório:** `public/materiais/fichas-resumo-objetivo-1.pdf` (168 MB) passa do limite de 100 MB do GitHub e está no `.gitignore`.
Para tê-lo localmente ou na hospedagem, copie `CONTEUDOS_SITE/rx-sociologia/Ficha resumo objetivo -1.pdf` para esse caminho. Sem ele (como no GitHub Pages), o card e a página do material mostram que o arquivo está indisponível, sem botões de baixar.

Situação atual e pendências: [docs/STATUS.md](docs/STATUS.md).
