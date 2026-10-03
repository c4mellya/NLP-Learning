import { onMounted, onBeforeUnmount } from 'vue'
import { createScope } from '../lib/resourceScope.js'
import { workspace, finishPage } from '../lib/workspace.js'

export function mountReading(root, course) {
  const resources = createScope()
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const reveal = resources.observer(IntersectionObserver, entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed')
        reveal.unobserve(entry.target)
      }
    }, { threshold: .08 })
    root.querySelectorAll('[data-reveal], .note[data-step] .note-head, .experiment-section-head, .daily-section-head').forEach(node => {
      node.classList.add('reveal-ready')
      reveal.observe(node)
    })
  }
  const headings = [...root.querySelectorAll('[data-nav-anchor], .daily-section')]
  workspace.sections = headings.map((node, i) => ({
    id: node.id,
    label: (node.dataset.navLabel || node.querySelector('h2')?.textContent || node.textContent).trim().replace(/^\d{2}\s*/, '').replace(/[：:。.]$/, ''),
    n: String(course === 'llm-api' ? i : i + 1).padStart(2, '0'),
    box: node.closest('.note-sec, .note, section[id], article[id]') || node,
  }))
  if (!headings.length) {
    workspace.sections = []
    workspace.current = ''
    workspace.progress = 0
    return resources.dispose
  }
  let frame = 0, locked = false, settleTimer, bailTimer, maxTimer
  function update() {
    frame = 0
    const line = (parseFloat(getComputedStyle(document.body).getPropertyValue('--topbar-h')) || 78) + 90
    let current = workspace.sections[0]
    for (const section of workspace.sections) if (section.box.getBoundingClientRect().top <= line) current = section
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = workspace.sections.at(-1)
    if (current && !locked) workspace.current = current.id
    const distance = document.documentElement.scrollHeight - innerHeight
    workspace.progress = distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 1
    if (course) try { localStorage.setItem('nlp-learning-position', JSON.stringify({ course, section: workspace.current })) } catch {}
  }
  function unlock() {
    locked = false
    resources.clearTimeout(settleTimer); resources.clearTimeout(bailTimer); resources.clearTimeout(maxTimer)
    update()
  }
  resources.on(window, 'scroll', () => {
    if (locked) {
      resources.clearTimeout(settleTimer); resources.clearTimeout(bailTimer)
      settleTimer = resources.timeout(unlock, 140)
    }
    if (!frame) frame = resources.frame(update)
  }, { passive: true })
  resources.on(window, 'resize', update)
  resources.on(document, 'click', event => {
    const link = event.target.closest('[data-sec]')
    if (!link) return
    workspace.current = link.dataset.sec
    locked = true
    resources.clearTimeout(settleTimer); resources.clearTimeout(bailTimer); resources.clearTimeout(maxTimer)
    bailTimer = resources.timeout(unlock, 200)
    maxTimer = resources.timeout(unlock, 2600)
  })
  root.querySelectorAll('.terminal').forEach(terminal => {
    const bar = terminal.querySelector('.terminal-bar'), code = terminal.querySelector('pre')
    if (!bar || !code) return
    const button = document.createElement('button')
    button.type = 'button'; button.className = 'terminal-copy'; button.textContent = '复制代码'; button.setAttribute('aria-live', 'polite')
    resources.on(button, 'click', async () => {
      try { await navigator.clipboard.writeText(code.textContent.replace(/^(?:\$ |PS> )/gm, '')); if (resources.active) button.textContent = '已复制 ✓' }
      catch { if (resources.active) button.textContent = '请选中代码复制' }
      if (resources.active) resources.timeout(() => { button.textContent = '复制代码' }, 2200)
    })
    bar.append(button)
  })
  update()
  return resources.dispose
}

export function usePage(root, mount, course) {
  let dispose, disposeReading
  onMounted(() => {
    dispose = mount(root.value)
    disposeReading = mountReading(root.value, course)
    finishPage()
  })
  onBeforeUnmount(() => { dispose?.(); disposeReading?.() })
}
