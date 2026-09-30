import { createScope } from '../lib/resourceScope.js';
export function mountHome(root) {
 const resources = createScope();
  'use strict';
  const filters = [...root.querySelectorAll('[data-filter]')];
  const cards = [...root.querySelectorAll('[data-category]')];
  filters.forEach(button => resources.on(button, 'click', () => {
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
    const count = cards.filter(card => !card.hidden).length;
    root.querySelector('.filter-status').textContent = button.dataset.filter === 'all' ? '显示全部 ' + count + ' 篇笔记' : '显示 ' + count + ' 篇 ' + button.textContent + ' 笔记';
  }));

  const descriptions = {
    nlp: '从词语之间的关系，理解语言的意义。',
    llm: '从上下文中的模式，探索生成与推理。',
    agent: '让模型连接工具，把理解变成行动。'
  };
  const concepts = [...root.querySelectorAll('[data-concept]')];
  let concept = 0;
  concepts.forEach((button, index) => resources.on(button, 'click', () => {
    concept = index;
    concepts.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    root.querySelector('#' + 'concept-description').textContent = descriptions[button.dataset.concept];
    draw();
  }));

  const canvas = root.querySelector('#' + 'learning-network');
  const ctx = canvas.getContext('2d');
  const motion = root.querySelector('.motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, visible = true, frame = 0, time = 0, last = 0;
  let width = 0, height = 0, color = '#294ae5', line = '#d3d8e3';
  function paintMotion() {
    motion.setAttribute('aria-pressed', String(paused));
    motion.setAttribute('aria-label', paused ? '播放知识球动画' : '暂停知识球动画');
    motion.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
  }
  function project(theta, phi) {
    const folds = [3, 5, 4][concept];
    const r = 1 + .105 * Math.sin(theta * folds + phi * 2);
    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.cos(theta);
    const z = r * Math.sin(theta) * Math.sin(phi);
    const angle = time * .11 + .55 + concept * .5;
    const rx = x * Math.cos(angle) + z * Math.sin(angle);
    const rz = -x * Math.sin(angle) + z * Math.cos(angle);
    const ry = y * Math.cos(.32) - rz * Math.sin(.32);
    const depth = y * Math.sin(.32) + rz * Math.cos(.32);
    const scale = Math.min(width * .32, height * .37) * 4 / (4 - depth);
    return [width * .5 + rx * scale, height * .49 + ry * scale, depth];
  }
  function curve(points) {
    ctx.beginPath();
    points.forEach((p, i) => { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
    ctx.stroke();
  }
  function draw() {
    if (!ctx || !width) return;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = line; ctx.lineWidth = .6; ctx.globalAlpha = .65;
    ctx.setLineDash([2, 5]);
    curve([[width*.08,height*.78],[width*.94,height*.18]]);
    curve([[width*.48,height*.03],[width*.48,height*.95]]);
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.ellipse(width*.5,height*.49,Math.min(width*.39,height*.45),height*.435,-.3,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = .65;
    for (let meridian = 0; meridian < 58; meridian++) {
      const phi = meridian / 58 * Math.PI * 2;
      const points = [];
      for (let i = 0; i <= 90; i++) points.push(project(i / 90 * Math.PI, phi));
      const front = points[45][2] > 0;
      ctx.globalAlpha = front ? .75 : .22;
      curve(points);
    }
    for (let parallel = 1; parallel < 32; parallel++) {
      const points = [];
      for (let i = 0; i <= 130; i++) points.push(project(parallel / 32 * Math.PI, i / 130 * Math.PI * 2));
      ctx.globalAlpha = .48; curve(points);
    }
    ctx.globalAlpha = 1; ctx.fillStyle = color;
    [[.14,.39],[.79,.1],[.82,.73]].forEach(([x,y]) => ctx.fillRect(width*x,height*y,4,4));
    for (let i = 0; i < 3; i++) {
      const p = project(.8 + i * .67, time * .18 + i * 2.1);
      ctx.beginPath(); ctx.arc(p[0],p[1],3.5,0,Math.PI*2); ctx.fill();
    }
  }
  function resize() {
    const box = canvas.getBoundingClientRect();
    width = box.width; height = box.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    if (ctx) ctx.setTransform(dpr,0,0,dpr,0,0);
    syncColors();
  }
  function syncColors() {
    const style = getComputedStyle(document.documentElement);
    color = style.getPropertyValue('--cold').trim();
    line = style.getPropertyValue('--line2').trim();
    draw();
  }
  function tick(now) {
    frame = 0;
    if (last) time += Math.min((now - last) / 1000, .05);
    last = now; draw();
    if (!paused && visible && !document.hidden) frame = resources.frame(tick);
  }
  function schedule() {
    resources.cancelFrame(frame); frame = 0; last = 0;
    if (!paused && visible && !document.hidden) frame = resources.frame(tick);
    else draw();
  }
  resources.on(motion, 'click', () => { paused = !paused; paintMotion(); schedule(); });
  resources.on(reduced, 'change', () => { paused = reduced.matches; paintMotion(); schedule(); });
  resources.observer(ResizeObserver, resize).observe(canvas);
  resources.observer(MutationObserver, syncColors).observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
  resources.observer(IntersectionObserver, entries => { visible = entries[0].isIntersecting; schedule(); }).observe(canvas);
  resources.on(document, 'visibilitychange', schedule);
  paintMotion(); resize(); schedule();
return resources.dispose;
}
