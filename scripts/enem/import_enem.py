"""Pipeline único de importação do ENEM (Inep) para o banco estático da AfirmAção.

Uso (a partir de site/):
  .venv/bin/python scripts/enem/import_enem.py --year 2023      # uma edição
  .venv/bin/python scripts/enem/import_enem.py --all            # 2016–2025
  .venv/bin/python scripts/enem/import_enem.py --all --force    # refaz a extração
  .venv/bin/python scripts/enem/import_enem.py --publish-only   # só valida e publica

Etapas: DOWNLOAD → EXTRAÇÃO → GABARITOS → NORMALIZAÇÃO → DEDUPLICAÇÃO → VALIDAÇÃO → PUBLICAÇÃO.
Idempotente: PDFs com hash conferido não são baixados de novo; dias já extraídos
com as mesmas fontes não são reprocessados (checkpoint em .enem-cache/ANO/).
O terminal mostra só um resumo; os detalhes vão para arquivos.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from comum import ANOS, log  # noqa: E402
import fontes  # noqa: E402
import extrair  # noqa: E402
import publicar  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument('--year', type=int, choices=ANOS)
    g.add_argument('--all', action='store_true')
    g.add_argument('--publish-only', action='store_true')
    ap.add_argument('--force', action='store_true', help='reextrai mesmo com checkpoint válido')
    a = ap.parse_args()

    anos = [] if a.publish_only else (ANOS if a.all else [a.year])
    for ano in anos:
        fontes.baixar(ano)
        for dia in (1, 2):
            extrair.processar(ano, dia, forcar=a.force)
    r = publicar.publicar()
    log(r)


if __name__ == '__main__':
    main()
