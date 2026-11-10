from __future__ import annotations

import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]          # site/
CACHE = RAIZ / '.enem-cache'                         # PDFs originais (fora do git)
SAIDA_DADOS = RAIZ / 'public' / 'simulados' / 'banco'   # JSON servido ao navegador
SAIDA_IMG = RAIZ / 'public' / 'simulados' / 'q'        # recortes publicados (só validadas)
RECORTES = CACHE / 'recortes'                        # todos os recortes extraídos
ANOS = list(range(2016, 2026))

# Áreas por dia (2017 em diante: D1 = LC + CH, D2 = CN + MT; 2016: D1 = CH + CN, D2 = LC + MT)
def areas_do_dia(ano: int, dia: int) -> list[tuple[str, int, int]]:
    """Lista (área, primeira, última) na numeração oficial do caderno."""
    if ano == 2016:
        return [('CH', 1, 45), ('CN', 46, 90)] if dia == 1 else [('LC', 91, 135), ('MT', 136, 180)]
    return [('LC', 1, 45), ('CH', 46, 90)] if dia == 1 else [('CN', 91, 135), ('MT', 136, 180)]


def area_de(ano: int, dia: int, numero: int) -> str:
    for area, a, b in areas_do_dia(ano, dia):
        if a <= numero <= b:
            return area
    raise ValueError(numero)


def primeira_lingua(ano: int, dia: int) -> int | None:
    """Número da 1ª questão de língua estrangeira no dia (as 5 primeiras de LC)."""
    for area, a, _ in areas_do_dia(ano, dia):
        if area == 'LC':
            return a
    return None


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)
