import type { Pregunta, Opcion } from '@/stores/useTestStore'

// Inserta saltos antes de "n." y de "a) b) c) d)" aunque vayan en la misma línea
function normalizeForBlocks(raw: string): string {
  return raw.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n')
}

export function parseExamen(text: string): Pregunta[] {
  const clean = normalizeForBlocks(text)

  // Solo se consideran preguntas los numerales al comienzo de una línea;
  // así no convertimos referencias como "artículos 52." en preguntas nuevas.
  const bloques = clean.split(/(?=\n\s*\d{1,3}[\.\)]\s+)/g)
  const preguntas: Pregunta[] = []

  for (const bloque of bloques) {
    const mId = bloque.match(/^\s*(\d{1,3})[\.\)]\s+([\s\S]*)$/)
    if (!mId) continue
    const id = `Q${mId[1]}`
    const resto = mId[2] ?? ''

    // enunciado: hasta la primera opción (a)/A))
    const firstOpt = resto.search(/(?:^|\n|\s)([A-Da-d])[\)\.\-]\s+/)
    const enunciado = (firstOpt >= 0 ? resto.slice(0, firstOpt) : resto).trim()

    // opciones: tolerante con may/min y separaciones en la misma línea
    const opRegex = /(?:^|\n|\s)([A-Da-d])[\)\.\-]\s+([\s\S]*?)(?=(?:\n?\s*[A-Da-d][\)\.\-]\s+)|$)/g
    const opciones: Partial<Record<Opcion, string>> = {}
    let mm: RegExpExecArray | null
    while ((mm = opRegex.exec(resto)) !== null) {
      const key = mm[1].toUpperCase() as Opcion
      const val = (mm[2] ?? '').trim()
      if (!opciones[key]) opciones[key] = val.replace(/\s+/g, ' ').trim()
    }
    const faltantes = (['A', 'B', 'C', 'D'] as Opcion[]).filter(k => !opciones[k])
    preguntas.push({
      id, enunciado, opciones: opciones as Record<Opcion, string>,
      estado: faltantes.length ? 'pendiente' : 'valida',
      advertencias: faltantes.length ? [`Faltan opciones: ${faltantes.join(', ')}`] : undefined,
    })
  }
  return preguntas
}

export function parseClave(text: string): Record<string, Opcion> {
  const t = normalizeForBlocks(text)
  const res: Record<string, Opcion> = {}

  // líneas tipo "1. a" o "1 a" o "1) d" (ignora ANULADA)
  for (const ln of t.split(/\n/)) {
    const m = ln.match(/^\s*(\d{1,3})\s*[\.\)]?\s*(ANULADA|[A-Da-d])\b/i)
    if (!m) continue
    if (/ANULADA/i.test(m[2])) continue
    res[`Q${m[1]}`] = m[2].toUpperCase() as Opcion
  }

  // por si vienen “en línea” (1 a 2 d 3 b …)
  if (Object.keys(res).length === 0) {
    const inline = t.match(/(\d{1,3})\s*[\.\)]?\s*(?:ANULADA|[A-Da-d])/gi) || []
    for (const pair of inline) {
      const mm = pair.match(/(\d{1,3})\s*[\.\)]?\s*([A-Da-d])/i)
      if (mm) res[`Q${mm[1]}`] = mm[2].toUpperCase() as Opcion
    }
  }
  return res
}

export function fusionar(pregs: Pregunta[], key: Record<string, Opcion>) {
  return pregs.map(p => ({ ...p, correcta: key[p.id] }))
}
