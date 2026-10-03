import { createScope } from '../lib/resourceScope.js'

// Original parametric ribbon, rendered locally without a 3D engine or remote asset.
export function mountHome(root) {
  const resources = createScope()
  const canvas = root.querySelector('#learning-network'), ctx = canvas.getContext('2d')
  const motion = root.querySelector('.motion-toggle'), reduced = matchMedia('(prefers-reduced-motion: reduce)')
  let width = 0, height = 0, time = 0, last = 0, frame = 0, concept = 0
  let paused = reduced.matches, visible = true, pointerX = 0, pointerY = 0, tiltX = 0, tiltY = 0
  const TAU = Math.PI * 2, segments = 128, strips = 36
  function vertex(u, v) {
    const twist = u * (concept === 1 ? 2 : 1) + time * .12
    const a = .36 * Math.cos(v), b = .18 * Math.sin(v)
    const radial = 1.04 + a * Math.cos(twist) - b * Math.sin(twist)
    let x = radial * Math.cos(u), y = radial * Math.sin(u)
    let z = a * Math.sin(twist) + b * Math.cos(twist) + (concept === 2 ? .15 * Math.sin(u * 3) : 0)
    const ax = .84 + tiltY * .12, ay = -.36 + tiltX * .15, az = -.42 + Math.sin(time * .16) * .12
    let ny = y * Math.cos(ax) - z * Math.sin(ax); z = y * Math.sin(ax) + z * Math.cos(ax); y = ny
    let nx = x * Math.cos(ay) + z * Math.sin(ay); z = -x * Math.sin(ay) + z * Math.cos(ay); x = nx
    nx = x * Math.cos(az) - y * Math.sin(az); y = x * Math.sin(az) + y * Math.cos(az); x = nx
    return { x, y, z }
  }
  function project(p) {
    const scale = Math.min(width * .30, height * .35) * 4.7 / (4.7 - p.z)
    return [width * .50 + p.x * scale, height * .50 + p.y * scale]
  }
  function draw() {
    if (!ctx || !width) return
    ctx.clearRect(0, 0, width, height)
    tiltX += (pointerX - tiltX) * .04; tiltY += (pointerY - tiltY) * .04
    const glow = ctx.createRadialGradient(width * .5, height * .5, 0, width * .5, height * .5, width * .43)
    glow.addColorStop(0, 'rgba(182,224,109,.1)'); glow.addColorStop(1, 'rgba(182,224,109,0)')
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height)
    const mesh = []
    for (let i = 0; i <= segments; i++) {
      const ring = []
      for (let j = 0; j <= strips; j++) ring.push(vertex(i / segments * TAU, j / strips * TAU))
      mesh.push(ring)
    }
    const faces = []
    for (let i = 0; i < segments; i++) for (let j = 0; j < strips; j++) {
      const points = [mesh[i][j], mesh[i + 1][j], mesh[i + 1][j + 1], mesh[i][j + 1]]
      const a = points[0], b = points[1], c = points[3]
      const ux = b.x-a.x, uy = b.y-a.y, uz = b.z-a.z, vx = c.x-a.x, vy = c.y-a.y, vz = c.z-a.z
      let nx = uy*vz-uz*vy, ny = uz*vx-ux*vz, nz = ux*vy-uy*vx
      const length = Math.hypot(nx,ny,nz) || 1; nx /= length; ny /= length; nz /= length
      const light = Math.max(0, nx * -.35 + ny * -.65 + nz * .67)
      const shine = Math.pow(Math.max(0, nz * .88 - ny * .4), 14)
      faces.push({ points, z: points.reduce((s,p) => s + p.z, 0) / 4, light, shine, stripe: j % 3 === 0 })
    }
    faces.sort((a,b) => a.z-b.z)
    for (const face of faces) {
      const l = face.light, s = face.shine
      const r = Math.round(47 + 148*l + 52*s), g = Math.round(89 + 141*l + 24*s), b = Math.round(48 + 63*l + 83*s)
      ctx.fillStyle = `rgb(${Math.min(255,r)},${Math.min(255,g)},${Math.min(255,b)})`
      ctx.beginPath()
      face.points.forEach((point,i) => { const p = project(point); if (i) ctx.lineTo(...p); else ctx.moveTo(...p) })
      ctx.closePath(); ctx.fill()
      ctx.lineWidth = .45; ctx.strokeStyle = face.stripe ? 'rgba(225,251,176,.14)' : ctx.fillStyle; ctx.stroke()
    }
    ctx.fillStyle = '#d6f18a'
    for (let i = 0; i < 3; i++) { const p = project(vertex(time * .08 + i * TAU / 3, 0)); ctx.beginPath(); ctx.arc(p[0],p[1],2.5,0,TAU); ctx.fill() }
  }
  function tick(now) {
    frame = 0
    if (!last || now - last >= 32) { if (last) time += Math.min((now-last)/1000,.08); last = now; draw() }
    if (!paused && visible && !document.hidden) frame = resources.frame(tick)
  }
  function schedule() {
    resources.cancelFrame(frame); frame = 0; last = 0
    if (!paused && visible && !document.hidden) frame = resources.frame(tick); else draw()
  }
  function paintMotion() {
    motion.setAttribute('aria-pressed', String(paused))
    motion.setAttribute('aria-label', paused ? '播放知识雕塑动画' : '暂停知识雕塑动画')
    motion.firstElementChild.textContent = paused ? '▷' : 'Ⅱ'
  }
  function resize() {
    const box = canvas.getBoundingClientRect(); width = box.width; height = box.height
    const dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr)
    ctx?.setTransform(dpr,0,0,dpr,0,0); draw()
  }
  root.querySelectorAll('[data-concept]').forEach(button => resources.on(button,'click',() => { concept = ['nlp','llm','agent'].indexOf(button.dataset.concept); draw() }))
  resources.on(canvas,'pointermove',event => { const box = canvas.getBoundingClientRect(); pointerX = (event.clientX-box.left)/box.width*2-1; pointerY = (event.clientY-box.top)/box.height*2-1; if (paused) draw() })
  resources.on(canvas,'pointerleave',() => { pointerX = 0; pointerY = 0 })
  resources.on(motion,'click',() => { paused = !paused; paintMotion(); schedule() })
  resources.on(reduced,'change',() => { paused = reduced.matches; paintMotion(); schedule() })
  resources.on(document,'visibilitychange',schedule)
  resources.observer(ResizeObserver,resize).observe(canvas)
  resources.observer(IntersectionObserver,entries => { visible = entries[0].isIntersecting; schedule() }).observe(canvas)
  paintMotion(); resize(); schedule()
  return resources.dispose
}
