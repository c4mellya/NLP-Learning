import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import HomePage from './pages/HomePage.vue'
import HermesPage from './pages/HermesPage.vue'
import CachePage from './pages/CachePage.vue'
import DailyPage from './pages/DailyPage.vue'
import { preparePage, pageReady } from './lib/workspace.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage, meta: { title: 'NLP Learning · 把好奇心变成行动力', classes: 'home-page', label: '学习总览', kicker: 'WORKSPACE' } },
    { path: '/hermes/', component: HermesPage, meta: { title: 'Hermes Agent 六步上手 · NLP Learning', classes: 'course-page hermes-course reading-page hermes-reading', label: '01 · Agent 实践', kicker: 'THE NOTEBOOK', course: 'hermes' } },
    { path: '/llm-api/', component: CachePage, meta: { title: 'LLM API 与 Prompt Caching · NLP Learning', classes: 'course-page llm-api-page reading-page llm-api-reading', label: '02 · Prompt Caching', kicker: 'THE NOTEBOOK', course: 'llm-api' } },
    { path: '/ai-daily/', component: DailyPage, meta: { title: 'AI 日报 · NLP Learning', classes: 'reading-page ai-daily-reading', label: 'AI 日报', kicker: 'THE DAILY SIGNAL' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  async scrollBehavior(to, from, saved) {
    if (to.path !== from.path || to.query.date !== from.query.date) await pageReady
    await nextTick()
    if (saved) return { ...saved, behavior: 'instant' }
    if (to.hash) {
      const target = document.getElementById(decodeURIComponent(to.hash.slice(1)))
      if (target) return { el: target, top: parseFloat(getComputedStyle(document.body).getPropertyValue('--anchor-offset')) || 108, behavior: to.path === from.path && !matchMedia('(prefers-reduced-motion:reduce)').matches ? 'smooth' : 'instant' }
    }
    return { top: 0, behavior: 'instant' }
  },
})
router.beforeEach((to, from) => {
  if (to.path !== '/' && !to.path.endsWith('/') && to.matched[0]?.path.endsWith('/')) return { path: to.path + '/', query: to.query, hash: to.hash, replace: true }
  if (to.path !== from.path || to.query.date !== from.query.date) {
    preparePage()
    document.title = to.meta.title
  }
  document.body.className = to.meta.classes
})
export default router
