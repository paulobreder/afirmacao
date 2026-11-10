# AfirmAção — status do projeto

_Última atualização: 9 de novembro de 2026 — primeira versão completa._

## Publicação
- No ar em https://paulobreder.github.io/afirmacao/ (GitHub Pages), publicado automaticamente a cada envio para `main` (`.github/workflows/deploy.yml`).
- A ficha de resumo não está na versão publicada (arquivo fora do repositório) e aparece como indisponível.

## Entregue
- **Início** (`/`): hero em duas colunas com a imagem aprovada da estudante, acesso às 3 categorias, destaque do Guia, sugestões de materiais e bloco institucional.
- **Materiais** (`/materiais`): busca (sem acentos/maiúsculas), filtros por categoria e disciplina sincronizados com a URL (`?categoria=&disciplina=&q=`), estado vazio, contagem anunciada para leitores de tela.
- **Material** (`/materiais/:slug`): visualizador pdf.js (uma página por vez, carregamento por partes, zoom, teclado, `?pagina=N`), atalhos para questões/resoluções do Raio-X, download, abrir em nova aba, estado de erro e de arquivo ausente.
- **Guia do Estudante** (`/guia`): conteúdo integral do documento informativo, com checklist de matrícula em destaque, cotas, ProUni/Fies, permanência (acordeões) e links oficiais.
- **Sobre o Projeto** (`/sobre`): missão e proposta, sem fatos inventados.
- **Identidade atualizada (10/11/2026):** logo institucional original (punho com lápis) em `public/img/marca/`, extraída da prancha da coordenação com fundo removido; favicon recortado do punho; paleta laranja `#F57C00`, vermelho `#DB3831`, amarelo `#F1B521` e branco (tokens em `src/index.css`). Layout, textos e funcionalidades inalterados.
- **Simulados (10/11/2026):** módulo `/simulados` (1º e 2º dia, Laboratório de Redação, Meu Desempenho). Detalhes e números em `docs/STATUS-SIMULADOS.md`.

## Inventário de PDFs (`CONTEUDOS_SITE/rx-sociologia/`, 19 arquivos)
| Categoria | Qtde | Arquivos |
|---|---|---|
| Revisão | 7 | Biologia, Física, Química, Matemática, Português, História, Geografia (Ser Protagonista, Edições SM) |
| Raio-X ENEM | 9 | rx-biologia, fisica, quimica, matematica, historia, geografia, filosofia, sociologia, ingles (50 questões + resoluções cada) |
| Resumos e conteúdos essenciais | 2 | Conteúdos que mais caem ENEM; Ficha resumo objetivo -1 |
| Guia do Estudante (página própria) | 1 | Documento sem nome(2).PDF |

Cópias com nomes sem acento em `public/materiais/`; capas geradas em `public/capas/`. Originais intactos.

## Verificações feitas
- `npm run lint` e `npm run build` sem erros.
- Rotas, menu (desktop e celular), busca, filtros, visualização, download e estado de arquivo ausente testados no navegador (1440px e 375px), sem rolagem horizontal.
- Arquivos grandes: o visualizador abre a página 120 da ficha de 176 MB baixando cerca de 1,4 MB.
- Links oficiais do Guia respondendo (o portal do Planalto não respondeu a partir do ambiente de teste; endereço conferido em busca).

## Pendências
- **Arquivo original da logo**: a logo foi recortada da prancha (552 × 318 px). Se a coordenação enviar o arquivo original em alta resolução, substituir `public/img/marca/logo-afirmacao.webp`/`.png` e o favicon.
- **Foto da estudante**: o caderno ainda mostra a logo anterior (mantido por decisão da coordenação até novo pedido).
- **Segunda ficha de resumo não encontrada**: a pasta tem apenas `Ficha resumo objetivo -1.pdf` (volume 1). Ao receber a outra, copiar para `public/materiais/`, gerar a capa e acrescentar em `src/data/materiais.ts`.
- **Tamanho da ficha (176 MB)**: fica fora do repositório no GitHub (limite de 100 MB; ver `.gitignore` e README) e deve ser enviada direto à hospedagem, que também pode limitar o tamanho por arquivo.
- **Direitos de distribuição**: as apostilas são de editoras (Edições SM, SAS, Objetivo); confirmar autorização para publicação aberta.
- Guia: regras e valores de programas mudam a cada edição; revisar a cada novo edital.
