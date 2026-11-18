import { createRouter, createWebHistory } from 'vue-router'
import CargarView from './views/CargarView.vue'
import ExamenView from './views/ExamenView.vue'
import ResultadosView from './views/ResultadosView.vue'
import ConfigView from './views/ConfigView.vue'
import BibliotecaView from './views/BibliotecaView.vue'
import RevisionView from './views/RevisionView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/biblioteca' },
    { path: '/biblioteca', component: BibliotecaView },
    { path: '/revision', component: RevisionView },
    { path: '/cargar', component: CargarView },
    { path: '/examen', component: ExamenView },
    { path: '/resultados', component: ResultadosView },
    { path: '/configuracion', component: ConfigView }
  ]
})
