<template>
  <section class="page-heading compact-heading">
    <div>
      <span class="eyebrow">Preferencias</span>
      <h1>Configuración del examen</h1>
      <p class="subtitle">Adapta la corrección y el ritmo de estudio a tus necesidades.</p>
    </div>
  </section>

  <section class="settings-grid">
    <div class="card settings-card">
      <div class="section-icon">100</div><h2>Preguntas que cuentan</h2>
      <p class="muted">Las anuladas se sustituyen por reservas hasta alcanzar este número.</p>
      <label class="field-label" for="base-questions">Base del examen</label>
      <input id="base-questions" v-model.number="store.config.preguntasBase" class="select-control" type="number" min="1" max="999" />
    </div>
    <div class="card settings-card">
      <div class="section-icon">☾</div>
      <h2>Apariencia</h2>
      <p class="muted">Elige el tema más cómodo para estudiar.</p>
      <label class="theme-setting">
        <input type="checkbox" v-model="store.config.modoOscuro" />
        <span>Usar modo oscuro</span>
      </label>
    </div>
    <div class="card settings-card">
      <div class="section-icon">★</div><h2>Reglas de puntuación</h2>
      <p class="muted">Configura cómo se calcula la nota de tus convocatorias.</p>
      <label class="field-label">Puntos por acierto</label><input v-model.number="store.config.puntosAcierto" class="select-control" type="number" min="0" step="0.25" />
      <label class="field-label">Puntos por blanco</label><input v-model.number="store.config.puntosBlanco" class="select-control" type="number" step="0.25" />
    </div>
    <div class="card settings-card">
      <div class="section-icon">▤</div>
      <h2>Preguntas por página</h2>
      <p class="muted">Controla cuánto contenido aparece durante el examen.</p>
      <label class="field-label" for="page-size">Cantidad</label>
      <select id="page-size" v-model.number="store.config.pageSize" class="select-control">
        <option :value="5">5 preguntas</option>
        <option :value="10">10 preguntas</option>
        <option :value="15">15 preguntas</option>
        <option :value="20">20 preguntas</option>
      </select>
    </div>

    <div class="card settings-card">
      <div class="section-icon">−</div>
      <h2>Penalización</h2>
      <p class="muted">Puntos que se restan por cada respuesta incorrecta.</p>
      <label class="field-label" for="penalty">Descuento por fallo</label>
      <select id="penalty" v-model.number="store.config.penalizacion" class="select-control">
        <option :value="0">Sin penalización</option>
        <option :value="0.25">1/4 de punto</option>
        <option :value="1 / 3">1/3 de punto</option>
        <option :value="0.5">1/2 punto</option>
      </select>
    </div>
  </section>

  <div class="card info-card">
    <span class="info-dot">i</span>
    <p>Los cambios se aplican al corregir el próximo intento. El examen actual conservará sus respuestas.</p>
  </div>
</template>

<script setup lang="ts">
import { useTestStore } from '@/stores/useTestStore'

const store = useTestStore()
</script>
