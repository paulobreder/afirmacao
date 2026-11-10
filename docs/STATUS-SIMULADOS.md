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

| Ano | LC | CH | CN | MT | Validadas | Pendentes | Anuladas | Rejeitadas |
|---|---|---|---|---|---|---|---|---|
| 2016 | 50/50 | 39/45 | 34/45 | 42/45 | 165 | 20 | 0 | 0 |
| 2017 | 48/50 | 45/45 | 36/45 | 39/45 | 168 | 17 | 0 | 0 |
| 2018 | 50/50 | 40/45 | 33/45 | 36/45 | 159 | 25 | 1 | 0 |
| 2019 | 50/50 | 45/45 | 37/45 | 38/45 | 170 | 14 | 0 | 1 |
| 2020 | 50/50 | 45/45 | 36/45 | 35/45 | 166 | 17 | 2 | 0 |
| 2021 | 48/50 | 42/45 | 34/45 | 35/45 | 159 | 25 | 1 | 0 |
| 2022 | 48/50 | 45/45 | 37/45 | 40/45 | 170 | 14 | 1 | 0 |
| 2023 | 50/50 | 43/45 | 33/45 | 37/45 | 163 | 21 | 1 | 0 |
| 2024 | 47/50 | 45/45 | 42/45 | 43/45 | 177 | 7 | 1 | 0 |
| 2025 | 44/50 | 43/45 | 42/45 | 40/45 | 169 | 13 | 3 | 0 |
| **Total** | | | | | **1 666** | **173** | **10** | **1** |

Publicadas por área: LC 485 (50 de inglês, 48 de espanhol), CH 432, CN 364, MT 385 → simulado completo disponível nos dois dias.
Detalhe por questão em `docs/enem-banco-relatorio.json`.

### Como a fidelidade é garantida
- Cada questão é um recorte do PDF oficial (a imagem é o próprio original), delimitado pelo cabeçalho "QUESTÃO N" e pelo início da questão seguinte.
- Validação automática: alternativas A–E presentes no recorte; nenhum texto, imagem ou figura cortado na borda; até 3 colunas; ID único; sem duplicatas de enunciado; gabarito do mesmo caderno lido por dois métodos independentes (sequência de texto e posição na página: 1 798 de 1 800 coincidiram; os 2 divergentes foram conferidos à mão — eram anuladas).
- Auditoria visual por amostragem: 24 questões (2 a 4 por edição, priorizando Matemática/Natureza, recortes em várias partes, língua estrangeira e páginas de 2025 em coluna única). Todas íntegras; 10 tiveram o gabarito conferido também pela resolução. A auditoria encontrou e corrigiu um corte de cabeçalho nas páginas em coluna única.
- Correções de layout (10/11/2026): colunas por página par/ímpar (2025 tem margens espelhadas), borda direita pela extensão real do texto, filete divisor exigindo linha longa (2017). Recuperaram 99 questões; 8 delas auditadas visualmente, todas íntegras (5 com gabarito conferido pela resolução).
- Recorte composto (faixa em largura total + coluna) foi testado e **reprovado na auditoria**: em páginas com faixa em largura total a ordem de leitura não segue as colunas e 2019-MT-179 perdeu a planta baixa citada no enunciado (rejeitada). As 48 questões com esse recorte ficam pendentes para conferência manual.

### Pendentes (173) — fora dos simulados
- Motivo principal: figura, tabela ou texto em largura total dentro de uma página de duas colunas, onde a ordem de leitura não é por coluna (48 delas têm recorte composto pronto para conferência).
- 52 também sem as alternativas A–E identificadas no texto extraído.
- Conferência: `.venv/bin/python scripts/enem/revisar.py` gera `.enem-cache/revisao/index.html` (recorte × página original). Decisões em `scripts/enem/revisao-manual.json` e `import_enem.py --publish-only`.

## Testes realizados
- `npm test` (Vitest): 39 testes — integridade do banco publicado, gabaritos, deduplicação, distribuição 45/45, língua estrangeira, sorteio, banco insuficiente, persistência e retomada, cronômetro, correção e bloqueio, painel, 100 temas, análise de redação, salvamento de redações, exportação/importação.
- `npm run lint` e `npm run build` sem erros.
- Navegador (1440px e 375px): fluxo completo do 1º dia (iniciar, responder, revisar, recarregar e retomar, redação, finalizar, resultado), treino do 2º dia, redação com análise, painel; sem rolagem horizontal nas páginas novas e antigas.

## Reutilização
Aprovada pela coordenação em 10/11/2026 (questões do Inep — CC BY-ND 3.0 no portal gov.br — e textos de terceiros citados nelas).

## Próxima etapa necessária
1. Conferência manual das 173 pendentes (opcional: o simulado completo já está disponível nos dois dias).
