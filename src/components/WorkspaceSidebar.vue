<template>
<aside ref="rail" @click="onRailClick" aria-label="工作台导航" class="workspace-nav" id="workspace-nav">
<button type="button" class="workspace-close" aria-label="关闭导航" @click="emit('close')">×</button><RouterLink aria-label="NLP Learning 首页" class="workspace-brand" to="/"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M9 29V11h5l12 15V11h5v18h-5L14 14v15z"/><path d="M7 7h26v26H7z"/></svg></span><span>NLP Learning<small>AN OPEN NOTEBOOK</small></span></RouterLink>
<p class="nav-label">WORKSPACE <span>工作台</span></p>
<nav class="workspace-links">
<RouterLink  :aria-current="route.path === '/' ? 'page' : undefined" :class="{'is-active': route.path === '/'}" to="/#main"><svg aria-hidden="true" viewBox="0 0 24 24"><rect height="6" rx="1" width="6" x="4" y="4"></rect><rect height="6" rx="1" width="6" x="14" y="4"></rect><rect height="6" rx="1" width="6" x="4" y="14"></rect><rect height="6" rx="1" width="6" x="14" y="14"></rect></svg>学习总览 <span class="nav-arrow">↗</span></RouterLink>
<details ref="group" class="nav-course-group" :class="{'is-expanded': coursesOpen}" open><summary class="nav-course-toggle" :class="{'is-active': !!route.meta.course}" @click.prevent="toggleCourses" :aria-expanded="coursesOpen"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 6v15M12 6C8 3 5 4 3 5v14c3-1 6-1 9 2 3-3 6-3 9-2V5c-3-1-6-1-9 1Z"></path></svg>学习笔记 <span class="nav-count">02</span><span aria-hidden="true" class="nav-chevron ip-icon ip-chevron-right"></span></summary><nav ref="list" class="nav-course-list"><RouterLink to="/hermes/" :class="{'is-active': route.meta.course === 'hermes'}" :aria-current="route.meta.course === 'hermes' ? 'page' : undefined"><span class="nav-course-index">01</span><span class="nav-course-name">Hermes Agent</span></RouterLink><RouterLink to="/llm-api/" :class="{'is-active': route.meta.course === 'llm-api'}" :aria-current="route.meta.course === 'llm-api' ? 'page' : undefined"><span class="nav-course-index">02</span><span class="nav-course-name">Prompt Caching</span></RouterLink></nav></details>

<RouterLink to="/ai-daily/" :class="{'is-active': isDaily}" :aria-current="isDaily ? 'page' : undefined"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 7h4l3 11L14 4l3 11 2-5h2"></path></svg>AI 日报 <span class="nav-arrow">↗</span></RouterLink>
</nav>
<div class="nav-divider"></div>
<template v-if="route.path === '/'"><p class="nav-label">EXPLORING <span>探索方向</span></p>
<div class="nav-topics"><span><i></i>自然语言处理<small>NLP</small></span><span><i></i>大语言模型<small>LLM</small></span><span><i></i>智能体实践<small>AGENT</small></span></div>
</template>
<div v-else-if="isDaily" class="sidebar-chapters daily-archive"><p class="nav-label">ARCHIVE <span>往期日报</span></p><nav aria-label="按日期选择日报" id="daily-list"><template v-for="(entry,index) in workspace.entries" :key="entry.date"><p v-if="index === 0 || entry.date.slice(0,7) !== workspace.entries[index-1].date.slice(0,7)" class="daily-month">{{ entry.date.slice(0,4) }}年{{ Number(entry.date.slice(5,7)) }}月</p><RouterLink class="daily-list-link" :to="'/ai-daily/?date='+entry.date" :title="entry.title" :aria-current="workspace.date === entry.date ? 'page' : undefined">{{ entry.date.slice(5) }}</RouterLink></template></nav></div>
<div v-else class="sidebar-chapters"><p class="nav-label">IN THIS NOTE <span>本篇目录</span></p><nav aria-label="本页章节导航" data-site-nav><div class="site-rail-in"><div class="rail-scroll"><div class="rail-secs"><RouterLink v-for="section in workspace.sections" :key="section.id" class="rail-sec" :class="{'is-current': workspace.current === section.id}" :aria-current="workspace.current === section.id ? 'location' : undefined" :data-sec="section.id" :to="{path:route.path,hash:'#'+section.id}"><span class="rail-sec-n">{{ section.n }}</span><span>{{ section.label }}</span></RouterLink></div></div></div></nav></div>
<div class="nav-bottom"><div v-if="route.path === '/'" class="nav-note"><span aria-hidden="true" class="note-asterisk">✳</span><p>理解的下一步，<br/>是亲手试一试。</p><small>STAY CURIOUS. KEEP BUILDING.</small></div><div v-else-if="isDaily" class="sidebar-next"><span>KEEP EXPLORING</span><RouterLink to="/hermes/">Hermes Agent 六步上手 <b>↗</b></RouterLink></div><div class="nav-status"><span></span>{{ route.path === '/' ? '持续生长的学习笔记' : '保持好奇，建立连接。' }} <b v-if="route.path === '/'">↗</b></div></div>
</aside>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { workspace } from '../lib/workspace.js'
const emit = defineEmits(['close'])
const route = useRoute(), rail = ref(null), group = ref(null), list = ref(null)
const isDaily = computed(() => route.path === '/ai-daily/')
const coursesOpen = ref(document.documentElement.dataset.coursesOpen !== 'false')
let animations = [], revision = 0
function toggleCourses() {
  const node = group.value, items = list.value, toggle = node.querySelector('summary')
  const expanded = !coursesOpen.value, run = ++revision
  const fromHeight = node.getBoundingClientRect().height
  const fromOpacity = node.open ? getComputedStyle(items).opacity : '0'
  const fromTransform = node.open ? getComputedStyle(items).transform : 'translateY(-6px)'
  animations.forEach(animation => animation.cancel())
  coursesOpen.value = expanded
  node.classList.toggle('is-expanded', expanded)
  document.documentElement.dataset.coursesOpen = String(expanded)
  try { sessionStorage.setItem('nlp-learning-courses-open', String(expanded)) } catch {}
  items.inert = !expanded
  node.style.height = ''; node.style.overflow = ''
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) { node.open = expanded; return }
  node.open = true
  const toHeight = expanded ? node.getBoundingClientRect().height : toggle.getBoundingClientRect().height
  node.style.height = fromHeight + 'px'; node.style.overflow = 'hidden'
  const timing = { duration:260, easing:'cubic-bezier(.22,1,.36,1)', fill:'forwards' }
  const resize = node.animate({ height:[fromHeight+'px', toHeight+'px'] }, timing)
  const reveal = items.animate({ opacity:[fromOpacity, expanded?'1':'0'], transform:[fromTransform, expanded?'translateY(0)':'translateY(-6px)'] }, timing)
  animations = [resize,reveal]
  resize.onfinish = () => {
    if (run !== revision) return
    node.open = expanded; node.style.height = ''; node.style.overflow = ''
    animations.forEach(animation => animation.cancel()); animations = []
  }
}
function onRailClick(event) { if (event.target.closest('a')) emit('close', false) }
onMounted(() => { group.value.open = coursesOpen.value; group.value.classList.add('motion-ready'); list.value.inert = !coursesOpen.value })
onBeforeUnmount(() => animations.forEach(animation => animation.cancel()))
watch(() => workspace.current, async () => {
  await nextTick()
  const current = rail.value?.querySelector('.rail-sec.is-current'), scroll = current?.closest('[data-site-nav]')
  if (!scroll || scroll.scrollHeight <= scroll.clientHeight) return
  const box = scroll.getBoundingClientRect(), item = current.getBoundingClientRect()
  if (item.top < box.top+12) scroll.scrollTop -= box.top+12-item.top
  else if (item.bottom > box.bottom-12) scroll.scrollTop += item.bottom-box.bottom+12
})
defineExpose({ rail })
</script>
