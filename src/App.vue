<template>
  <a class="skip-link" href="#main">跳转到正文</a>
  <WorkspaceSidebar ref="sidebar" @close="closeMenu" />
  <button aria-label="关闭导航" class="nav-backdrop" :hidden="!menuOpen" type="button" @click="closeMenu()"></button>
  <div ref="frame" class="home-workspace">
    <WorkspaceHeader ref="header" :open="menuOpen" @menu="setMenu(!menuOpen)" />
    <RouterView v-slot="{ Component, route }"><Transition name="page" mode="out-in"><component :is="Component" :key="route.path" /></Transition></RouterView>
  </div>
  <div v-if="route.meta.course" class="reading-progress" aria-hidden="true" :style="{transform:`scaleX(${workspace.progress})`}"></div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import WorkspaceSidebar from './components/WorkspaceSidebar.vue'
import WorkspaceHeader from './components/WorkspaceHeader.vue'
import { workspace } from './lib/workspace.js'
import { createScope } from './lib/resourceScope.js'
const router = useRouter(), route = useRoute()
const sidebar = ref(null), header = ref(null), frame = ref(null), menuOpen = ref(false)
const narrow = matchMedia('(max-width:900px)'), resources = createScope()
let previousOverflow = ''
function setMenu(open, restoreFocus = true) {
  open = open && narrow.matches
  const wasOpen = menuOpen.value
  menuOpen.value = open
  document.body.classList.toggle('nav-open', open)
  const rail = sidebar.value.rail
  rail.inert = narrow.matches && !open
  frame.value.inert = open
  if (narrow.matches && !open) rail.setAttribute('aria-hidden','true'); else rail.removeAttribute('aria-hidden')
  if (open) {
    if (!wasOpen) previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    rail.setAttribute('role','dialog'); rail.setAttribute('aria-modal','true')
    rail.querySelector('.workspace-close').focus()
  } else {
    rail.removeAttribute('role'); rail.removeAttribute('aria-modal')
    if (wasOpen) document.body.style.overflow = previousOverflow
    if (wasOpen && restoreFocus) header.value.menu.focus()
  }
}
function closeMenu(restoreFocus = true) { setMenu(false, restoreFocus) }
function navigate(event) {
  const link = event.target.closest('a[href]')
  if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || link.target === '_blank' || link.hasAttribute('download')) return
  const url = new URL(link.href)
  if (url.origin !== location.origin || !['/','/hermes/','/llm-api/','/ai-daily/'].includes(url.pathname)) return
  event.preventDefault(); router.push(url.pathname + url.search + url.hash)
}
onMounted(() => {
  setMenu(false,false)
  resources.on(narrow,'change', () => setMenu(false,false))
  resources.on(document,'click',navigate)
  resources.on(document,'keydown',event => {
    if (!menuOpen.value) return
    if (event.key === 'Escape') { event.preventDefault(); closeMenu() }
    if (event.key === 'Tab') {
      const rail = sidebar.value.rail
      const items = [...rail.querySelectorAll('a,button,summary')].filter(el => el.getClientRects().length && !el.disabled && !el.closest('[inert]'))
      const first = items[0], last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
  })
})
watch(() => route.fullPath, async () => { await nextTick(); closeMenu(false) })
onBeforeUnmount(resources.dispose)
</script>
