"""Gera folhas de conferência (PNG) com os recortes de várias questões lado a lado,
para auditoria visual por amostragem. Uso:
  python folha_auditoria.py SAIDA.png 2023-CH-056 2023-CH-057 ...
"""
import json
import sys

from PIL import Image, ImageDraw

from comum import CACHE, RECORTES

LARG = 420


def carregar(qid):
    ano, dia = int(qid[:4]), None
    for d in (1, 2):
        p = CACHE / str(ano) / f'D{d}_questoes.json'
        if p.exists():
            for q in json.loads(p.read_text())['questoes']:
                if q['id'] == qid:
                    return q
    raise KeyError(qid)


def coluna(q):
    partes = []
    for im in q['imagens']:
        i = Image.open(RECORTES / im['src']).convert('RGB')
        i = i.resize((LARG, int(i.height * LARG / i.width)))
        partes.append(i)
    cab = 34
    h = cab + sum(p.height + 8 for p in partes)
    c = Image.new('RGB', (LARG, h), 'white')
    d = ImageDraw.Draw(c)
    d.rectangle((0, 0, LARG, cab - 4), fill=(255, 235, 214))
    d.text((6, 8), f"{q['id']}  gab={q['gabarito']}  {';'.join(q['problemas'])[:40]}", fill='black')
    y = cab
    for p in partes:
        c.paste(p, (0, y))
        d.line((0, y + p.height + 3, LARG, y + p.height + 3), fill=(219, 56, 49), width=2)
        y += p.height + 8
    return c


if __name__ == '__main__':
    cols = [coluna(carregar(x)) for x in sys.argv[2:]]
    W = sum(c.width + 10 for c in cols)
    H = max(c.height for c in cols)
    folha = Image.new('RGB', (W, H), (200, 200, 200))
    x = 0
    for c in cols:
        folha.paste(c, (x, 0))
        x += c.width + 10
    folha.save(sys.argv[1])
