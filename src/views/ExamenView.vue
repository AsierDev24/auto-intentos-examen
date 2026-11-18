<template>
  <section class="page-heading compact-heading">
    <div><span class="eyebrow">Sesión de estudio</span><h1>{{ store.examenActualNombre }}</h1><p class="subtitle">Responde a tu ritmo. Tus avances quedan asociados a este intento.</p></div>
    <RouterLink to="/biblioteca">← Biblioteca</RouterLink>
  </section>

  <!-- Barra superior -->
  <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap:16px;">
    <div>
      <div style="font-weight:700;">Página {{ store.page + 1 }} / {{ store.totalPages }}</div>
      <div style="font-size:.9rem; opacity:.8;">Progreso global: {{ store.progresoPct }}%</div>
    </div>

    <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
      <span class="badge">{{ store.respondidas }} respondidas</span>
      <button @click="store.prevPage()" :disabled="store.page===0">← Anterior</button>
      <button @click="store.nextPage()" :disabled="store.page>=store.totalPages-1">Siguiente →</button>
      <button v-if="!store.entregado" @click="store.corregir()" :disabled="!store.total">Entregar y corregir</button>
      <RouterLink v-else to="/resultados"><button>Ver resultados</button></RouterLink>
    </div>
  </div>

  <!-- Bloque de 5 preguntas -->
  <div v-if="store.pageQuestions.length" class="card">
    <div v-for="(p, idx) in store.pageQuestions" :key="p.id" class="pregunta">
      <div class="question-line"><span class="question-number">{{ store.pageStart + idx + 1 }}</span><button class="favorite-button" type="button" :aria-label="esFavorita(p) ? 'Quitar favorita' : 'Marcar favorita'" @click="store.alternarFavorita(p)">{{ esFavorita(p) ? '★' : '☆' }}</button></div>
      <p style="margin:0 0 8px; font-weight:700;">
        {{ p.enunciado }}
      </p>

      <div class="opc">
        <label v-for="(txt, letra) in p.opciones"
               :key="letra"
               :class="claseOpcion(p.id, letra as any, p.correcta)">
          <input type="radio"
                 :name="p.id"
                 :value="letra"
                 :disabled="store.entregado"
                 v-model="store.respuestas[p.id]" />
          {{ letra }}) {{ txt }}
        </label>
      </div>
    </div>
  </div>

  <div v-else class="card">
    No hay preguntas cargadas. Ve a <RouterLink to="/cargar">Cargar</RouterLink>.
  </div>

  <div v-if="store.entregado && store.resultado" class="card" style="display:flex; gap:18px; align-items:center; flex-wrap:wrap;">
    <span class="badge">Aciertos: {{ store.resultado.aciertos }}</span>
    <span class="badge" style="background:#ef4444;">Fallos: {{ store.resultado.fallos }}</span>
    <span class="badge" style="background:#6b7280;">Blancos: {{ store.resultado.blancos }}</span>
    <span class="badge" style="background:#22c55e;">Nota: {{ store.resultado.nota }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Opcion } from '@/stores/useTestStore'
import { useTestStore } from '@/stores/useTestStore'
const store = useTestStore()

function claseOpcion(qid: string, letra: Opcion, correcta?: Opcion) {
  if (!store.entregado) return ''
  const marcada = store.respuestas[qid]
  if (letra === correcta && marcada === correcta) return 'ok'    // acertada
  if (letra === correcta && marcada !== correcta) return 'sol'   // solución
  if (letra === marcada && marcada !== correcta) return 'bad'    // tu error
  return ''
}
function esFavorita(p: ReturnType<typeof useTestStore>['banco'][number]) { return store.favoritas.includes(store.favId(p)) }
</script>

<style scoped>
.ok  { background: rgba(34,197,94,.15); border: 1px solid rgba(34,197,94,.35); border-radius:8px; padding:4px 8px; }
.bad { background: rgba(239,68,68,.15); border: 1px solid rgba(239,68,68,.35); border-radius:8px; padding:4px 8px; }
.sol { background: rgba(59,130,246,.15); border: 1px solid rgba(59,130,246,.35); border-radius:8px; padding:4px 8px; }
.question-line { display: flex; align-items: center; gap: 8px; color: var(--primary); font-weight: 800; }
.favorite-button { padding: 2px 7px; color: var(--primary); background: transparent; box-shadow: none; font-size: 1.25rem; }
.favorite-button:hover { background: var(--surface-soft); box-shadow: none; }
</style>
