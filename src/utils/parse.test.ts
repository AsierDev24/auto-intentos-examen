import { describe, expect, it } from 'vitest'
import { parseExamen } from './parse'

describe('parseExamen', () => {
  it('conserva las cuatro opciones aunque estén en líneas consecutivas', () => {
    const result = parseExamen(`Pregunta previa\n2. La suspensión de los derechos y libertades se encuentra regulada en la CE en:\nA) En el Capítulo III del Título I.\nB) En sus artículos 52 y 53.\nC) En el artículo 58.\nD) En el Capítulo V del Título I.`)
    expect(result).toHaveLength(1)
    expect(result[0].opciones).toEqual({
      A: 'En el Capítulo III del Título I.',
      B: 'En sus artículos 52 y 53.',
      C: 'En el artículo 58.',
      D: 'En el Capítulo V del Título I.',
    })
    expect(result[0].estado).toBe('valida')
  })

  it('no descarta preguntas incompletas y las marca para revisión', () => {
    const result = parseExamen('2. Enunciado\nA) Primera\nB) Segunda')
    expect(result).toHaveLength(1)
    expect(result[0].estado).toBe('pendiente')
    expect(result[0].advertencias).toEqual(['Faltan opciones: C, D'])
  })
})
