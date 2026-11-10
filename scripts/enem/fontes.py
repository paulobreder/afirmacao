from __future__ import annotations
"""DESCOBERTA E DOWNLOAD — localiza na página oficial do Inep a prova e o gabarito
da aplicação regular impressa de cada dia e baixa os PDFs (com cache por hash).

Escolha de caderno: primeiro dia caderno 1 (azul), segundo dia caderno 7 (azul).
Qualquer caderno regular serve, desde que prova e gabarito sejam do MESMO caderno.
"""
import hashlib
import json
import re
import subprocess
from pathlib import Path

from comum import CACHE, ANOS, log

PAGINA = 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/{ano}'
UA = {'User-Agent': 'Mozilla/5.0 (pipeline educacional AfirmAcao)'}
CADERNO = {1: 1, 2: 7}
COR = {1: 'azul', 2: 'azul'}


def _get(url: str, timeout=90) -> bytes:
    # curl em vez de urllib: o servidor do Inep recusa o handshake TLS do Python do sistema
    for tentativa in range(3):
        r = subprocess.run(['curl', '-sSL', '--fail', '-m', str(timeout), '-A', UA['User-Agent'], url], capture_output=True)
        if r.returncode == 0:
            return r.stdout
    raise RuntimeError(f'falha ao baixar {url}: {r.stderr.decode()[:200]}')


def _links(ano: int) -> list[str]:
    destino = CACHE / str(ano) / 'pagina.html'
    if not destino.exists():
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_bytes(_get(PAGINA.format(ano=ano)))
    html = destino.read_text('utf-8', 'ignore')
    return sorted(set(u.replace('http://', 'https://') for u in re.findall(r'https?://download\.inep\.gov\.br[^"\s<>]+?\.pdf', html, re.I)))


def _escolher(links: list[str], ano: int, dia: int, tipo: str) -> str | None:
    cd = CADERNO[dia]
    exato = re.compile(rf'/{ano}_{tipo}_impresso_D{dia}_CD{cd}\.pdf$', re.I)
    for u in links:
        if exato.search(u):
            return u
    if tipo == 'PV':
        return None
    # Gabaritos antigos (2016–2019) usam nomes por caderno ou por cor/dia
    for u in links:
        if re.search(rf'/cad_{cd}_gabarito_', u, re.I):
            return u
    cor = COR[dia]
    candidatos = [u for u in links if 'gab' in u.lower() and cor in u.lower()
                  and re.search(rf'dia_?{dia}|{dia}_dia|dia{dia}', u.lower())
                  and not re.search(r'ppl|reaplic|_p2_|_2\.pdf|enem2017_2', u.lower())]
    if not candidatos:  # 2017: o único gabarito publicado na página é o do caderno azul
        candidatos = [u for u in links if 'gab' in u.lower() and cor in u.lower()
                      and re.search(rf'dia_?{dia}|dia{dia}', u.lower()) and 'ppl' not in u.lower()]
    return candidatos[0] if candidatos else None


def descobrir(ano: int) -> dict:
    links = _links(ano)
    m = {'ano': ano, 'dias': {}}
    for dia in (1, 2):
        m['dias'][str(dia)] = {
            'caderno': CADERNO[dia],
            'prova': _escolher(links, ano, dia, 'PV'),
            'gabarito': _escolher(links, ano, dia, 'GB'),
        }
    (CACHE / str(ano) / 'fontes.json').write_text(json.dumps(m, indent=1, ensure_ascii=False))
    return m


def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def baixar(ano: int) -> dict:
    m = descobrir(ano)
    for dia, d in m['dias'].items():
        for chave in ('prova', 'gabarito'):
            url = d[chave]
            if not url:
                log(f'{ano} D{dia}: {chave} não encontrado na página oficial')
                continue
            alvo = CACHE / str(ano) / f'D{dia}_{chave}.pdf'
            meta = alvo.with_suffix('.json')
            if alvo.exists() and meta.exists():
                info = json.loads(meta.read_text())
                if info.get('url') == url and info.get('sha256') == sha256(alvo):
                    d[chave + '_sha256'] = info['sha256']
                    continue  # já baixado e íntegro
            dados = _get(url, timeout=300)
            if not dados.startswith(b'%PDF'):
                raise RuntimeError(f'{url} não retornou um PDF')
            alvo.write_bytes(dados)
            info = {'url': url, 'sha256': hashlib.sha256(dados).hexdigest(), 'bytes': len(dados)}
            meta.write_text(json.dumps(info))
            d[chave + '_sha256'] = info['sha256']
            log(f'{ano} D{dia}: {chave} baixado ({len(dados) // 1024} KB)')
    (CACHE / str(ano) / 'fontes.json').write_text(json.dumps(m, indent=1, ensure_ascii=False))
    return m


if __name__ == '__main__':
    for a in ANOS:
        print(a, json.dumps({k: (v['prova'] or '-').split('/')[-1] + ' | ' + (v['gabarito'] or '-').split('/')[-1] for k, v in descobrir(a)['dias'].items()}))
