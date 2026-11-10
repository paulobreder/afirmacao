"""Ferramenta de CONFERÊNCIA MANUAL das questões não publicadas.

Gera .enem-cache/revisao/index.html: para cada questão pendente mostra o recorte
extraído, a página original do PDF e os motivos do bloqueio. Depois de conferir,
registre a decisão em scripts/enem/revisao-manual.json, por exemplo:
  {"2023-CH-056": {"decisao": "rejeitar", "nota": "figura em largura total cortada"},
   "2019-MT-150": {"decisao": "aprovar", "nota": "conferida com o PDF"}}
e rode:  .venv/bin/python scripts/enem/import_enem.py --publish-only

Também gera uma amostra de auditoria de questões VALIDADAS (prioriza as com figura,
fórmula ou mais de um recorte) com --amostra N.

Uso: .venv/bin/python scripts/enem/revisar.py [--ano 2025] [--amostra 40]
"""
from __future__ import annotations

import argparse
import html
import json
import random
import sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from comum import ANOS, CACHE, RECORTES  # noqa: E402
import publicar  # noqa: E402

DESTINO = CACHE / 'revisao'


def pagina_png(ano, dia, pno):
    alvo = DESTINO / 'paginas' / f'{ano}-D{dia}-p{pno}.png'
    if not alvo.exists():
        alvo.parent.mkdir(parents=True, exist_ok=True)
        doc = fitz.open(CACHE / str(ano) / f'D{dia}_prova.pdf')
        doc[pno - 1].get_pixmap(matrix=fitz.Matrix(1.3, 1.3)).save(alvo)
    return f'paginas/{alvo.name}'


def cartao(q, rel_recortes):
    imgs = ''.join(f'<img src="{rel_recortes}/{html.escape(i["src"])}" style="max-width:100%;border:1px solid #ccc;margin:4px 0">' for i in q['imagens'])
    pags = ''.join(f'<img loading="lazy" src="{pagina_png(q["ano"], q["dia"], p)}" style="max-width:100%;border:1px solid #ccc;margin:4px 0">' for p in q['paginas'])
    motivos = ''.join(f'<li>{html.escape(m)}</li>' for m in q.get('motivos', [])) or '<li>(amostra de auditoria)</li>'
    return (f'<section id="{q["id"]}" style="border-top:3px solid #b85600;padding:16px 0">'
            f'<h2 style="margin:0">{q["id"]} — {q["status"]} — gabarito {q["gabarito"]}</h2><ul>{motivos}</ul>'
            f'<div style="display:grid;grid-template-columns:1fr 1.4fr;gap:16px"><div><h3>Recorte</h3>{imgs}</div>'
            f'<div><h3>Página(s) original(is): {", ".join(map(str, q["paginas"]))}</h3>{pags}</div></div></section>')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ano', type=int, choices=ANOS)
    ap.add_argument('--amostra', type=int, default=0, help='inclui N questões validadas sorteadas para auditoria')
    a = ap.parse_args()
    revisao = json.loads(publicar.REVISAO.read_text()) if publicar.REVISAO.exists() else {}
    qs = publicar.classificar(publicar._todas(), revisao)
    if a.ano:
        qs = [q for q in qs if q['ano'] == a.ano]
    pend = [q for q in qs if q['status'] in ('pendente', 'rejeitado')]
    amostra = []
    if a.amostra:
        val = [q for q in qs if q['status'] == 'validado']
        prior = [q for q in val if len(q['imagens']) > 1 or q['area'] in ('MT', 'CN')]
        random.seed(2026)
        amostra = random.sample(prior, min(a.amostra, len(prior)))
    DESTINO.mkdir(parents=True, exist_ok=True)
    rel = Path('..') / RECORTES.name
    corpo = ''.join(cartao(q, rel) for q in pend + amostra)
    (DESTINO / 'index.html').write_text(
        '<!doctype html><meta charset="utf-8"><title>Conferência ENEM</title>'
        '<body style="font-family:system-ui;max-width:1400px;margin:auto;padding:16px">'
        f'<h1>Conferência manual — {len(pend)} não publicadas, {len(amostra)} de amostra</h1>'
        '<p>Registre as decisões em <code>scripts/enem/revisao-manual.json</code> e rode <code>import_enem.py --publish-only</code>.</p>'
        + corpo)
    print(f'{DESTINO / "index.html"}: {len(pend)} pendentes/rejeitadas, {len(amostra)} de amostra')


if __name__ == '__main__':
    main()
