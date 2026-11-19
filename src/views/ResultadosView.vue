<template>
  <section class="page-heading compact-heading">
    <div>
      <span class="eyebrow">Resumen del intento</span>
      <h1>Tu resultado</h1>
      <p class="subtitle">Revisa tu rendimiento y sigue mejorando.</p>
    </div>
    <span v-if="store.historial.length" class="badge">Mejor nota: {{ store.mejorNota }}/10</span>
  </section>

  <div v-if="store.resultado" class="card result-card">
    <div class="score-circle">{{ store.resultado.nota }}<small>/10</small></div>
    <div>
      <h2>Intento completado</h2>
      <p class="muted">{{ store.resultado.aciertos }} aciertos de {{ store.resultado.total }} preguntas evaluadas.</p>
    </div>
    <div class="result-stats">
      <span class="badge">✓ {{ store.resultado.aciertos }} aciertos</span>
      <span class="badge danger-badge">× {{ store.resultado.fallos }} fallos</span>
      <span class="badge neutral-badge">— {{ store.resultado.blancos }} blancos</span>
    </div>
    <div class="result-actions">
      <RouterLink to="/examen"><button>Revisar respuestas</button></RouterLink>
      <button class="secondary-button" @click="store.reset()">Reiniciar intento</button>
    </div>
  </div>
  <div v-else class="card">Aún no has corregido este intento. Ve a <RouterLink to="/examen">Mi examen</RouterLink>.</div>

  <section v-if="store.historial.length" class="history-section">
    <div class="section-header">
      <div><span class="eyebrow">Seguimiento</span><h2>Historial de puntuaciones</h2></div>
      <button class="secondary-button" @click="store.limpiarHistorial">Borrar historial</button>
    </div>
    <div class="card history-card">
      <div v-for="(item, index) in store.historial" :key="`${item.fecha}-${index}`" class="history-row">
        <div><b>Intento {{ store.historial.length - index }}</b><small>{{ formatearFecha(item.fecha) }}</small></div>
        <span class="muted">{{ item.aciertos }}/{{ item.total }} aciertos</span>
        <strong>{{ item.nota }}/10</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useTestStore } from '@/stores/useTestStore'

const store = useTestStore()

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(fecha))
}
</script>

<style scoped>
.result-card { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 18px; }
.score-circle { display: grid; place-items: center; width: 108px; height: 108px; color: var(--primary); border: 8px solid var(--surface-soft); border-radius: 50%; font-size: 1.8rem; font-weight: 850; }
.score-circle small { font-size: .75rem; margin-left: 2px; }
.result-stats, .result-actions { grid-column: 1 / -1; display: flex; gap: 9px; flex-wrap: wrap; }
.danger-badge { color: var(--danger); background: var(--danger-soft); }
.neutral-badge { color: var(--muted); background: var(--neutral-soft); }
.secondary-button { color: var(--text); background: var(--secondary); box-shadow: none; }
.history-section { margin-top: 42px; }
.section-header { display: flex; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: 14px; }
.section-header h2 { margin: 0; font-size: 1.5rem; }
.history-card { padding: 8px 20px; }
.history-row { display: grid; grid-template-columns: 1fr 1fr auto; align-items: center; gap: 16px; padding: 15px 0; border-bottom: 1px solid var(--border); }
.history-row:last-child { border-bottom: 0; }
.history-row small { display: block; color: var(--muted); font-size: .78rem; }
.history-row strong { color: var(--primary); font-size: 1.1rem; }
@media (max-width: 600px) { .result-card { grid-template-columns: 1fr; } .history-row { grid-template-columns: 1fr auto; } .history-row .muted { grid-column: 1; } .section-header { align-items: flex-start; flex-direction: column; } }
</style>
