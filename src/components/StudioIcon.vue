<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'arrow'"><path d="M5 19 19 5M5 5h14v14" /></template>
    <template v-else-if="name === 'language'"><path d="M4 5h12M10 3v2M6 5c0 6 4 9 8 11M14 5c0 6-4 9-10 12M13 21l4-11 4 11M14.5 17h5" /></template>
    <template v-else-if="name === 'model'"><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" /></template>
    <template v-else-if="name === 'agent'"><rect x="4" y="7" width="16" height="13" rx="4" /><path d="M12 3v4M8 12h.01M16 12h.01M9 16h6M1 12v4M23 12v4" /><circle cx="12" cy="2" r="1" /></template>
    <template v-else-if="name === 'signal'"><path d="M2 12h4l3-8 6 16 3-8h4" /></template>
    <template v-else-if="name === 'book'"><path d="M12 5v16M12 5C9 3 5 3 3 4v15c3-1 6-1 9 2 3-3 6-3 9-2V4c-3-1-6-1-9 1Z" /></template>
    <template v-else-if="name === 'play'"><path d="m9 5 11 7-11 7V5Z" /></template>
    <template v-else-if="name === 'check'"><path d="m5 12 4 4L19 6" /></template>
    <template v-else><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4 18.4 5.6" /></template>
  </svg>
</template>
<script setup>
defineProps({ name: { type: String, default: 'spark' } })
</script>
