import { reactive } from 'vue'

export const workspace = reactive({ sections: [], current: '', progress: 0, entries: [], date: '' })
let resolveReady
export let pageReady = Promise.resolve()
export function preparePage() {
  resolveReady?.()
  workspace.sections = []
  workspace.current = ''
  workspace.progress = 0
  pageReady = new Promise(resolve => { resolveReady = resolve })
}
export function finishPage() { resolveReady?.(); resolveReady = null }
