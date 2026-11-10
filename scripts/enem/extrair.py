"""EXTRAÇÃO, GABARITOS E NORMALIZAÇÃO.

Cada questão é localizada pelo cabeçalho "QUESTÃO NN" e recortada do PDF oficial
como imagem (fidelidade por construção: o estudante vê exatamente o original,
inclusive fórmulas, tabelas e figuras). O texto extraído serve à busca, à
acessibilidade e às verificações automáticas (alternativas A–E presentes etc.).
"""
from __future__ import annotations

import io
import json
import re

import fitz  # PyMuPDF
import numpy as np
from PIL import Image

from comum import CACHE, RECORTES, area_de, areas_do_dia, primeira_lingua, log

ZOOM = 2.5            # 72 dpi × 2,5 ≈ 180 dpi: nítido em telas de alta densidade
QUALIDADE_WEBP = 72
RE_CAB = re.compile(r'^QUEST[ÃA]O\s*(\d{1,3})\b', re.I)
RE_FAIXA = re.compile(
    r'^(Quest(õ|o)es de \d|LINGUAGENS, C[ÓO]DIGOS|CI[ÊE]NCIAS (HUMANAS|DA NATUREZA)|MATEM[ÁA]TICA E SUAS|'
    r'L[ÍI]NGUA (INGLESA|ESPANHOLA)|PROPOSTA DE REDA|INSTRU[ÇC][ÕO]ES PARA A REDA|RASCUNHO|TRANSCREVA A SUA REDA)', re.I)
RE_PARADA = re.compile(r'(PROPOSTA DE REDA[ÇC][ÃA]O|INSTRU[ÇC][ÕO]ES PARA A REDA|RASCUNHO|TRANSCREVA A SUA REDA)', re.I)
RE_ALT = re.compile(r'^\s*([A-E])(?:[\s\t ]|$)')


# ---------------------------------------------------------------- gabarito
def _gabarito_posicional(doc, ini, fim, lingua):
    """Lê o gabarito pela posição: a resposta é a letra na mesma linha, à direita do número."""
    resp: dict[int, list[str]] = {}
    for page in doc:
        palavras = page.get_text('words')  # x0, y0, x1, y1, texto, ...
        letras = [w for w in palavras if re.fullmatch(r'[A-E]|ANULAD[OA]|X|\*', w[4].strip().upper())]
        for w in palavras:
            t = w[4].strip()
            if not t.isdigit() or not (ini <= int(t) <= fim):
                continue
            n = int(t)
            cy = (w[1] + w[3]) / 2
            mesma = sorted([l for l in letras if abs((l[1] + l[3]) / 2 - cy) < 3.5 and 0 < l[0] - w[2] < 140], key=lambda l: l[0])
            if not mesma:
                continue
            k = 2 if lingua is not None and lingua <= n < lingua + 5 else 1
            vals = ['ANULADA' if l[4].strip().upper() not in 'ABCDE' else l[4].strip().upper() for l in mesma[:k]]
            # se a linha tem várias colunas de números, pega só as letras antes do próximo número
            prox = [x for x in palavras if x[4].strip().isdigit() and abs((x[1] + x[3]) / 2 - cy) < 3.5 and x[0] > w[2]]
            if prox:
                limite = min(x[0] for x in prox)
                vals = ['ANULADA' if l[4].strip().upper() not in 'ABCDE' else l[4].strip().upper() for l in mesma if l[0] < limite][:k]
            if vals and n not in resp:
                resp[n] = vals
    return resp


def ler_gabarito(pdf, ano: int, dia: int) -> dict:
    doc = fitz.open(pdf)
    texto = '\n'.join(p.get_text() for p in doc)
    toks = [t.strip() for t in texto.split('\n') if t.strip()]
    faixas = areas_do_dia(ano, dia)
    ini, fim = faixas[0][1], faixas[-1][2]
    lingua = primeira_lingua(ano, dia)
    resp: dict[int, list[str]] = {}
    i = 0
    while i < len(toks):
        t = toks[i]
        if t.isdigit() and ini <= int(t) <= fim and int(t) not in resp:
            n = int(t)
            vals = []
            j = i + 1
            while j < len(toks) and len(vals) < 2:
                v = toks[j].upper()
                if re.fullmatch(r'[A-E]', v):
                    vals.append(v)
                elif re.fullmatch(r'ANULAD[OA]|X|\*', v):
                    vals.append('ANULADA')
                else:
                    break
                j += 1
                if lingua is None or not (lingua <= n < lingua + 5):
                    break
            if vals:
                resp[n] = vals
                i = j
                continue
        i += 1
    # Conferência cruzada: leitura por sequência de texto × leitura por posição na página
    pos = _gabarito_posicional(doc, ini, fim, lingua)
    divergentes = sorted(n for n in set(resp) | set(pos) if resp.get(n) != pos.get(n))
    for n in divergentes:
        if n in pos and (n not in resp or len(pos[n]) >= len(resp.get(n, []))):
            resp[n] = pos[n]
    caderno_ok = bool(re.search(r'CADERNO\s*\d+|cad', texto, re.I))
    return {'respostas': resp, 'divergencias_leitura': divergentes, 'cabecalho': texto[:160].replace('\n', ' '), 'caderno_no_pdf': caderno_ok}


# ---------------------------------------------------------------- prova
def _linhas(page):
    out = []
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            t = ''.join(s['text'] for s in l['spans'])
            if t.strip():
                out.append((fitz.Rect(l['bbox']), t))
    return out


def _layout(doc, paridade=None):
    """Colunas (x) inferidas dos cabeçalhos de questão. Algumas edições (2025) espelham
    as margens entre páginas pares e ímpares, então o cálculo é feito por paridade."""
    W = doc[0].rect.width
    xs = []
    for pno, p in enumerate(doc):
        if paridade is not None and pno % 2 != paridade:
            continue
        for r, t in _linhas(p):
            if RE_CAB.match(t.strip()):
                xs.append(r.x0)
    if not any(x < W / 2 for x in xs) or not any(x > W / 2 for x in xs):
        return _layout(doc) if paridade is not None else None
    esq = min(x for x in xs if x < W / 2)
    dir_ = min(x for x in xs if x > W / 2)
    fim_esq, ini_dir = dir_ - 6, dir_ - 4
    # filete vertical entre as colunas: fica fora dos dois recortes
    for pno, p in enumerate(list(doc)[1:8], start=1):
        if paridade is not None and pno % 2 != paridade:
            continue
        for d in p.get_drawings():
            r = d['rect']
            if r.width < 3 and r.height > p.rect.height * 0.6 and esq + 100 < r.x0 < dir_:
                fim_esq = min(fim_esq, r.x0 - 1.5)
                ini_dir = max(ini_dir, r.x1 + 1.5)
    # borda direita: a maior extensão real de texto (margens espelhadas não são simétricas)
    direita = W - esq + 6
    for pno, p in enumerate(doc):
        if pno == 0 or (paridade is not None and pno % 2 != paridade):
            continue
        topo, base = _faixa_util(p)
        for r, t in _linhas(p):
            if topo <= r.y0 and r.y1 <= base and r.width < W * 0.9 and len(t.strip()) > 2:
                direita = max(direita, min(r.x1 + 3, W - 2))
    return [(esq - 8, fim_esq), (ini_dir, direita)]


def _faixa_util(page):
    H = page.rect.height
    topo, base = 0.0, H
    for r, t in _linhas(page):
        if r.y1 < H * 0.12 and (t.strip().startswith('*') or re.search(r'ENEM20\d\dENEM', t)):
            topo = max(topo, r.y1 + 2)
        if r.y0 > H * 0.88 and (re.search(r'CADERNO|Caderno|Página|ENEM20\d\dENEM', t) or re.fullmatch(r'\s*\d{1,2}\s*', t)):
            base = min(base, r.y0 - 2)
    for d in page.get_drawings():  # filetes decorativos de cabeçalho/rodapé
        r = d['rect']
        if r.width > page.rect.width * 0.5 and r.height < 6:
            if r.y1 < H * 0.12:
                topo = max(topo, r.y1 + 1)
            elif r.y0 > H * 0.88:
                base = min(base, r.y0 - 1)
    return topo, base


def _coluna_unica(page, faixa) -> bool:
    """Página diagramada em uma coluna só: várias linhas de largura total e quase
    nenhuma linha restrita à metade direita."""
    W = page.rect.width
    topo, base = faixa
    ls = [(r, t) for r, t in _linhas(page) if r.y0 >= topo and r.y1 <= base and len(t.strip()) > 2]
    largas = sum(1 for r, _ in ls if r.width > 0.62 * W)
    so_direita = sum(1 for r, _ in ls if r.x0 > W / 2 and r.width < 0.45 * W)
    return largas >= 4 and so_direita <= 3


def _aparar(img: Image.Image) -> Image.Image | None:
    a = np.asarray(img.convert('L'))
    tinta = a < 235
    linhas = np.where(tinta.sum(axis=1) > 0)[0]
    cols = np.where(tinta.sum(axis=0) > 0)[0]
    if len(linhas) == 0:
        return None
    m = 6
    y0, y1 = max(0, linhas[0] - m), min(a.shape[0], linhas[-1] + m + 1)
    x0, x1 = max(0, cols[0] - m), min(a.shape[1], cols[-1] + m + 1)
    return img.crop((x0, y0, x1, y1))


def _cruzamentos(page, rect):
    """Elementos que começam dentro do recorte e continuam além da borda da coluna
    (figura ou texto em largura total) indicam recorte incompleto."""
    W = page.rect.width
    x0, x1 = rect.x0, rect.x1
    probs = []

    def cruza(r, minimo):
        if r.width > W * 0.9:  # molduras e marcas de corte da página
            return False
        inter = fitz.Rect(r) & rect
        if inter.is_empty or inter.height < minimo:
            return False
        return r.x0 < x0 - 3 or r.x1 > x1 + 3

    if any(cruza(r, 4) and r.height > 3 for r, t in _linhas(page) if len(t.strip()) > 1):
        probs.append('texto ultrapassa a coluna')
    if any(cruza(fitz.Rect(i['bbox']), 6) and i['bbox'][2] - i['bbox'][0] > 20 for i in page.get_image_info()):
        probs.append('imagem ultrapassa a coluna')
    if any(cruza(d['rect'], 6) and d['rect'].width > 40 for d in page.get_drawings()):
        probs.append('figura ultrapassa a coluna')
    return probs


def _composto(page, rect, cols, faixa):
    """Recorte composto para questões com figura/tabela/texto em largura total:
    as faixas onde há elementos atravessando o vão entre colunas são recortadas na
    largura total; o restante, só na coluna da questão (posição original preservada).
    Só aceita quando a outra coluna está VAZIA nessas faixas — nunca mistura questões.
    Devolve (imagem, textos) ou None."""
    W = page.rect.width
    xL, xR = cols[0][0], cols[1][1]
    linhas = [(r, t) for r, t in _linhas(page) if len(t.strip()) > 1]
    elems = [r for r, _ in linhas] + [fitz.Rect(i['bbox']) for i in page.get_image_info()] + \
            [d['rect'] for d in page.get_drawings() if not (d['rect'].width < 3 and d['rect'].height > 100)]
    cruzam = []
    for r in elems:
        if r.width > W * 0.9:
            continue
        inter = fitz.Rect(r) & rect
        if inter.is_empty or inter.height < 4 or not (r.x0 < rect.x0 - 3 or r.x1 > rect.x1 + 3):
            continue
        if r.x0 < xL - 3 or r.x1 > xR + 3 or r.y0 < rect.y0 - 2 or r.y1 > rect.y1 + 2:
            return None
        cruzam.append(fitz.Rect(r))
    if not cruzam:
        return None
    faixas = []
    for r in sorted(cruzam, key=lambda r: r.y0):
        a, b = max(r.y0 - 3, rect.y0), min(r.y1 + 3, rect.y1)
        if faixas and a <= faixas[-1][1]:
            faixas[-1][1] = max(faixas[-1][1], b)
        else:
            faixas.append([a, b])
    for a, b in faixas:
        banda = fitz.Rect(xL, a, xR, b)
        for r in elems:
            inter = fitz.Rect(r) & banda
            if inter.is_empty or inter.height < 3 or inter.width < 2:
                continue
            fora = r.x0 >= rect.x1 - 1 or r.x1 <= rect.x0 + 1  # só na outra coluna
            if fora:
                return None  # a outra coluna tem conteúdo nessa faixa: não dá para recortar sem misturar
    Z = ZOOM
    larg, alt = int((xR - xL) * Z) + 1, int((rect.y1 - rect.y0) * Z) + 1
    tela = Image.new('RGB', (larg, alt), 'white')

    def colar(clip, x_dest):
        pix = page.get_pixmap(matrix=fitz.Matrix(Z, Z), clip=clip, alpha=False)
        tela.paste(Image.open(io.BytesIO(pix.tobytes('png'))), (int((x_dest - xL) * Z), int((clip.y0 - rect.y0) * Z)))

    y = rect.y0
    for a, b in faixas + [[rect.y1, rect.y1]]:
        if a - y > 1:
            colar(fitz.Rect(rect.x0, y, rect.x1, a), rect.x0)
        if b - a > 1:
            colar(fitz.Rect(xL, a, xR, b), xL)
        y = b
    area = [rect] + [fitz.Rect(xL, a, xR, b) for a, b in faixas]
    textos = [t for r, t in sorted(linhas, key=lambda z: (z[0].y0, z[0].x0))
              if any(ar.contains(fitz.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2)) for ar in area)]
    return tela, textos


def _cortar_apos_E(doc, colunas, segs, ultima):
    """Descarta colunas posteriores à da alternativa E; na última questão do caderno,
    encerra o recorte logo após o bloco da alternativa E."""
    vistos = ''
    for i, (pno, col, y0, y1) in enumerate(segs):
        x0, x1 = colunas[pno][col]
        rect = fitz.Rect(x0, y0, x1, y1)
        linhas = sorted([(r, t) for r, t in _linhas(doc[pno]) if rect.contains(fitz.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2))], key=lambda z: z[0].y0)
        for j, (r, t) in enumerate(linhas):
            m = RE_ALT.match(t)
            if m:
                vistos += m.group(1)
            if re.search('A.*B.*C.*D.*E$', vistos):
                if ultima:
                    fim = r.y1
                    for r2, _ in linhas[j + 1:]:
                        if r2.y0 - fim > 14 or RE_ALT.match(_):
                            break
                        fim = r2.y1
                    return segs[:i] + [(pno, col, y0, fim + 3)]
                return segs[:i + 1]
    return segs


def extrair(ano: int, dia: int) -> list[dict]:
    pdf = CACHE / str(ano) / f'D{dia}_prova.pdf'
    doc = fitz.open(pdf)
    por_paridade = {0: _layout(doc, 0), 1: _layout(doc, 1)}
    faixas_pag = [_faixa_util(p) for p in doc]
    # Páginas em coluna única (layout de largura total) usam um só recorte por página
    cols_pag = []
    for i, p in enumerate(doc):
        c2 = por_paridade[i % 2]
        cols_pag.append([(c2[0][0], c2[1][1])] if _coluna_unica(p, faixas_pag[i]) else c2)
    gab = ler_gabarito(CACHE / str(ano) / f'D{dia}_gabarito.pdf', ano, dia)
    lingua0 = primeira_lingua(ano, dia)

    # Sequência de leitura: página → coluna → y
    eventos = []   # (pag, col, y, tipo, valor)
    parada = None
    for pno, p in enumerate(doc):
        for r, t in _linhas(p):
            col = 0 if len(cols_pag[pno]) == 1 or r.x0 < cols_pag[pno][1][0] else 1
            s = t.strip()
            m = RE_CAB.match(s)
            if m:
                eventos.append((pno, col, r.y0, 'q', int(m.group(1))))
            elif RE_FAIXA.match(s):
                eventos.append((pno, col, r.y0, 'faixa', s[:40]))
                if RE_PARADA.search(s) and parada is None and any(e[3] == 'q' for e in eventos):
                    parada = (pno, col, r.y0)
    eventos.sort(key=lambda e: (e[0], e[1], e[2]))

    questoes = []
    vistos: dict[int, int] = {}
    for k, ev in enumerate(eventos):
        if ev[3] != 'q':
            continue
        numero = ev[4]
        # Fim: próximo evento (cabeçalho ou faixa) na ordem de leitura, ou a parada (redação/rascunho)
        prox = next((e for e in eventos[k + 1:]), None)
        fim = (prox[0], prox[1], prox[2]) if prox else (len(doc) - 1, 1, faixas_pag[-1][1])
        if parada and fim > parada > (ev[0], ev[1], ev[2]):
            fim = parada
        segs = []
        pos = (ev[0], ev[1])
        while True:
            pno, col = pos
            topo, base = faixas_pag[pno]
            y0 = ev[2] if pos == (ev[0], ev[1]) else topo
            y1 = fim[2] if pos == (fim[0], fim[1]) else base
            if y1 - y0 > 4:
                # o segmento do cabeçalho começa no próprio cabeçalho (filetes do topo da página não o cortam)
                inicio = y0 - 1 if pos == (ev[0], ev[1]) else max(y0, topo) - 1
                segs.append((pno, col, inicio, min(y1, base)))
            if pos == (fim[0], fim[1]) or pos > (fim[0], fim[1]):
                break
            pos = (pno, col + 1) if col + 1 < len(cols_pag[pno]) else (pno + 1, 0)
            if pos[0] >= len(doc):
                break

        ocorr = vistos.get(numero, 0)
        vistos[numero] = ocorr + 1
        lingua = None
        if lingua0 is not None and lingua0 <= numero < lingua0 + 5:
            lingua = 'ingles' if ocorr == 0 else 'espanhol'
        area = area_de(ano, dia, numero)
        qid = f'{ano}-{area}-{numero:03d}' + ({'ingles': '-ing', 'espanhol': '-esp'}[lingua] if lingua else '')

        segs = _cortar_apos_E(doc, cols_pag, segs, ultima=not any(e[3] == 'q' for e in eventos[k + 1:]))
        imagens, textos, problemas = [], [], []
        compostos = 0
        if len(segs) > 3:
            problemas.append('questão em mais de 3 colunas')
        for i, (pno, col, y0, y1) in enumerate(segs):
            page = doc[pno]
            x0, x1 = cols_pag[pno][col]
            rect = fitz.Rect(x0, y0, x1, y1)
            probs = _cruzamentos(page, rect)
            comp = _composto(page, rect, cols_pag[pno], faixas_pag[pno]) if probs and len(cols_pag[pno]) == 2 else None
            if comp:
                bruta, ts = comp
                textos += ts
                compostos += 1
            else:
                textos += [t for r, t in _linhas(page) if rect.contains(fitz.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2))]
                problemas += probs
                pix = page.get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM), clip=rect, alpha=False)
                bruta = Image.open(io.BytesIO(pix.tobytes('png')))
            img = _aparar(bruta)
            if img is None:
                continue
            nome = f'{qid}-{i + 1}.webp' if len(segs) > 1 else f'{qid}.webp'
            destino = RECORTES / str(ano) / nome
            destino.parent.mkdir(parents=True, exist_ok=True)
            img.save(destino, 'WEBP', quality=QUALIDADE_WEBP, method=6)
            imagens.append({'src': f'{ano}/{nome}', 'w': img.width, 'h': img.height})

        texto = '\n'.join(textos)
        # remove o cabeçalho "QUESTÃO NN" do texto
        texto = RE_CAB.sub('', texto, count=1).strip()
        letras = [m.group(1) for t in textos if (m := RE_ALT.match(t))]
        seq = ''.join(letras)
        if not re.search('A.*B.*C.*D.*E', seq, re.S):
            problemas.append(f'alternativas A–E não identificadas no texto ({seq or "nenhuma"})')
        resp = gab['respostas'].get(numero)
        if not resp:
            gabarito = None
            problemas.append('sem gabarito')
        elif lingua:
            gabarito = resp[0] if lingua == 'ingles' else (resp[1] if len(resp) > 1 else None)
        else:
            gabarito = resp[0]
        if gabarito is None and resp:
            problemas.append('gabarito de língua estrangeira incompleto')
        questoes.append({
            'id': qid, 'ano': ano, 'dia': dia, 'caderno': 1 if dia == 1 else 7, 'cor': 'Azul',
            'numero': numero, 'area': area, 'lingua': lingua, 'gabarito': gabarito,
            'paginas': sorted({s[0] + 1 for s in segs}), 'imagens': imagens,
            'texto': texto, 'problemas': sorted(set(problemas)), 'recorte_composto': compostos,
        })
    return questoes


GAB_PROBS = ('sem gabarito', 'gabarito de língua estrangeira incompleto', 'leituras do gabarito divergentes')


def aplicar_gabarito(qs: list[dict], ano: int, dia: int) -> list[dict]:
    """(Re)associa o gabarito oficial do mesmo caderno — barato, roda sempre."""
    gab = ler_gabarito(CACHE / str(ano) / f'D{dia}_gabarito.pdf', ano, dia)
    for q in qs:
        q['problemas'] = [p for p in q['problemas'] if p not in GAB_PROBS]
        resp = gab['respostas'].get(q['numero'])
        if not resp:
            q['gabarito'] = None
            q['problemas'].append('sem gabarito')
        elif q['lingua']:
            q['gabarito'] = resp[0] if q['lingua'] == 'ingles' else (resp[1] if len(resp) > 1 else None)
            if q['gabarito'] is None:
                q['problemas'].append('gabarito de língua estrangeira incompleto')
        else:
            q['gabarito'] = resp[0]
        q['gabarito_conferencia'] = 'texto+posicao' if q['numero'] not in gab['divergencias_leitura'] else 'posicao'
    return qs


def processar(ano: int, dia: int, forcar=False) -> list[dict]:
    """Checkpoint: não reprocessa um dia já extraído com as mesmas fontes."""
    saida = CACHE / str(ano) / f'D{dia}_questoes.json'
    fontes = json.loads((CACHE / str(ano) / 'fontes.json').read_text())['dias'][str(dia)]
    assinatura = [fontes.get('prova_sha256'), fontes.get('gabarito_sha256'), ZOOM, QUALIDADE_WEBP, 11]
    if saida.exists() and not forcar:
        dados = json.loads(saida.read_text())
        if dados.get('assinatura') == assinatura:
            qs = aplicar_gabarito(dados['questoes'], ano, dia)
            saida.write_text(json.dumps({'assinatura': assinatura, 'questoes': qs}, ensure_ascii=False))
            return qs
    qs = aplicar_gabarito(extrair(ano, dia), ano, dia)
    saida.write_text(json.dumps({'assinatura': assinatura, 'questoes': qs}, ensure_ascii=False))
    log(f'{ano} D{dia}: {len(qs)} questões extraídas, {sum(1 for q in qs if q["problemas"])} com alerta')
    return qs
