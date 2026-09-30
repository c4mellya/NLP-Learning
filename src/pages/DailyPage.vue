<template>
  <div class="site-shell is-plain">
<main class="site-main daily-main" id="main" ref="pageRoot"><header class="signal-masthead"><div class="signal-kicker"><span>THE DAILY SIGNAL / AI 日报</span><span>SCAN. VERIFY. THINK.</span></div><div class="signal-cover"><div><h1>看见变化，<br/><span>读懂下一步。</span></h1><p>在快速变化的信息里，积累自己的判断。<br/>每日记录值得关注的 AI 进展、来源与观察。</p></div><div aria-hidden="true" class="signal-art"><span class="signal-ring ring-one"></span><span class="signal-ring ring-two"></span><span class="signal-ring ring-three"></span><span class="signal-star">✳</span><span class="signal-art-label">A SIGNAL IN THE NOISE.</span></div></div><div class="signal-edition"><div><span class="edition-dot"></span><h2 id="daily-title">AI 日报</h2><time id="daily-date"></time><p hidden="" id="daily-head-meta"></p></div><div class="date-control"><label for="daily-select">选择刊期</label><select aria-label="选择历史日报" id="daily-select"></select></div></div></header>
<nav aria-label="本期分类条目数量，点击跳转" hidden="" id="daily-overview"></nav>
<div class="daily-state"><div aria-hidden="true" class="empty-signal">↗</div><p id="daily-status" role="status">正在加载 AI 日报...</p><RouterLink hidden="" to="/ai-daily/" id="daily-latest">查看最新日报</RouterLink></div>
<div class="daily-layout"><div class="daily-document"><article aria-label="AI 日报正文" hidden="" id="daily-content"></article></div><aside aria-label="日报阅读导航" class="daily-sidecar"><details class="daily-toc" hidden="" id="daily-toc" open=""><summary>本期目录 <span>CONTENTS</span></summary><nav aria-label="本期内容目录" id="daily-toc-links"></nav></details><div class="signal-note"><span>✳</span><h3>读进展，也读来源。</h3><p>事实、预告与观察各有边界。每一条记录，都从可追溯的来源开始。</p><small>STAY CURIOUS. STAY CRITICAL.</small></div></aside></div>
<footer class="home-footer"><div><b>NLP Learning</b><span>保持好奇，建立连接。</span></div><RouterLink :to="{path:route.path,query:route.query,hash:'#main'}">BACK TO TOP ↑</RouterLink></footer></main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mountDaily } from '../features/daily.js'
import { mountReading } from '../composables/useReading.js'
import { workspace, finishPage } from '../lib/workspace.js'
const pageRoot = ref(null), route = useRoute(), router = useRouter()
let dispose, disposeReading
function load() {
  dispose?.(); disposeReading?.()
  const root = pageRoot.value
  for (const id of ['daily-select','daily-content','daily-toc-links','daily-overview']) root.querySelector('#'+id).replaceChildren()
  root.querySelector('#daily-title').textContent = 'AI 日报'
  root.querySelector('#daily-date').textContent = ''
  root.querySelector('#daily-status').textContent = '正在加载 AI 日报...'
  root.querySelector('#daily-status').hidden = false
  for (const id of ['daily-content','daily-toc','daily-overview','daily-latest']) root.querySelector('#'+id).hidden = true
  workspace.date = typeof route.query.date === 'string' ? route.query.date : workspace.date
  dispose = mountDaily(root, {
    navigate: to => router.push(to),
    onHistory: (entries, date) => { workspace.entries = entries; workspace.date = date },
    onReport: () => { disposeReading = mountReading(root, null) },
    onReady: finishPage,
  })
}
onMounted(load)
watch(() => route.query.date, load, {flush:'post'})
onBeforeUnmount(() => { dispose?.(); disposeReading?.() })
</script>
