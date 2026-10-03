<template>
  <div class="field-cover" :class="`field-cover-${kind}`" aria-hidden="true">
    <div class="field-cover-top"><span>{{ kind === 'agent' ? 'THE AGENT FIELD GUIDE' : 'THE COMPUTATION EXPERIMENT' }}</span><StudioIcon name="arrow" /></div>
    <span class="field-cover-number">{{ kind === 'agent' ? '01' : '02' }}</span>
    <template v-if="kind === 'agent'">
      <div class="field-orbit orbit-one"></div><div class="field-orbit orbit-two"></div>
      <div class="field-agent"><span class="agent-caption">A THOUGHT BECOMES AN ACTION.</span><div class="field-flow"><span class="field-endpoint">TASK<small>理解任务</small></span><i></i><span class="field-core"><StudioIcon name="agent" /><b>HERMES</b><span class="field-core-dot"></span></span><i></i><span class="field-endpoint">TOOLS<small>调用工具</small></span></div><div class="field-loop"><span>↳</span><span>OBSERVE → REASON → ACT</span><span>↲</span></div></div>
    </template>
    <div v-else class="field-cache"><p>SAME PREFIX.<br/><b>NEW POSSIBILITIES.</b></p><div class="field-token-row"><i v-for="(letter,i) in 'PREFIX'" :key="i">{{ letter }}</i><b>A</b></div><div class="field-token-row field-token-hit"><i v-for="(letter,i) in 'PREFIX'" :key="i">{{ letter }}</i><b>B</b></div><div class="field-reuse"><span>↳ REUSE COMPUTATION</span><StudioIcon name="check" /></div></div>
    <div class="field-cover-bottom"><span>{{ kind === 'agent' ? 'INPUT → INTELLIGENCE → IMPACT' : 'READ → REUSE → REASON' }}</span><span>FIELD NOTE / {{ kind === 'agent' ? '01' : '02' }}</span></div>
  </div>
</template>
<script setup>
import StudioIcon from './StudioIcon.vue'
defineProps({ kind: { type: String, default: 'agent' } })
</script>
