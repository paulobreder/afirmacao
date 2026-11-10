"""DEDUPLICAÇÃO, VALIDAÇÃO e PUBLICAÇÃO do banco estático.

Status de cada registro:
  validado   — passou em todas as verificações automáticas (recorte do PDF oficial
               delimitado pelo próprio cabeçalho, alternativas A–E dentro do recorte,
               nenhum elemento cortado na borda, gabarito oficial do mesmo caderno)
               e não foi reprovado na conferência manual.
  pendente   — alguma verificação falhou; fica fora dos simulados até conferência.
  rejeitado  — reprovado na conferência manual ou sem dados mínimos.
  anulado    — anulado no gabarito oficial; nunca entra no sorteio.

Somente "validado" é publicado em public/simulados/banco/.
Decisões manuais ficam em scripts/enem/revisao-manual.json.
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path

from comum import ANOS, CACHE, RAIZ, RECORTES, SAIDA_DADOS, SAIDA_IMG

REVISAO = Path(__file__).parent / 'revisao-manual.json'
RELATORIO = RAIZ / 'docs' / 'enem-banco-relatorio.json'
AREAS = ['LC', 'CH', 'CN', 'MT']


def _todas():
    qs = []
    for ano in ANOS:
        for dia in (1, 2):
            p = CACHE / str(ano) / f'D{dia}_questoes.json'
            if p.exists():
                qs += json.loads(p.read_text())['questoes']
    return qs


def _norm(t: str) -> str:
    return re.sub(r'\W+', '', t.lower())[:400]


def classificar(qs: list[dict], revisao: dict) -> list[dict]:
    ids = Counter(q['id'] for q in qs)
    por_texto = defaultdict(list)
    for q in qs:
        if len(_norm(q['texto'])) > 120:
            por_texto[_norm(q['texto'])].append(q['id'])
    for q in qs:
        motivos = list(q['problemas'])
        if ids[q['id']] > 1:
            motivos.append('ID repetido')
        if not q['imagens']:
            motivos.append('sem recorte')
        if q['gabarito'] not in ('A', 'B', 'C', 'D', 'E', 'ANULADA'):
            motivos.append('gabarito inválido')
        if not q['texto'] or len(q['texto']) < 40:
            motivos.append('enunciado não extraído')
        if q.get('gabarito_conferencia') == 'posicao' and q['gabarito'] != 'ANULADA':
            motivos.append('gabarito confirmado por uma só leitura')
        dup = [i for i in por_texto.get(_norm(q['texto']), []) if i != q['id']]
        if dup and dup[0] < q['id']:
            motivos.append(f'duplicata de {dup[0]}')
        dec = revisao.get(q['id'])
        if q['gabarito'] == 'ANULADA':
            q['status'] = 'anulado'
        elif dec and dec.get('decisao') == 'rejeitar':
            q['status'] = 'rejeitado'
            motivos.append('reprovada na conferência manual: ' + dec.get('nota', ''))
        elif dec and dec.get('decisao') == 'aprovar' and not any(m.startswith(('ID repetido', 'sem recorte', 'gabarito inválido', 'duplicata')) for m in motivos):
            q['status'] = 'validado'
        elif not q['imagens'] or q['gabarito'] is None:
            q['status'] = 'rejeitado' if not q['imagens'] else 'pendente'
        else:
            q['status'] = 'pendente' if motivos else 'validado'
        q['motivos'] = sorted(set(motivos))
        q['conferencia'] = 'visual' if dec else 'automatica'
    return qs


def publicar() -> str:
    revisao = json.loads(REVISAO.read_text()) if REVISAO.exists() else {}
    qs = classificar(_todas(), revisao)

    # Recortes públicos = somente questões validadas (sincroniza a pasta)
    validas = [q for q in qs if q['status'] == 'validado']
    manter = {im['src'] for q in validas for im in q['imagens']}
    if SAIDA_IMG.exists():
        for f in SAIDA_IMG.rglob('*.webp'):
            if str(f.relative_to(SAIDA_IMG)) not in manter:
                f.unlink()
    for src in manter:
        de, para = RECORTES / src, SAIDA_IMG / src
        if not para.exists() or para.stat().st_size != de.stat().st_size:
            para.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(de, para)

    SAIDA_DADOS.mkdir(parents=True, exist_ok=True)
    resumo = {}
    for area in AREAS:
        itens = [{
            'id': q['id'], 'ano': q['ano'], 'n': q['numero'], 'l': q['lingua'], 'g': q['gabarito'],
            'img': [[im['src'], im['w'], im['h']] for im in q['imagens']], 'txt': q['texto'],
        } for q in validas if q['area'] == area]
        corpo = json.dumps(itens, ensure_ascii=False, separators=(',', ':'))
        (SAIDA_DADOS / f'{area}.json').write_text(corpo)
        resumo[area] = {
            'total': len(itens),
            'ingles': sum(1 for i in itens if i['l'] == 'ingles'),
            'espanhol': sum(1 for i in itens if i['l'] == 'espanhol'),
            'anos': dict(sorted(Counter(i['ano'] for i in itens).items())),
            'hash': hashlib.sha256(corpo.encode()).hexdigest()[:12],
        }
    (SAIDA_DADOS / 'indice.json').write_text(json.dumps({'areas': resumo, 'anos': ANOS}, ensure_ascii=False, separators=(',', ':')))

    # Relatório compacto por ano/área/status + lista de pendências (arquivo, não terminal)
    tab = defaultdict(Counter)
    for q in qs:
        tab[f"{q['ano']}-{q['area']}"][q['status']] += 1
    pend = [{'id': q['id'], 'status': q['status'], 'motivos': q['motivos'], 'paginas': q['paginas']}
            for q in qs if q['status'] != 'validado']
    RELATORIO.write_text(json.dumps({'por_ano_area': {k: dict(v) for k, v in sorted(tab.items())},
                                     'totais': dict(Counter(q['status'] for q in qs)),
                                     'nao_publicadas': pend}, ensure_ascii=False, indent=1))
    tot = Counter(q['status'] for q in qs)
    return (f"Registros: {len(qs)} | " + ', '.join(f'{k}: {v}' for k, v in tot.most_common())
            + ' | Publicadas por área: ' + ', '.join(f"{a} {resumo[a]['total']}" for a in AREAS))
