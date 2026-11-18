import { defineStore } from 'pinia'
import { persistExam, removeExam } from '@/utils/persistence'

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
export type HistorialResultado = Resultado & { fecha: string; total: number; examenId?: string | null; examenNombre?: string; falladas?: string[] }
export type ExamenGuardado = { id: string; nombre: string; origen?: string; fecha: string; preguntas: Pregunta[] }

function leer<T>(clave: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(clave) || '') as T } catch { return fallback }
}
const favoriteId = (examId: string | null, pregunta: Pregunta) => `${examId || 'actual'}:${pregunta.id}`
const cloneQuestions = (preguntas: Pregunta[]): Pregunta[] => JSON.parse(JSON.stringify(preguntas)) as Pregunta[]

export const useTestStore = defineStore('test', {
  state: () => ({
    banco: [] as Pregunta[],
    revision: [] as Pregunta[],
    examenActualId: null as string | null,
    examenActualNombre: 'Examen sin guardar',
    biblioteca: leer<ExamenGuardado[]>('autoexamen-biblioteca', []),
    favoritas: leer<string[]>('autoexamen-favoritas', []),
    respuestas: {} as Record<string, Opcion | undefined>,
    entregado: false,
    resultado: null as Resultado | null,
    historial: leer<HistorialResultado[]>('autoexamen-historial', []),
    falladas: leer<string[]>('autoexamen-falladas', []),
    page: 0,                                 // 👈 página actual (0-index)
    config: {
      penalizacion: 1 / 3,                   // 👈 resta 1/3 por fallo
      puntosAcierto: 1,
      puntosBlanco: 0,
      preguntasBase: 100,
      pageSize: 10,                           // 👈 5 preguntas por página
      modoOscuro: localStorage.getItem('autoexamen-dark-mode') === 'true',
      ...leer<Partial<{ penalizacion: number; puntosAcierto: number; puntosBlanco: number; pageSize: number; modoOscuro: boolean }>>('autoexamen-config', {}),
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
    preguntasEvaluables(): Pregunta[] {
      const normales = this.banco.filter(p => p.estado !== 'anulada' && p.estado !== 'reserva')
      const reservas = this.banco.filter(p => p.estado === 'reserva')
      const anuladas = this.banco.filter(p => p.estado === 'anulada').length
      const faltan = Math.max(0, Math.min(anuladas, this.config.preguntasBase - normales.length))
      return normales.slice(0, this.config.preguntasBase).concat(reservas.slice(0, faltan))
    },
    progresoPct(): number {
      if (!this.total) return 0
      return Math.round((this.respondidas / this.total) * 100)
    },
    mejorNota(): number {
      return this.historial.length ? Math.max(...this.historial.map(r => r.nota)) : 0
    },
    examenesDisponibles(): ExamenGuardado[] { return this.biblioteca.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)) },
    preguntasFavoritas(): Pregunta[] { return this.banco.filter(p => this.favoritas.includes(favoriteId(this.examenActualId, p))) },
  },

  actions: {
    setBanco(preguntas: Pregunta[]) {
      this.banco = preguntas
      this.examenActualId = null
      this.examenActualNombre = 'Examen importado'
      this.startExam()
    },
    prepararRevision(preguntas: Pregunta[]) { this.revision = cloneQuestions(preguntas) },
    favId(p: Pregunta) { return favoriteId(this.examenActualId, p) },
    guardarExamen(nombre: string, origen?: string) {
      const limpio = nombre.trim() || 'Examen sin nombre'
      const existente = this.examenActualId ? this.biblioteca.find(e => e.id === this.examenActualId) : undefined
      const id = existente?.id || `examen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const examen: ExamenGuardado = { id, nombre: limpio, origen, fecha: existente?.fecha || new Date().toISOString(), preguntas: cloneQuestions(this.banco) }
      this.biblioteca = [...this.biblioteca.filter(e => e.id !== examen.id), examen]
      this.examenActualId = examen.id; this.examenActualNombre = examen.nombre
      localStorage.setItem('autoexamen-biblioteca', JSON.stringify(this.biblioteca))
      void persistExam(examen).catch(error => console.error('[AutoExamen] SQLite no disponible; se mantiene la copia local', error))
      const comprobacion = localStorage.getItem('autoexamen-biblioteca')
      if (!comprobacion) throw new Error('El almacenamiento local no devolvió el examen guardado.')
    },
    cargarExamen(id: string) {
      const examen = this.biblioteca.find(e => e.id === id); if (!examen) return
      this.banco = cloneQuestions(examen.preguntas); this.examenActualId = id; this.examenActualNombre = examen.nombre; this.startExam()
    },
    borrarExamen(id: string) {
      this.biblioteca = this.biblioteca.filter(e => e.id !== id); localStorage.setItem('autoexamen-biblioteca', JSON.stringify(this.biblioteca)); void removeExam(id).catch(error => console.error('[AutoExamen] No se pudo borrar de SQLite', error))
      if (this.examenActualId === id) { this.examenActualId = null; this.banco = [] }
    },
    crearUltra(ids: string[]) {
      const seleccion = this.biblioteca.filter(e => ids.includes(e.id)); const preguntas = seleccion.flatMap(e => e.preguntas.map(p => ({ ...p, id: `${e.id}-${p.id}` })))
      this.banco = preguntas; this.examenActualId = null; this.examenActualNombre = `Ultraexamen · ${seleccion.length} bancos`; this.startExam()
    },
    crearRepasoFavoritas() {
      const preguntas = this.biblioteca.flatMap(e => e.preguntas.filter(p => this.favoritas.includes(favoriteId(e.id, p))).map(p => ({ ...p, id: `${e.id}-${p.id}` })))
      this.banco = preguntas; this.examenActualId = null; this.examenActualNombre = 'Repaso de favoritas'; this.startExam()
    },
    crearRepasoFalladas() {
      const preguntas = this.biblioteca.flatMap(e => e.preguntas.filter(p => this.falladas.includes(favoriteId(e.id, p))).map(p => ({ ...p, id: `${e.id}-${p.id}` })))
      this.banco = preguntas; this.examenActualId = null; this.examenActualNombre = 'Repaso de falladas'; this.startExam()
    },
    alternarFavorita(pregunta: Pregunta) {
      const id = this.favId(pregunta); this.favoritas = this.favoritas.includes(id) ? this.favoritas.filter(x => x !== id) : [...this.favoritas, id]; localStorage.setItem('autoexamen-favoritas', JSON.stringify(this.favoritas))
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
      let ac = 0, fa = 0, bl = 0; const falladasAhora: string[] = []
      for (const p of this.preguntasEvaluables) {
        const r = this.respuestas[p.id]
        if (!r) { bl++; continue }
        if (r === p.correcta) ac++
        else { fa++; falladasAhora.push(favoriteId(this.examenActualId, p)) }
      }
      const totalEvaluado = Math.max(1, this.preguntasEvaluables.length)
      const nota = Math.max(0, ((ac * this.config.puntosAcierto - pen * fa + this.config.puntosBlanco * bl) / totalEvaluado) * 10)
      this.resultado = { aciertos: ac, fallos: fa, blancos: bl, nota: +nota.toFixed(2) }
      this.falladas = [...new Set([...this.falladas, ...falladasAhora])]
      localStorage.setItem('autoexamen-falladas', JSON.stringify(this.falladas))
      this.historial.unshift({ ...this.resultado, total: totalEvaluado, fecha: new Date().toISOString(), examenId: this.examenActualId, examenNombre: this.examenActualNombre, falladas: falladasAhora })
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
