# AfirmAção — Simulados, redação e desempenho: status

_Última atualização: 10 de novembro de 2026._

## Funcionalidades concluídas
- `/simulados`: escolha da prova, banco disponível, retomada de simulado em andamento.
- `/simulados/dia-1` e `/simulados/dia-2`: simulado completo (90 questões; 1º dia com escolha de inglês/espanhol e proposta de redação) e treino reduzido (5 a 30 por área).
- `/simulados/prova/:id`: cronômetro de tempo efetivo, mapa de questões, respondidas/pendentes, marcar para revisão, salvamento automático (IndexedDB), retomada sem novo sorteio, finalização com confirmação e bloqueio.
- `/simulados/resultado/:id`: acertos, erros, brancos, %, tempo, desempenho por área, revisão com alternativa marcada, gabarito e origem. Sem nota TRI.
- `/simulados/redacao` e `/simulados/redacao/:id`: 100 temas autorais (18 eixos), sorteio com filtro por eixo e sem repetir temas recentes, editor com palavras/linhas, cronômetro opcional, autossalvamento, análise por regras e checklist de autoavaliação. Sem IA, sem nota.
- `/simulados/desempenho`: indicadores, acertos por área, evolução, redações, histórico, exportar/importar backup JSON (com validação e confirmação).
- Integração: item "Simulados" no menu e no rodapé; faixa compacta na página inicial (entre categorias e Guia).

## Banco de questões (Inep, aplicação regular impressa, caderno 1 Azul e caderno 7 Azul)
Validadas/total extraído por área (LC inclui as 5 de inglês e as 5 de espanhol):

| Ano | LC | CH | CN | MT | Validadas | Pendentes | Anuladas |
|---|---|---|---|---|---|---|---|
| 2016 | 50/50 | 39/45 | 34/45 | 42/45 | 165 | 20 | 0 |
| 2017 | 48/50 | 45/45 | 19/45 | 21/45 | 133 | 52 | 0 |
| 2018 | 50/50 | 40/45 | 33/45 | 36/45 | 159 | 25 | 1 |
| 2019 | 50/50 | 45/45 | 37/45 | 38/45 | 170 | 15 | 0 |
| 2020 | 50/50 | 45/45 | 36/45 | 35/45 | 166 | 17 | 2 |
| 2021 | 48/50 | 42/45 | 34/45 | 35/45 | 159 | 25 | 1 |
| 2022 | 48/50 | 45/45 | 37/45 | 40/45 | 170 | 14 | 1 |
| 2023 | 50/50 | 43/45 | 33/45 | 37/45 | 163 | 21 | 1 |
| 2024 | 47/50 | 45/45 | 42/45 | 43/45 | 177 | 7 | 1 |
| 2025 | 29/50 | 27/45 | 20/45 | 29/45 | 105 | 77 | 3 |
| **Total** | | | | | **1 567** | **273** | **10** |

Publicadas por área: LC 470 (50 de inglês, 45 de espanhol), CH 416, CN 325, MT 356 → simulado completo disponível nos dois dias.
Rejeitadas: 0. Detalhe por questão em `docs/enem-banco-relatorio.json`.

### Como a fidelidade é garantida
- Cada questão é um recorte do PDF oficial (a imagem é o próprio original), delimitado pelo cabeçalho "QUESTÃO N" e pelo início da questão seguinte.
- Validação automática: alternativas A–E presentes no recorte; nenhum texto, imagem ou figura cortado na borda; até 3 colunas; ID único; sem duplicatas de enunciado; gabarito do mesmo caderno lido por dois métodos independentes (sequência de texto e posição na página: 1 798 de 1 800 coincidiram; os 2 divergentes foram conferidos à mão — eram anuladas).
- Auditoria visual por amostragem: 24 questões (2 a 4 por edição, priorizando Matemática/Natureza, recortes em várias partes, língua estrangeira e páginas de 2025 em coluna única). Todas íntegras; 10 tiveram o gabarito conferido também pela resolução. A auditoria encontrou e corrigiu um corte de cabeçalho nas páginas em coluna única.

### Pendentes (273) — fora dos simulados
- Motivo principal: figura, tabela ou texto em largura total da página dentro de uma página de duas colunas (o recorte por coluna cortaria o conteúdo). 2017 (CN/MT) e 2025 concentram esses casos.
- 52 também sem as alternativas A–E identificadas no texto extraído.
- Conferência: `.venv/bin/python scripts/enem/revisar.py` gera `.enem-cache/revisao/index.html` (recorte × página original). Decisões em `scripts/enem/revisao-manual.json` e `import_enem.py --publish-only`.

## Testes realizados
- `npm test` (Vitest): 39 testes — integridade do banco publicado, gabaritos, deduplicação, distribuição 45/45, língua estrangeira, sorteio, banco insuficiente, persistência e retomada, cronômetro, correção e bloqueio, painel, 100 temas, análise de redação, salvamento de redações, exportação/importação.
- `npm run lint` e `npm run build` sem erros.
- Navegador (1440px e 375px): fluxo completo do 1º dia (iniciar, responder, revisar, recarregar e retomar, redação, finalizar, resultado), treino do 2º dia, redação com análise, painel; sem rolagem horizontal nas páginas novas e antigas.

## Próxima etapa necessária
1. Conferir as 273 pendentes (ou implementar recorte de faixas em largura total) e registrar decisões.
2. Coordenação: confirmar a reutilização (ver Pendências do relatório) e autorizar a publicação.
