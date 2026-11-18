<template>
  <section class="page-heading">
    <div>
      <span class="eyebrow">Nuevo intento</span>
      <h1>Importa tu examen</h1>
      <p class="subtitle">Carga el examen y su plantilla de respuestas para empezar a practicar.</p>
    </div>
    <span class="badge">PDF · OCR integrado</span>
  </section>

  <div class="card">
    <div class="controls">
      <div>
        <label class="badge" for="exam-file">Examen</label>
        <input id="exam-file" type="file" accept="application/pdf" @change="onExam" />
        <small class="muted">{{ examFile?.name || 'Selecciona el PDF de preguntas' }}</small>
      </div>
      <div>
        <label class="badge" for="answers-file">Respuestas</label>
        <input id="answers-file" type="file" accept="application/pdf" @change="onAns" />
        <small class="muted">{{ ansFile?.name || 'Selecciona el PDF de respuestas' }}</small>
      </div>
      <button @click="procesar" :disabled="loading">{{ loading ? 'Procesando…' : 'Preparar examen' }}</button>
    </div>
  </div>

  <div class="log" v-if="msg">{{ msg }}</div>
  <div class="card" v-if="debug">
    <p><b>Texto del examen:</b> {{ debug.txtExLen }} caracteres</p>
    <p><b>Texto de la clave:</b> {{ debug.txtClLen }} caracteres</p>
    <p><b>Preguntas detectadas:</b> {{ debug.numPregs }}</p>
    <p><b>Preguntas listas:</b> {{ debug.numConClave }}</p>
  </div>
  <div v-if="store.banco.length" class="card import-success">
    <span class="badge">{{ store.banco.length }} preguntas cargadas</span>
    <input v-model="nombreExamen" class="library-name" placeholder="Nombre del examen" aria-label="Nombre del examen" />
    <button @click="guardar">Guardar en mi biblioteca</button>
    <RouterLink to="/examen">Ir al examen →</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { pdfToText } from '@/utils/pdf'
import { parseExamen, parseClave, fusionar } from '@/utils/parse'
import { useTestStore } from '@/stores/useTestStore'

const store = useTestStore()
const router = useRouter()
const examFile = ref<File>()
const ansFile = ref<File>()
const loading = ref(false)
const msg = ref('')
const debug = ref<{ txtExLen: number; txtClLen: number; numPregs: number; numConClave: number } | null>(null)
const nombreExamen = ref('')

function onExam(e: Event) { examFile.value = (e.target as HTMLInputElement).files?.[0] ?? undefined }
function onAns(e: Event) { ansFile.value = (e.target as HTMLInputElement).files?.[0] ?? undefined }

async function procesar() {
  msg.value = ''
  debug.value = null
  if (!examFile.value || !ansFile.value) { msg.value = 'Selecciona ambos PDFs.'; return }
  loading.value = true
  try {
    const [txtEx, txtCl] = await Promise.all([pdfToText(examFile.value), pdfToText(ansFile.value)])
    const preguntas = parseExamen(txtEx)
    const clave = parseClave(txtCl)
    const banco = fusionar(preguntas, clave).filter(p => p.correcta)
    debug.value = { txtExLen: txtEx.length, txtClLen: txtCl.length, numPregs: preguntas.length, numConClave: banco.length }
    store.prepararRevision(banco)
    msg.value = `Importación terminada: ${banco.length} preguntas detectadas. Revisa antes de comenzar.`
    nombreExamen.value = examFile.value.name.replace(/\.pdf$/i, '')
    router.push('/revision')
  } catch (e: any) {
    msg.value = `No se pudo procesar el PDF: ${e?.message ?? e}`
    console.error(e)
  } finally { loading.value = false }
}
function guardar() {
  try {
    store.guardarExamen(nombreExamen.value, examFile.value?.name)
    msg.value = '✓ Examen guardado en tu biblioteca. Puedes encontrarlo en “Mis exámenes”.'
  } catch (e: any) {
    console.error('[AutoExamen] Error guardando examen', e)
    msg.value = `No se pudo guardar el examen: ${e?.message ?? 'almacenamiento local no disponible'}`
  }
}
</script>
