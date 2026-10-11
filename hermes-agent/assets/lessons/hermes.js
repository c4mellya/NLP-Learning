/* Hermes visual lesson: local teaching simulations only. No API requests or command execution. */
(() => {
  'use strict';
  const root = document.querySelector('.hermes-lab');
  const dataNode = document.getElementById('hx-lesson-data');
  if (!root || !dataNode) return;
  const data = JSON.parse(dataNode.textContent);
  const $ = (selector, parent = root) => parent.querySelector(selector);
  const $$ = (selector, parent = root) => [...parent.querySelectorAll(selector)];
  const byId = (id) => document.getElementById(id);
  const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = {
    get matches() { return motionMedia.matches || document.documentElement.dataset.motion === 'paused'; },
    addEventListener(type, listener) {
      motionMedia.addEventListener(type, listener);
      document.addEventListener('site-motion', listener);
    }
  };
  const mobile = matchMedia('(max-width: 720px)');
  const narrow = matchMedia('(max-width: 900px)');

  // Tabs keep their established IDs and have full arrow/Home/End keyboard support.
  function tabs(selector, activate) {
    const items = $$(selector);
    const set = (button, animate = true) => {
      items.forEach((item) => {
        const selected = item === button;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        item.classList.toggle('active', selected);
      });
      const panel = byId(button.getAttribute('aria-controls'));
      if (panel) panel.setAttribute('aria-labelledby', button.id);
      activate(button, animate);
    };
    items.forEach((button, index) => {
      button.addEventListener('click', () => set(button));
      button.addEventListener('keydown', (event) => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % items.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + items.length - 1) % items.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = items.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        items[next].focus({ preventScroll: true });
        set(items[next]);
      });
    });
    if (items.length) set(items.find((item) => item.getAttribute('aria-selected') === 'true') || items[0], false);
    return set;
  }
  function transition(node) {
    if (!node || motion.matches) return;
    node.classList.remove('hx-state-change');
    // Only the small changed content animates, never a whole reading section.
    requestAnimationFrame(() => node.classList.add('hx-state-change'));
  }

  tabs('[data-install]', (button, animate) => {
    const item = data.install[button.dataset.install];
    byId('hx-install-shell').textContent = item.shell;
    byId('hx-install-command').textContent = item.code;
    byId('hx-install-verify').textContent = item.verify;
    byId('hx-install-note').textContent = item.note;
    if (animate) transition(byId('hx-install-command'));
  });

  $$('[data-diagnostic]').forEach((button) => button.addEventListener('click', () => {
    const ready = button.dataset.diagnostic === 'ready';
    byId('hx-diagnostic').dataset.state = ready ? 'ready' : 'path';
    $$('[data-diagnostic]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    $$('.hx-check-dot').forEach((dot, i) => { dot.textContent = ready ? '✓' : (i === 0 ? '×' : '–'); });
    byId('hx-diagnostic-status').textContent = ready
      ? '演示：命令入口与启动链路可用。'
      : '演示：command not found。重开终端，检查命令入口与 PATH，再执行诊断。';
  }));

  let dialogueIndex = 0;
  const setDialogue = tabs('[data-dialogue]', (button, animate) => {
    dialogueIndex = Number(button.dataset.dialogue);
    const item = data.dialogue[dialogueIndex];
    byId('hx-dialogue-code').textContent = item.code;
    byId('hx-dialogue-kind').textContent = item.kind;
    byId('hx-dialogue-note').textContent = item.note;
    const lines = byId('hx-dialogue-lines');
    lines.replaceChildren();
    item.lines.forEach((line) => {
      const row = document.createElement('div');
      row.className = 'hx-dialogue-row';
      const key = document.createElement('span');
      key.textContent = line.key;
      const text = document.createElement('p');
      text.textContent = line.text;
      row.append(key, text);
      lines.append(row);
    });
    byId('hx-dialogue-next').firstChild.textContent = dialogueIndex === 3 ? '回到配置 ' : '下一步 ';
    if (animate) transition(lines);
  });
  byId('hx-dialogue-next').addEventListener('click', () => {
    setDialogue($(`[data-dialogue="${(dialogueIndex + 1) % data.dialogue.length}"]`));
  });

  const wirePaths = {
    provider: 'M100 155C160 155 160 70 245 70',
    model: 'M100 155C160 155 160 70 245 70H490',
    endpoint: 'M100 155C160 155 160 244 245 244',
    auth: 'M100 155C160 155 160 244 245 244H405',
    mode: 'M100 155C160 155 160 244 245 244H565',
  };
  $$('[data-connect]').forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.connect;
    const item = data.connections[key];
    $$('[data-connect]').forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
    const board = byId('hx-wiring');
    board.dataset.active = key;
    byId('hx-active-wire').setAttribute('d', wirePaths[key]);
    byId('hx-connection-title').textContent = item.title;
    byId('hx-connection-body').textContent = item.body;
    byId('hx-connection-field').textContent = item.field;
    byId('hx-connection-value').textContent = item.value;
    if (!motion.matches) {
      board.classList.remove('is-switching');
      requestAnimationFrame(() => board.classList.add('is-switching'));
    }
  }));

  tabs('[data-cmd]', (button, animate) => {
    const item = data.commands[button.dataset.cmd];
    byId('hx-cmd-entry').textContent = item.label;
    byId('cmd-output').textContent = item.output;
    byId('cmd-role').textContent = item.role;
    byId('cmd-note').textContent = item.note;
    if (animate) transition(byId('cmd-output'));
  });
  tabs('[data-file]', (button, animate) => {
    const item = data.files[button.dataset.file];
    byId('file-name').textContent = button.dataset.file;
    byId('file-code').textContent = item.code;
    byId('file-desc').textContent = item.desc;
    byId('hx-file-tag').textContent = item.tag;
    byId('file-panel').dataset.secret = String(item.secret);
    if (animate) transition(byId('file-code'));
  });

  // Clipboard has an explicit failure path; never report success if permission fails.
  let toastTimer;
  function toast(message) {
    const node = byId('hx-toast');
    clearTimeout(toastTimer);
    node.textContent = message;
    node.classList.add('is-visible');
    toastTimer = setTimeout(() => node.classList.remove('is-visible'), 3200);
  }
  $$('[data-copy]').forEach((button) => {
    const label = $('span', button);
    const original = label.textContent;
    let resetTimer;
    button.addEventListener('click', async () => {
      const target = byId(button.dataset.copy);
      if (!target) return;
      clearTimeout(resetTimer);
      button.disabled = true;
      try {
        if (!navigator.clipboard || !isSecureContext) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(target.textContent);
        button.classList.add('is-copied');
        label.textContent = '已复制';
        toast('已复制教学命令 / 示例。');
        resetTimer = setTimeout(() => { label.textContent = original; button.classList.remove('is-copied'); }, 1800);
      } catch {
        label.textContent = original;
        button.classList.remove('is-copied');
        const selection = getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(target);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        toast(selection
          ? '无法自动复制，已选中内容。请按 Ctrl+C（macOS：⌘C）。'
          : '无法自动复制。请先选中内容，再按 Ctrl+C（macOS：⌘C）。');
      } finally {
        button.disabled = false;
      }
    });
  });

  // Hero: one user-triggered preview, with the same CSV and states as the main workbench.
  let heroGeneration = 0;
  let heroPlaying = false;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  function heroState(index) {
    const item = data.loop[index];
    byId('hx-hero-demo').dataset.phase = String(index);
    byId('hx-hero-line').textContent = item.caption;
    byId('hx-hero-status').textContent = index === 4 ? '演示完成 · 产物已读回核对' : `演示中 · ${item.label}`;
  }
  function stopHero() {
    heroGeneration++;
    heroPlaying = false;
    byId('hx-hero-demo').classList.remove('is-playing');
    byId('hx-hero-play').disabled = false;
  }
  byId('hx-hero-play').addEventListener('click', async () => {
    stopHero();
    const generation = heroGeneration;
    heroPlaying = true;
    byId('hx-hero-play').disabled = true;
    if (motion.matches) {
      heroState(4);
      stopHero();
      return;
    }
    byId('hx-hero-demo').classList.add('is-playing');
    for (let i = 0; i < data.loop.length; i++) {
      if (generation !== heroGeneration) return;
      heroState(i);
      await wait(800);
    }
    if (generation === heroGeneration) stopHero();
  });

  // Real scrollytelling: the pinned figure changes with the explanatory step in view.
  let following = !mobile.matches;
  let phase = -1;
  let loopGeneration = 0;
  let loopPlaying = false;
  const followButton = byId('hx-follow');
  const phaseButtons = $$('[data-loop-phase]');
  const storySteps = $$('[data-story-phase]');
  function setFollow(value) {
    following = value;
    followButton.setAttribute('aria-pressed', String(value));
    followButton.textContent = value ? '随滚动推进' : '启用滚动推进';
  }
  function setPhase(index, announce = false) {
    if (index === phase) return;
    phase = index;
    const item = data.loop[index];
    const stage = byId('hx-loop-stage');
    stage.dataset.phase = String(index);
    stage.style.setProperty('--hx-flow-offset', String(-index / data.loop.length));
    byId('hx-loop-stage-label').textContent = item.label;
    byId('hx-loop-tool').textContent = item.tool;
    byId('hx-loop-file-name').textContent = item.file;
    byId('hx-loop-file-state').textContent = ['待处理', '已读取', '计算完成', '已写入', '已核对'][index];
    byId('hx-loop-log').textContent = item.log;
    byId('hx-loop-caption').textContent = item.caption;
    phaseButtons.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.loopPhase) === index)));
    storySteps.forEach((step) => step.classList.toggle('is-current', Number(step.dataset.storyPhase) === index));
    if (announce) byId('hx-loop-status').textContent = `教学演示：${item.label}。${item.caption}`;
  }
  function stopLoop() {
    loopGeneration++;
    loopPlaying = false;
    byId('hx-loop-replay').disabled = false;
  }
  phaseButtons.forEach((button) => button.addEventListener('click', () => {
    stopLoop();
    setFollow(false);
    setPhase(Number(button.dataset.loopPhase), true);
  }));
  followButton.addEventListener('click', () => {
    stopLoop();
    setFollow(!following);
    scheduleRead();
  });
  byId('hx-loop-replay').addEventListener('click', async () => {
    stopLoop();
    setFollow(false);
    const generation = loopGeneration;
    loopPlaying = true;
    byId('hx-loop-replay').disabled = true;
    if (motion.matches) {
      setPhase(4, true);
      stopLoop();
      return;
    }
    for (let i = 0; i < data.loop.length; i++) {
      if (generation !== loopGeneration) return;
      setPhase(i, true);
      await wait(1100);
    }
    if (generation === loopGeneration) stopLoop();
  });
  setFollow(following);
  setPhase(0);

  // Read progress + chapter tracking share a single requestAnimationFrame per scroll event.
  const chapters = $$('.hx-chapter');
  const chapterLinks = $$('[data-chapter-link]');
  const article = $('.hx-lessons');
  const header = $('.site-header');
  let pendingFrame = 0;
  function updateRead() {
    pendingFrame = 0;
    const headerHeight = header ? header.getBoundingClientRect().height : 82;
    const threshold = headerHeight + 72;
    let current = '';
    chapters.forEach((chapter) => {
      if (chapter.getBoundingClientRect().top <= threshold) current = chapter.id;
    });
    chapterLinks.forEach((link) => {
      if (link.hash === '#' + current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const rect = article.getBoundingClientRect();
    const length = Math.max(1, rect.height - innerHeight + headerHeight);
    const progress = Math.min(1, Math.max(0, (headerHeight - rect.top) / length));
    byId('hx-reading-fill').style.transform = `scaleX(${progress})`;
    if (following && !loopPlaying) {
      let visiblePhase = 0;
      const line = headerHeight + Math.min(220, innerHeight * .3);
      storySteps.forEach((step) => {
        if (step.getBoundingClientRect().top <= line) visiblePhase = Number(step.dataset.storyPhase);
      });
      setPhase(visiblePhase);
    }
  }
  function scheduleRead() { if (!pendingFrame) pendingFrame = requestAnimationFrame(updateRead); }
  function resize() {
    root.style.setProperty('--hx-header-height', `${header ? header.getBoundingClientRect().height : 82}px`);
    scheduleRead();
  }
  const toc = byId('hx-toc');
  function tocMode() { toc.open = !narrow.matches; }
  tocMode();
  narrow.addEventListener('change', tocMode);
  mobile.addEventListener('change', () => { setFollow(!mobile.matches); resize(); });
  chapterLinks.forEach((link) => link.addEventListener('click', () => {
    if (narrow.matches) toc.open = false;
  }));
  addEventListener('scroll', scheduleRead, { passive: true });
  addEventListener('resize', resize, { passive: true });
  addEventListener('pageshow', resize);
  if ('ResizeObserver' in window && header) new ResizeObserver(resize).observe(header);
  resize();

  // Pause scripted playback when hidden or when reduced motion is enabled mid-replay.
  function settlePlayback() {
    if (heroPlaying) { heroState(4); stopHero(); }
    if (loopPlaying) { setPhase(4, true); stopLoop(); }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) settlePlayback(); });
  motion.addEventListener('change', () => { if (motion.matches) settlePlayback(); });
})();
