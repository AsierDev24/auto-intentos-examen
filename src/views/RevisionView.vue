<template>
  <section class="page-heading compact-heading"><div><span class="eyebrow">Antes de empezar</span><h1>Revisa tu importación</h1><p class="subtitle">Comprueba las preguntas detectadas y corrige cualquier dato dudoso.</p></div><span class="badge">{{ store.revision.length }} detectadas</span></section>
  <div class="card review-summary"><span class="badge">{{ validas.length }} válidas</span><span class="badge warning-badge">{{ pendientes.length }} pendientes</span><button @click="confirmar" :disabled="!validas.length">Usar preguntas válidas</button></div>
  <article v-for="p in store.revision" :key="p.id" class="card review-question" :class="{ pending: p.estado === 'pendiente' }">
    <div class="review-heading"><strong>{{ p.id }}</strong><select v-model="p.estado" class="status-select"><option value="valida">Normal</option><option value="reserva">Reserva</option><option value="anulada">Anulada</option><option value="pendiente">Pendiente</option></select></div>
    <textarea v-model="p.enunciado" class="review-input" aria-label="Enunciado" />
    <div class="review-options"><label v-for="letra in letras" :key="letra">{{ letra }}<input v-model="p.opciones[letra]" class="review-input" aria-label="Opción" /></label></div>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTestStore } from '@/stores/useTestStore'
import type { Opcion } from '@/stores/useTestStore'
const store = useTestStore(); const router = useRouter(); const letras: Opcion[] = ['A','B','C','D']
const validas = computed(() => store.revision.filter(p => p.estado === 'anulada' || letras.every(l => p.opciones[l]?.trim())))
const pendientes = computed(() => store.revision.filter(p => !letras.every(l => p.opciones[l]?.trim())))
function confirmar() { store.setBanco(validas.value); router.push('/cargar') }
</script>
