// src/utils/pdf.ts
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.mjs'
import { createWorker as _createWorker, type Worker } from 'tesseract.js'

const OCR_WORKER = new URL('tesseract.js/dist/worker.min.js', import.meta.url).toString()
const OCR_CORE = new URL('tesseract.js-core/tesseract-core-lstm.wasm.js', import.meta.url).toString()
// Los modelos se sirven desde public/tesseract-data y se copian al bundle final.
// Se resuelve contra el origen local de Vite/Tauri, nunca contra Internet.
const OCR_LANG = new URL('tesseract-data/', window.location.href).toString()
let ocrWorker: Worker | null = null

// Worker de pdf.js para Vite
;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

export async function pdfToText(file: File, onProgress?: (value: number) => void): Promise<string> {
  const buf = await file.arrayBuffer()
  const pdf = await (pdfjsLib as any).getDocument({ data: buf }).promise

  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = (content.items as any[]).map((it: any) => it.str).join(' ')

    if (pageText.trim().length > 10) {
      // Texto seleccionable
      text += `\n[PAGE ${i}]\n${pageText}\n`
    } else {
      // OCR fallback
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = viewport.width
      canvas.height = viewport.height
      await (page as any).render({ canvasContext: ctx, viewport } as any).promise

      // 👇 cast a any para permitir logger sin que TS se queje
      const createWorker: any = _createWorker as any
      ocrWorker ??= await createWorker('spa+eng', 1, {
        workerPath: OCR_WORKER, corePath: OCR_CORE, langPath: OCR_LANG,
        logger: (m: any) => {
          if (m.status === 'recognizing text') onProgress?.(((i - 1) + (m.progress || 0)) / pdf.numPages)
        }
      })
      const worker = ocrWorker
      if (!worker) throw new Error('No se pudo iniciar el motor OCR local.')
      const { data } = await worker.recognize(canvas)

      text += `\n[PAGE ${i} OCR]\n${data.text}\n`
    }
  }
  return text
}

export async function disposePdfResources(): Promise<void> {
  await ocrWorker?.terminate()
  ocrWorker = null
}
