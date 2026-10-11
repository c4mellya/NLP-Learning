(() => {
  'use strict';
  const dataNode = document.getElementById('pc-data');
  if (!dataNode) return;
  const data = JSON.parse(dataNode.textContent);
  const motionOn = () => (window.lucianMotion ? window.lucianMotion.enabled : !matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* Hero: one digit changes, everything after it loses the cache. */
  const hero = document.getElementById('pc-hero');
  if (hero) {
    const lines = hero.querySelector('[data-hero-lines]');
    const pct = hero.querySelector('[data-hero-pct]');
    const status = hero.querySelector('[data-hero-status]');
    const sceneButtons = [...hero.querySelectorAll('[data-hero-scene]')];
    let scene = 'head', chars = [], fork = 0, tickNode = null, timer = 0, auto = true, visible = true;
    const copy = {
      head: n => `时间戳在最前面：改了 1 个字符，后面 ${n} 个字符全部重新计算。`,
      tail: n => `时间戳在末尾：改动之前的 ${n} 个字符照常命中。`,
    };

    function build(name) {
      scene = name;
      sceneButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.heroScene === name)));
      lines.textContent = '';
      chars = [];
      data.hero[name].forEach(([role, text]) => {
        const row = document.createElement('div');
        row.className = 'pc-hero-row';
        const roleNode = document.createElement('span');
        roleNode.className = 'pc-hero-role';
        roleNode.textContent = role;
        const textNode = document.createElement('span');
        textNode.className = 'pc-hero-text';
        [...text].forEach(ch => {
          if (!ch.trim()) { textNode.append(ch); return; }
          const span = document.createElement('span');
          span.className = 'is-hit';
          if (ch === '§') { span.textContent = '2'; tickNode = span; fork = chars.length; } else span.textContent = ch;
          chars.push(span);
          textNode.append(span);
        });
        row.append(roleNode, textNode);
        lines.append(row);
      });
      pct.textContent = '100%';
      status.textContent = '和上一次请求逐字相同：整段命中。';
    }

    function tick(animate) {
      tickNode.textContent = '7';
      chars.forEach((span, i) => {
        if (i < fork) return;
        span.style.transitionDelay = animate ? `${Math.min(i - fork, 60) * 14}ms` : '0ms';
        span.className = i === fork ? 'is-miss is-fork' : 'is-miss';
      });
      pct.textContent = `${Math.round(fork / chars.length * 100)}%`;
      status.textContent = scene === 'head' ? copy.head(chars.length - fork) : copy.tail(fork);
    }

    function loop() {
      clearTimeout(timer);
      if (!auto || !visible || !motionOn()) return;
      build(scene);
      timer = setTimeout(() => {
        tick(true);
        timer = setTimeout(() => { scene = scene === 'head' ? 'tail' : 'head'; loop(); }, 3600);
      }, 1100);
    }

    function show(name) {
      clearTimeout(timer);
      build(name);
      if (motionOn()) timer = setTimeout(() => tick(true), 500); else tick(false);
    }

    sceneButtons.forEach(button => button.addEventListener('click', () => { auto = false; show(button.dataset.heroScene); }));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && auto) loop(); else if (auto) clearTimeout(timer); }).observe(hero);
    }
    document.addEventListener('site-motion', event => {
      if (event.detail.enabled && auto) loop(); else { clearTimeout(timer); build(scene); tick(false); }
    });
    if (motionOn()) loop(); else { build(scene); tick(false); }
  }

  /* Lab: compare the current request with what the previous requests left in the cache. */
  const lab = document.getElementById('pc-lab');
  if (lab) {
    const MIN = 64;
    const STEP = 8;
    const fields = [...lab.querySelectorAll('[data-seg]')];
    const breakpoints = Object.fromEntries([...lab.querySelectorAll('[data-bp]')].map(box => [box.dataset.bp, box]));
    const providerButtons = [...lab.querySelectorAll('[data-provider]')].filter(node => node.tagName === 'BUTTON');
    const grid = lab.querySelector('[data-grid]');
    const hitNode = lab.querySelector('[data-hit]');
    const totalNode = lab.querySelector('[data-total]');
    const statusNode = lab.querySelector('[data-status]');
    const usageNode = lab.querySelector('[data-usage]');
    const costBox = lab.querySelector('.pc-cost');
    const costFill = lab.querySelector('[data-cost-fill]');
    const costText = lab.querySelector('[data-cost-text]');
    let provider = 'openai';
    let cache = { openai: [], anthropic: [] };
    let lastSent = null;
    let previousStates = [];
    let note = '';
    let pending = 0;

    const tokenize = text => text.match(/[\u3400-\u9fff\uf900-\ufaff]|[A-Za-z0-9_]+|[^\sA-Za-z0-9_\u3400-\u9fff\uf900-\ufaff]/g) || [];
    const common = (a, b) => { let i = 0; const n = Math.min(a.length, b.length); while (i < n && a[i] === b[i]) i++; return i; };
    const keyOf = field => field.dataset.seg;

    function snapshot() {
      const segs = fields.map(field => ({ key: keyOf(field), tokens: tokenize(field.value) }));
      const flat = [];
      const ends = [];
      segs.forEach(seg => { flat.push(...seg.tokens); ends.push(flat.length); });
      const bps = segs.map((seg, i) => (breakpoints[seg.key]?.checked ? ends[i] : 0)).filter(Boolean);
      return { segs, flat, ends, bps };
    }

    function evaluate(req) {
      const total = req.flat.length;
      if (provider === 'openai') {
        let read = 0;
        if (total >= MIN) cache.openai.forEach(entry => {
          const match = Math.floor(common(entry, req.flat) / STEP) * STEP;
          if (match >= MIN) read = Math.max(read, match);
        });
        return { total, read, write: 0, input: total - read };
      }
      const last = req.bps.length ? Math.max(...req.bps) : 0;
      let read = 0;
      cache.anthropic.forEach(entry => {
        if (entry.length <= last && common(entry, req.flat) >= entry.length) read = Math.max(read, entry.length);
      });
      const write = last >= MIN && last > read ? last - read : 0;
      return { total, read, write, input: total - read - write };
    }

    function store(req) {
      const total = req.flat.length;
      if (total >= MIN) cache.openai.push(req.flat.slice(0, Math.floor(total / STEP) * STEP));
      req.bps.filter(bp => bp >= MIN).forEach(bp => cache.anthropic.push(req.flat.slice(0, bp)));
      cache.openai = cache.openai.slice(-6);
      cache.anthropic = cache.anthropic.slice(-12);
      lastSent = req.flat.slice();
    }

    function usageText(r) {
      if (provider === 'openai') {
        return `"usage": {\n  "prompt_tokens": ${r.total},\n  "prompt_tokens_details": {\n    "cached_tokens": ${r.read}\n  }\n}`;
      }
      return `"usage": {\n  "cache_creation_input_tokens": ${r.write},\n  "cache_read_input_tokens": ${r.read},\n  "input_tokens": ${r.input}\n}`;
    }

    function describe(req, r, fork) {
      const hasCache = cache[provider].length > 0;
      if (r.total < MIN) return `总长不足最短可缓存长度（演示为 ${MIN} token），这次不会缓存。`;
      if (provider === 'anthropic' && !req.bps.length) return '没有标记 cache_control：Anthropic 不会缓存这次请求。';
      if (!hasCache) return provider === 'openai'
        ? `没有可用缓存：${r.total} 个 token 全部重新计算，发送后自动缓存。`
        : `没有可用缓存：全部重新计算，并把断点之前的 ${r.write} 个 token 写入缓存。`;
      if (lastSent && fork < r.total) {
        const at = req.ends.findIndex(end => fork < end);
        const label = data.segments[req.segs[at].key].label;
        return `分叉在「${label}」：命中 ${r.read} 个 token，其余 ${r.total - r.read} 个重新计算。`;
      }
      return `和上一次请求完全相同：命中 ${r.read} 个 token。`;
    }

    function render() {
      const req = snapshot();
      const r = evaluate(req);
      const fork = lastSent ? common(lastSent, req.flat) : -1;
      const states = req.flat.map((_, i) => (i < r.read ? 'hit' : i < r.read + r.write ? 'write' : 'miss'));
      const firstChange = states.findIndex((state, i) => state !== previousStates[i]);
      const cells = [];
      grid.textContent = '';
      let index = 0;
      req.segs.forEach(seg => {
        const group = document.createElement('div');
        group.className = 'pc-seg' + (breakpoints[seg.key]?.checked ? ' pc-seg--bp' : '');
        const name = document.createElement('span');
        name.className = 'pc-seg__name';
        name.textContent = `${data.segments[seg.key].grid} · ${seg.tokens.length}`;
        const row = document.createElement('div');
        row.className = 'pc-cells';
        seg.tokens.forEach(() => {
          const cell = document.createElement('i');
          const before = previousStates[index] || states[index];
          cell.className = `pc-cell is-${before}` + (index === fork && fork < req.flat.length ? ' is-fork' : '');
          if (firstChange >= 0 && index >= firstChange) cell.style.setProperty('--d', `${Math.min(index - firstChange, 90) * 4}ms`);
          cells.push(cell);
          row.append(cell);
          index++;
        });
        group.append(name, row);
        grid.append(group);
      });
      void grid.offsetWidth;
      cells.forEach((cell, i) => { cell.classList.remove('is-hit', 'is-write', 'is-miss'); cell.classList.add(`is-${states[i]}`); });
      previousStates = states;

      hitNode.textContent = r.read;
      totalNode.textContent = r.total;
      usageNode.textContent = usageText(r);
      const cost = r.total ? (provider === 'openai' ? r.input + r.read * .25 : r.input + r.write * 1.25 + r.read * .1) / r.total : 1;
      costFill.style.setProperty('--cost', `${Math.min(cost / 1.25, 1) * 100}%`);
      costBox.classList.toggle('is-over', cost > 1);
      costText.textContent = `这次输入成本 ≈ 不用缓存时的 ${Math.round(cost * 100)}%`;
      statusNode.textContent = note || describe(req, r, fork);
      note = '';
    }

    function schedule() { clearTimeout(pending); pending = setTimeout(render, 140); }

    function seed() {
      fields.forEach(field => { field.value = data.segments[keyOf(field)].text; });
      Object.entries(breakpoints).forEach(([key, box]) => { box.checked = key === 'docs'; });
      const question = fields.find(field => keyOf(field) === 'question');
      const current = question.value;
      question.value = data.previousQuestion;
      cache = { openai: [], anthropic: [] };
      store(snapshot());
      question.value = current;
      previousStates = [];
    }

    fields.forEach(field => field.addEventListener('input', schedule));
    Object.values(breakpoints).forEach(box => box.addEventListener('change', () => {
      const checked = Object.values(breakpoints).filter(item => item.checked);
      if (checked.length > 4) { box.checked = false; note = 'Anthropic 一次请求最多 4 个断点。'; }
      render();
    }));
    providerButtons.forEach(button => button.addEventListener('click', () => {
      provider = button.dataset.provider;
      lab.dataset.provider = provider;
      providerButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      render();
    }));

    const field = key => fields.find(item => keyOf(item) === key);
    lab.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => {
      const kind = button.dataset.scenario;
      if (kind === 'stamp') {
        const system = field('system');
        const time = new Date().toTimeString().slice(0, 8);
        system.value = `当前时间：${time}\n` + system.value.replace(/^当前时间：.*\n/, '');
      } else if (kind === 'swap') {
        const tools = field('tools');
        tools.value = tools.value.split('\n').reverse().join('\n');
      } else {
        const question = field('question');
        const list = data.questions;
        question.value = list[(list.indexOf(question.value) + 1) % list.length];
      }
      render();
    }));

    lab.querySelector('[data-send]').addEventListener('click', () => {
      store(snapshot());
      note = '已发送。这次的内容成为下一次请求的缓存，试着再改一处。';
      render();
    });
    lab.querySelector('[data-expire]').addEventListener('click', () => {
      cache = { openai: [], anthropic: [] };
      lastSent = null;
      note = '过了 6 分钟，缓存已过期：下一次请求从头计算。';
      render();
    });
    lab.querySelector('[data-reset]').addEventListener('click', () => {
      seed();
      note = '已恢复示例：上一次请求问的是另一个问题。';
      render();
    });

    seed();
    render();
  }

  /* Agent turns: switch between a stable prefix and a timestamp at the top. */
  const turns = document.getElementById('pc-turns');
  if (turns) {
    const value = turns.querySelector('[data-turns-value]');
    const caption = turns.querySelector('[data-turns-caption]');
    const buttons = [...turns.querySelectorAll('[data-turns]')];
    buttons.forEach(button => button.addEventListener('click', () => {
      const scenario = button.dataset.turns;
      turns.dataset.scenario = scenario;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      value.textContent = `${data.turnPercent[scenario]}%`;
      caption.textContent = scenario === 'stable'
        ? '8 轮累计输入成本，相对完全不用缓存。'
        : '8 轮累计输入成本：每轮都写入缓存，却从未读到，比不用缓存还贵。';
    }));
  }

  /* Practice: SDK tabs and copy. */
  const tabs = [...document.querySelectorAll('.pc-tabs [role="tab"]')];
  const select = tab => {
    tabs.forEach(item => {
      const on = item === tab;
      item.setAttribute('aria-selected', String(on));
      item.tabIndex = on ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in map)) return;
      event.preventDefault();
      const next = tabs[(map[event.key] + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  });

  const copyStatus = document.querySelector('[data-copy-status]');
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const text = document.getElementById(button.dataset.copy)?.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = '已复制';
      button.classList.add('is-copied');
      if (copyStatus) copyStatus.textContent = '代码已复制';
    } catch (_) {
      button.textContent = '复制失败';
      if (copyStatus) copyStatus.textContent = '复制失败，请手动选择代码';
    }
    setTimeout(() => { button.textContent = '复制代码'; button.classList.remove('is-copied'); }, 1800);
  }));
})();
