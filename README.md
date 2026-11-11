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

Outros comandos: `npm run build` (gera `dist/`), `npm run preview` (serve o build), `npm run lint`, `npm test` (testes automatizados).

## Estrutura

- `src/pages/` — Início, Materiais, Material (visualizador), Guia do Estudante, Sobre, 404.
- `src/components/` — Header, Footer, Logo (arquivo original da coordenação), MaterialCard, PdfViewer.
- `src/data/materiais.ts` — catálogo da biblioteca.
- `src/data/guia.ts` — conteúdo do Guia do Estudante.
- `public/materiais/` — cópias dos PDFs (nomes sem acento). `public/capas/` — capas em WebP.

- `src/pages/simulados/` e `src/simulados/` — módulo de Simulados (sorteio, prova, correção, redação, desempenho, backup). Tudo roda no navegador, com IndexedDB; não há servidor nem IA.
- `public/simulados/banco/` — banco estático de questões validadas (JSON por área). `public/simulados/q/` — recortes fiéis das questões.
- `scripts/enem/` — pipeline de importação das provas oficiais do Inep. Status em `docs/STATUS-SIMULADOS.md`.

## Banco de questões do ENEM

O banco já está gerado e versionado; não é preciso rodar nada para usar os simulados. Para reconstruir ou conferir:

```bash
python3 -m venv .venv && .venv/bin/pip install pymupdf pillow numpy
.venv/bin/python scripts/enem/import_enem.py --all          # baixa, extrai, valida e publica (retoma do ponto salvo)
.venv/bin/python scripts/enem/revisar.py --amostra 40       # página de conferência manual das pendentes
.venv/bin/python scripts/enem/import_enem.py --publish-only # aplica decisões de scripts/enem/revisao-manual.json
```

Os PDFs originais ficam em `.enem-cache/` (fora do git).

## Adicionar um material

1. Copie o PDF para `public/materiais/<slug>.pdf`.
2. Salve uma capa em `public/capas/<slug>.webp` (opcional, ~480px de largura).
3. Acrescente o item em `src/data/materiais.ts`.

## Publicação

Endereço principal (Vercel, plano Hobby gratuito): **https://afirmacao-two.vercel.app/** — a Vercel está ligada ao repositório e publica sozinha a cada envio para `main` (configuração em `vercel.json`).

O site também é publicado no GitHub Pages (https://paulobreder.github.io/afirmacao/) automaticamente a cada envio para a branch `main` (`.github/workflows/deploy.yml`),
inclusive alterações feitas direto no GitHub ou pelo github.dev. Leva cerca de 1 a 2 minutos; o andamento aparece na aba **Actions** do repositório.
O build usa `BASE_PATH=/afirmacao/` porque o site fica nesse subendereço.

Também funciona em outras hospedagens estáticas (pasta `dist/`; inclui `_redirects` para Netlify e `vercel.json`).
O servidor precisa aceitar pedidos parciais (`Accept-Ranges: bytes`) para os PDFs grandes abrirem por partes — Netlify, Vercel e nginx fazem isso por padrão.

**Arquivo fora do repositório:** `public/materiais/fichas-resumo-objetivo-1.pdf` (168 MB) passa do limite de 100 MB do GitHub e está no `.gitignore`.
Para tê-lo localmente ou na hospedagem, copie `CONTEUDOS_SITE/rx-sociologia/Ficha resumo objetivo -1.pdf` para esse caminho. Sem ele (como no GitHub Pages), o card e a página do material mostram que o arquivo está indisponível, sem botões de baixar.

Situação atual e pendências: [docs/STATUS.md](docs/STATUS.md).
