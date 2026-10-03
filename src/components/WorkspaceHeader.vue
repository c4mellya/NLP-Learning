<template>
  <header class="workspace-top"><div><button ref="menu" aria-controls="workspace-nav" :aria-expanded="open" :aria-label="open ? '关闭导航' : '打开导航'" class="menu-toggle" type="button" @click="$emit('menu')"><span></span><span></span></button><span class="top-path">{{ route.meta.kicker }} <i>/</i> <b>{{ route.meta.label }}</b></span></div><div class="top-actions"><span v-if="route.path === '/'" class="edition-label"><i aria-hidden="true"></i>学习空间已就绪</span><RouterLink v-else class="reading-location" :to="{path:route.path,query:route.query,hash:'#main'}"><span id="reading-section">{{ section }}</span><span aria-hidden="true">↑</span></RouterLink><button :aria-pressed="dark" :aria-label="`切换到${dark ? '浅色' : '深色'}模式`" class="site-theme" data-theme-toggle type="button" @click="toggleTheme"><span aria-hidden="true" class="theme-ic ip-icon" :class="dark ? 'ip-moon' : 'ip-sun'"></span><span class="theme-word">{{ dark ? '浅色' : '深色' }}</span></button></div></header>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { workspace } from '../lib/workspace.js'
defineProps({open:Boolean})
defineEmits(['menu'])
const route = useRoute(), menu = ref(null)
const section = computed(() => workspace.sections.find(item => item.id === workspace.current)?.label || (route.path === '/ai-daily/' ? '每日观察' : '本篇提要'))
const dark = ref(document.documentElement.dataset.theme === 'dark')
const keys = ['lmapi-lab-theme','hermes-theme','lmapi-theme']
function toggleTheme() {
  dark.value = !dark.value
  const theme = dark.value ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  for (const key of keys) try { localStorage.setItem(key, theme) } catch {}
}
const preference = matchMedia('(prefers-color-scheme:dark)')
function syncSystem() {
  try { if (keys.some(key => ['light','dark'].includes(localStorage.getItem(key)))) return } catch {}
  dark.value = preference.matches
  document.documentElement.dataset.theme = dark.value ? 'dark' : 'light'
}
onMounted(() => preference.addEventListener('change', syncSystem))
onBeforeUnmount(() => preference.removeEventListener('change', syncSystem))
defineExpose({menu})
</script>
