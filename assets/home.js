/* 三维语义网络：以透视投影绘制球面节点与轨道，不依赖远程 3D 库。 */
(() => {
  'use strict';
  const canvas = document.getElementById('learning-network');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let visible = true;
  let frame = 0;
  let time = 0;
  let last = 0;
  let width = 0;
  let height = 0;
  let colors;
  const nodes = Array.from({ length: 76 }, (_, i) => {
    const y = 1 - 2 * (i + .5) / 76;
    const radius = Math.sqrt(1 - y * y);
    const phi = i * Math.PI * (3 - Math.sqrt(5));
    return [radius * Math.cos(phi), y, radius * Math.sin(phi)];
  });
  const edges = [];
  nodes.forEach((a, i) => nodes.forEach((b, j) => {
    if (j > i && Math.hypot(...a.map((v, k) => v - b[k])) < .48) edges.push([i, j]);
  }));

  function project(point) {
    const angle = time * .13 + .45;
    const x = point[0] * Math.cos(angle) + point[2] * Math.sin(angle);
    const z0 = -point[0] * Math.sin(angle) + point[2] * Math.cos(angle);
    const y = point[1] * Math.cos(.32) - z0 * Math.sin(.32);
    const z = point[1] * Math.sin(.32) + z0 * Math.cos(.32);
    const perspective = 4 / (4 - z);
    const size = Math.min(width * .28, height * .32);
    return { x: width / 2 + x * size * perspective, y: height / 2 + y * size * perspective, z, scale: perspective };
  }

  function line(a, b, color, alpha, weight = .7) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const points = nodes.map(project);
    // 三条倾角不同的轨道对应语言、模型与行动。
    const rings = [0, 1, 2].map(ring => Array.from({ length: 121 }, (_, i) => {
      const theta = i / 120 * Math.PI * 2;
      const tilt = [.25, 1.1, -1.05][ring];
      const x = Math.cos(theta) * 1.43;
      const z = Math.sin(theta) * 1.43;
      return project([x, z * Math.sin(tilt), z * Math.cos(tilt)]);
    }));
    // 先画背面，前景轨道在节点之后绘制，保留空间遮挡关系。
    const drawRings = front => rings.forEach((ring, r) => ring.slice(1).forEach((p, i) => {
      if ((p.z >= 0) === front) line(ring[i], p, r === 1 ? colors.hot : colors.cold, front ? .5 : .13, .8);
    }));
    drawRings(false);
    edges.forEach(([a, b]) => line(points[a], points[b], colors.cold, .1 + (points[a].z + points[b].z + 2) * .055));
    points.slice().sort((a, b) => a.z - b.z).forEach(p => {
      ctx.globalAlpha = .28 + (p.z + 1) * .3;
      ctx.fillStyle = colors.cold;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8 * p.scale, 0, Math.PI * 2); ctx.fill();
    });
    // 沿连接传播的信号，强调这是不断建立联系的学习网络。
    for (let i = 0; i < 9; i++) {
      const edge = edges[(i * 19) % edges.length];
      const t = (time * .3 + i * .137) % 1;
      const p = project(nodes[edge[0]].map((v, k) => v + (nodes[edge[1]][k] - v) * t));
      ctx.globalAlpha = .85; ctx.fillStyle = colors.hot;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.4 * p.scale, 0, Math.PI * 2); ctx.fill();
    }
    drawRings(true);
    rings.forEach((ring, r) => {
      const p = ring[Math.floor((time * .045 + r / 3) % 1 * 120)];
      ctx.globalAlpha = 1; ctx.fillStyle = r === 1 ? colors.hot : colors.cold;
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
    ctx.font = '10px "IBM Plex Mono", monospace';
    const labels = [ ['NLP', .09, .28], ['LLM', .77, .22], ['AGENT', .72, .83] ];
    labels.forEach(([label, x, y], i) => {
      const p = { x: width * x, y: height * y };
      line(p, points[[22, 51, 65][i]], colors.dim, .32);
      ctx.globalAlpha = 1; ctx.fillStyle = colors.bg; ctx.fillRect(p.x - 7, p.y - 13, label.length * 7 + 14, 21);
      ctx.fillStyle = colors.ink; ctx.fillText(label, p.x, p.y);
    });
    ctx.globalAlpha = 1;
  }

  function syncColors() {
    const style = getComputedStyle(document.documentElement);
    colors = Object.fromEntries(['cold', 'hot', 'dim', 'ink', 'bg'].map(key => [key, style.getPropertyValue('--' + key).trim()]));
    draw();
  }
  function resize() {
    const box = canvas.getBoundingClientRect();
    width = box.width; height = box.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    syncColors();
  }
  function tick(now) {
    frame = 0;
    if (last) time += Math.min((now - last) / 1000, .05);
    last = now; draw();
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function schedule() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  new ResizeObserver(resize).observe(canvas);
  new MutationObserver(syncColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }).observe(canvas);
  document.addEventListener('visibilitychange', schedule);
  resize(); schedule();
})();
