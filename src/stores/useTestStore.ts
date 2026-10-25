import { defineStore } from 'pinia'

export type Opcion = 'A' | 'B' | 'C' | 'D'
export type Pregunta = {
  id: string
  enunciado: string
  opciones: Record<Opcion, string>
  correcta?: Opcion
  estado?: 'valida' | 'pendiente' | 'anulada' | 'reserva'
  advertencias?: string[]
}
export type Resultado = {
  aciertos: number
  fallos: number
  blancos: number
  nota: number
}
export type HistorialResultado = Resultado & { fecha: string; total: number }

export const useTestStore = defineStore('test', {
  state: () => ({
    banco: [] as Pregunta[],
    respuestas: {} as Record<string, Opcion | undefined>,
    entregado: false,
    resultado: null as Resultado | null,
    historial: JSON.parse(localStorage.getItem('autoexamen-historial') || '[]') as HistorialResultado[],
    page: 0,                                 // 👈 página actual (0-index)
    config: {
      penalizacion: 1 / 3,                   // 👈 resta 1/3 por fallo
      pageSize: 10,                           // 👈 5 preguntas por página
      modoOscuro: localStorage.getItem('autoexamen-dark-mode') === 'true',
    },
  }),

  getters: {
    total: (s) => s.banco.length,
    respondidas: (s) => Object.values(s.respuestas).filter(Boolean).length,
    totalPages(): number {
      if (!this.total) return 1
      return Math.ceil(this.total / this.config.pageSize)
    },
    pageStart(): number {
      return this.page * this.config.pageSize
    },
    pageEnd(): number {
      return Math.min(this.pageStart + this.config.pageSize, this.total)
    },
    pageQuestions(): Pregunta[] {
      return this.banco.slice(this.pageStart, this.pageEnd)
    },
    progresoPct(): number {
      if (!this.total) return 0
      return Math.round((this.respondidas / this.total) * 100)
    },
    mejorNota(): number {
      return this.historial.length ? Math.max(...this.historial.map(r => r.nota)) : 0
    },
  },

  actions: {
    setBanco(preguntas: Pregunta[]) {
      this.banco = preguntas
      this.startExam()
    },
    startExam() {
      this.respuestas = {}
      this.entregado = false
      this.resultado = null
      this.page = 0
    },
    marcar(id: string, valor: Opcion) {
      if (this.entregado) return
      this.respuestas[id] = valor
    },
    nextPage() {
      if (this.page < this.totalPages - 1) this.page++
    },
    prevPage() {
      if (this.page > 0) this.page--
    },
    corregir(penal?: number) {
      const pen = penal ?? this.config.penalizacion
      let ac = 0, fa = 0, bl = 0
      for (const p of this.banco) {
        const r = this.respuestas[p.id]
        if (!r) { bl++; continue }
        if (r === p.correcta) ac++
        else fa++
      }
      const nota = Math.max(0, ((ac - pen * fa) / this.banco.length) * 10)
      this.resultado = { aciertos: ac, fallos: fa, blancos: bl, nota: +nota.toFixed(2) }
      this.historial.unshift({ ...this.resultado, total: this.banco.length, fecha: new Date().toISOString() })
      localStorage.setItem('autoexamen-historial', JSON.stringify(this.historial.slice(0, 50)))
      this.entregado = true
    },
    limpiarHistorial() {
      this.historial = []
      localStorage.removeItem('autoexamen-historial')
    },
    reset() { this.startExam() },
  },
})
