<template>
  <section class="page-heading">
    <div><span class="eyebrow">Tu espacio de estudio</span><h1>Mis exámenes</h1><p class="subtitle">Guarda tus convocatorias y vuelve a ellas cuando quieras.</p></div>
    <RouterLink to="/cargar"><button>+ Importar examen</button></RouterLink>
  </section>
  <div v-if="!store.biblioteca.length" class="card empty-library"><div class="section-icon">▤</div><h2>Tu biblioteca está vacía</h2><p class="muted">Importa un PDF de preguntas y su plantilla para crear tu primer banco.</p><RouterLink to="/cargar"><button>Importar mi primer examen</button></RouterLink></div>
  <template v-else>
    <div class="library-toolbar card"><label><input type="checkbox" v-model="modoUltra" /> Crear ultraexamen con la selección</label><button v-if="modoUltra" :disabled="seleccionados.length < 2" @click="ultra">Generar ultraexamen</button><span class="muted">{{ store.biblioteca.length }} bancos guardados</span></div>
    <div class="library-grid">
      <article v-for="exam in store.examenesDisponibles" :key="exam.id" class="card exam-card">
        <div class="exam-card-top"><span class="badge">{{ exam.preguntas.length }} preguntas</span><input v-if="modoUltra" v-model="seleccionados" type="checkbox" :value="exam.id" aria-label="Seleccionar examen" /></div>
        <h2>{{ exam.nombre }}</h2><p class="muted">{{ exam.origen || 'Examen guardado' }}</p><small class="muted">Guardado {{ fecha(exam.fecha) }}</small>
        <div class="exam-actions"><button @click="abrir(exam.id)">Repetir</button><button class="secondary-button" @click="borrar(exam.id)">Eliminar</button></div>
      </article>
    </div>
    <div class="card study-shortcuts"><h2>Atajos de repaso</h2><p class="muted">Favoritas: {{ store.favoritas.length }} · Falladas: {{ store.falladas.length }}</p><button :disabled="!store.favoritas.length" @click="repaso">Repasar favoritas</button> <button class="secondary-button" :disabled="!store.falladas.length" @click="repasoFalladas">Repasar falladas</button> <RouterLink to="/configuracion">Configurar evaluación →</RouterLink></div>
    <div class="card podium"><h2>Tu podium</h2><div class="podium-stats"><div><strong>{{ store.historial.length }}</strong><small>intentos</small></div><div><strong>{{ store.mejorNota }}/10</strong><small>mejor nota</small></div><div><strong>{{ store.biblioteca.length }}</strong><small>bancos</small></div></div></div>
  </template>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTestStore } from '@/stores/useTestStore'
const store = useTestStore(); const router = useRouter(); const modoUltra = ref(false); const seleccionados = ref<string[]>([])
function abrir(id: string) { store.cargarExamen(id); router.push('/examen') }
function borrar(id: string) { if (confirm('¿Eliminar este examen de la biblioteca?')) store.borrarExamen(id) }
function ultra() { store.crearUltra(seleccionados.value); router.push('/examen') }
function repaso() { store.crearRepasoFavoritas(); router.push('/examen') }
function repasoFalladas() { store.crearRepasoFalladas(); router.push('/examen') }
function fecha(value: string) { return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(value)) }
</script>
