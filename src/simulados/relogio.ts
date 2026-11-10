/** Acumulador de tempo efetivo (puro, testável): só conta entre iniciar() e pausar(). */
export class TempoEfetivo {
  private acumulado: number
  private marco: number | null = null
  constructor(inicialMs = 0) {
    this.acumulado = inicialMs
  }
  get rodando() {
    return this.marco !== null
  }
  iniciar(agora: number) {
    if (this.marco === null) this.marco = agora
  }
  pausar(agora: number) {
    if (this.marco !== null) {
      this.acumulado += Math.max(0, agora - this.marco)
      this.marco = null
    }
    return this.acumulado
  }
  valor(agora: number) {
    return this.acumulado + (this.marco !== null ? Math.max(0, agora - this.marco) : 0)
  }
}
