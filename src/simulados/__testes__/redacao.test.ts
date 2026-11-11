import { describe, expect, it } from 'vitest'
import { EIXOS, sortearTema, TEMAS } from '../redacao/temas'
import { analisar, estimarLinhas } from '../redacao/analise'
import { rng } from '../sorteio'
import { normalizar } from '../../lib/format'

const EIXOS_EXIGIDOS = [
  'Educação', 'Tecnologia', 'Inteligência artificial', 'Desigualdade', 'Saúde', 'Saúde mental', 'Cidadania', 'Direitos humanos',
  'Meio ambiente', 'Trabalho', 'Cultura', 'Mobilidade', 'Inclusão digital', 'Comunicação', 'Desinformação', 'Sustentabilidade',
  'Envelhecimento', 'Infância e adolescência',
]

describe('banco de 100 temas', () => {
  it('tem exatamente 100 temas com IDs e títulos únicos', () => {
    expect(TEMAS).toHaveLength(100)
    expect(new Set(TEMAS.map((t) => t.id)).size).toBe(100)
    expect(new Set(TEMAS.map((t) => normalizar(t.titulo))).size).toBe(100)
    expect(TEMAS.map((t) => t.id)).toEqual(Array.from({ length: 100 }, (_, i) => `T${String(i + 1).padStart(3, '0')}`))
  })
  it('cada tema tem todos os campos preenchidos', () => {
    for (const t of TEMAS) {
      expect(t.titulo.length, t.id).toBeGreaterThan(20)
      expect(t.contexto.length, t.id).toBeGreaterThan(60)
      expect(t.proposta, t.id).toContain(t.titulo)
      expect(t.palavrasChave.length, t.id).toBeGreaterThanOrEqual(3)
      expect(EIXOS_EXIGIDOS, t.id).toContain(t.eixo)
    }
  })
  it('cobre todos os eixos exigidos de forma equilibrada', () => {
    expect(EIXOS.sort()).toEqual([...EIXOS_EXIGIDOS].sort())
    for (const e of EIXOS) {
      const n = TEMAS.filter((t) => t.eixo === e).length
      expect(n, e).toBeGreaterThanOrEqual(5)
      expect(n, e).toBeLessThanOrEqual(6)
    }
  })
  it('não tem contextualizações duplicadas', () => {
    expect(new Set(TEMAS.map((t) => normalizar(t.contexto))).size).toBe(100)
  })
  it('sorteia respeitando o eixo e evitando temas recentes', () => {
    const recentes = TEMAS.filter((t) => t.eixo === 'Saúde').slice(0, 5).map((t) => t.id)
    for (let s = 0; s < 20; s++) {
      const t = sortearTema({ eixo: 'Saúde', recentes, aleatorio: rng(s) })
      expect(t.eixo).toBe('Saúde')
      expect(recentes).not.toContain(t.id)
    }
    // todos usados recentemente: ainda sorteia (ilimitado)
    expect(sortearTema({ eixo: 'Saúde', recentes: TEMAS.map((t) => t.id) }).eixo).toBe('Saúde')
  })
})

const TEXTO = `Na sociedade contemporânea, a exclusão digital ainda limita o acesso de muitos estudantes à educação. Nesse sentido, é preciso discutir suas causas.

Em primeiro lugar, a falta de conectividade nas escolas públicas impede o uso de recursos digitais. Além disso, muitas famílias não possuem equipamentos adequados.

Por outro lado, a formação docente para o uso pedagógico das tecnologias ainda é insuficiente. Dessa forma, mesmo onde há internet, o potencial dela é pouco explorado.

Portanto, cabe ao Ministério da Educação ampliar a conectividade das escolas, por meio de parcerias com estados e municípios, a fim de garantir o direito à educação.`

describe('análise determinística de redação', () => {
  it('conta palavras, parágrafos e estima linhas', () => {
    const a = analisar(TEXTO, ['exclusão digital', 'conectividade', 'educação'])
    expect(a.paragrafos).toHaveLength(4)
    expect(a.palavras).toBeGreaterThan(80)
    expect(a.linhasEstimadas).toBe(estimarLinhas(TEXTO))
    expect(a.linhasEstimadas).toBeGreaterThanOrEqual(8)
  })
  it('uma redação de tamanho real (cerca de 390 palavras em 5 parágrafos) cabe nas 30 linhas estimadas', () => {
    const par = Array.from({ length: 78 }, (_, i) => `palavra${i}`).join(' ') + '.'
    const real = Array.from({ length: 5 }, () => par).join('\n\n')
    expect(analisar(real).palavras).toBe(390)
    expect(estimarLinhas(real)).toBeLessThanOrEqual(30)
    expect(analisar(real).avisos.some((a) => a.criterio === 'Extensão')).toBe(false)
  })
  it('identifica conectivos por categoria e marcas da proposta de intervenção', () => {
    const a = analisar(TEXTO)
    expect(a.conectivos.porCategoria['Oposição']).toContain('por outro lado')
    expect(a.conectivos.porCategoria['Consequência']).toEqual(expect.arrayContaining(['portanto', 'dessa forma']))
    expect(a.intervencao.agente).toContain('ministério')
    expect(a.intervencao.meio).toContain('por meio de')
    expect(a.intervencao.finalidade).toContain('a fim de')
  })
  it('marca palavras-chave presentes sem julgar o tema', () => {
    const a = analisar(TEXTO, ['conectividade', 'inteligência artificial'])
    expect(a.palavrasChave).toEqual([
      { termo: 'conectividade', presente: true },
      { termo: 'inteligência artificial', presente: false },
    ])
  })
  it('aponta desvios verificáveis: grafia, oralidade, pontuação e extensão', () => {
    const a = analisar('derrepente vc chega ,e não entende nada!! concerteza')
    const msgs = a.avisos.map((x) => x.mensagem).join(' | ')
    expect(a.grafias.map((g) => g.escrito)).toEqual(expect.arrayContaining(['derrepente', 'concerteza']))
    expect(a.oralidade).toContain('vc')
    expect(msgs).toMatch(/Espaço antes de sinal/)
    expect(msgs).toMatch(/repetidos/)
    expect(msgs).toMatch(/nota zero/)
  })
  it('detecta repetição excessiva', () => {
    const a = analisar('A tecnologia muda tudo. A tecnologia cria. A tecnologia ajuda. A tecnologia exclui. A tecnologia une.')
    expect(a.repeticoes[0]).toEqual({ palavra: 'tecnologia', vezes: 5 })
  })
  it('não produz nota numérica', () => {
    const a = analisar(TEXTO) as unknown as Record<string, unknown>
    expect(Object.keys(a).some((k) => /nota|score|pontua/i.test(k))).toBe(false)
  })
})
