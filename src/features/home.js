import { createScope } from '../lib/resourceScope.js'
import { createSculptureRenderer } from './sculpture.js'
import fallbackImage from '../../assets/sculpture-fallback.svg'

export function mountHome(root) {
  const resources = createScope(), canvas = root.querySelector('#learning-network')
  const motion = root.querySelector('.motion-toggle'), reduced = matchMedia('(prefers-reduced-motion: reduce)')
  let renderer = createSculptureRenderer(canvas), contextLost = false
  let width = 0, height = 0, time = 0, last = 0, frame = 0, concept = 0
  let paused = reduced.matches, visible = true, pointerX = 0, pointerY = 0, tiltX = 0, tiltY = 0
  function paintMotion() {
    const staticOnly = !renderer || contextLost
    motion.disabled = staticOnly
    motion.setAttribute('aria-pressed', String(paused || staticOnly))
    motion.setAttribute('aria-label', staticOnly ? '当前设备显示静态知识雕塑' : paused ? '播放知识雕塑动画' : '暂停知识雕塑动画')
    motion.firstElementChild.textContent = paused || staticOnly ? '▷' : 'Ⅱ'
    canvas.style.backgroundImage = renderer && !contextLost ? '' : `url("${fallbackImage}")`
  }
  function draw() {
    if (!renderer || contextLost || !width || !height) return
    tiltX += (pointerX - tiltX) * .08; tiltY += (pointerY - tiltY) * .08
    renderer.draw(time, tiltX, tiltY, concept, width, height)
  }
  function tick(now) {
    frame = 0
    // Uniform updates and one GPU draw call are the only per-frame work.
    if (!last || now - last >= 32) { if (last) time += Math.min((now - last) / 1000, .08); last = now; draw() }
    if (renderer && !contextLost && !paused && visible && !document.hidden) frame = resources.frame(tick)
  }
  function schedule() {
    resources.cancelFrame(frame); frame = 0; last = 0
    if (renderer && !contextLost && !paused && visible && !document.hidden) frame = resources.frame(tick)
    else if (visible && !document.hidden) draw()
  }
  function resize() {
    const box = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 1.5)
    width = box.width; height = box.height
    const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr)
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) { canvas.width = pixelWidth; canvas.height = pixelHeight }
    draw()
  }
  root.querySelectorAll('[data-concept]').forEach(button => resources.on(button, 'click', () => { concept = ['nlp', 'llm', 'agent'].indexOf(button.dataset.concept); draw() }))
  resources.on(canvas, 'pointermove', event => {
    if (paused || reduced.matches || !renderer || contextLost) return
    const box = canvas.getBoundingClientRect()
    pointerX = (event.clientX - box.left) / box.width * 2 - 1; pointerY = (event.clientY - box.top) / box.height * 2 - 1
  })
  resources.on(canvas, 'pointerleave', () => { pointerX = 0; pointerY = 0 })
  resources.on(motion, 'click', () => { paused = !paused; paintMotion(); schedule() })
  resources.on(reduced, 'change', () => { paused = reduced.matches; pointerX = 0; pointerY = 0; paintMotion(); schedule() })
  resources.on(document, 'visibilitychange', schedule)
  resources.on(canvas, 'webglcontextlost', event => { event.preventDefault(); contextLost = true; paintMotion(); schedule() })
  resources.on(canvas, 'webglcontextrestored', () => { renderer?.dispose(); renderer = createSculptureRenderer(canvas); contextLost = false; paintMotion(); schedule() })
  resources.observer(ResizeObserver, resize).observe(canvas)
  resources.observer(IntersectionObserver, entries => { visible = entries[0].isIntersecting; schedule() }).observe(canvas)
  paintMotion(); resize(); schedule()
  return () => { resources.dispose(); renderer?.dispose() }
}
