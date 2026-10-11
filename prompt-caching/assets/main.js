(() => {
  'use strict';
  const root = document.documentElement;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.querySelector('[data-motion-toggle]');
  let preference = true;
  try { preference = localStorage.getItem('lucian-motion') !== 'paused'; } catch (_) {}

  function setMotion(value, save = false) {
    preference = value;
    const enabled = value && !media.matches;
    root.dataset.motion = enabled ? 'playing' : 'paused';
    document.body.dataset.motion = root.dataset.motion;
    root.classList.toggle('motion-ready', enabled);
    if (button) {
      button.setAttribute('aria-pressed', String(enabled));
      button.setAttribute('aria-label', media.matches ? '已遵循系统的减少动态效果设置' : enabled ? '暂停动态效果' : '开启动态效果');
      button.disabled = media.matches;
    }
    if (save) { try { localStorage.setItem('lucian-motion', enabled ? 'playing' : 'paused'); } catch (_) {} }
    document.dispatchEvent(new CustomEvent('site-motion', { detail: { enabled } }));
    return enabled;
  }
  window.lucianMotion = { set: setMotion, get enabled() { return root.dataset.motion !== 'paused'; } };
  setMotion(preference);
  button?.addEventListener('click', () => setMotion(!preference, true));
  media.addEventListener('change', () => setMotion(preference));

  const header = document.querySelector('.site-header');
  const headerOffset = () => (header?.offsetHeight || 72) + 20;
  const onScroll = () => header?.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menu = document.querySelector('.site-menu');
  const nav = document.getElementById('site-nav');
  if (menu && nav) {
    const set = open => {
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
      nav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    menu.addEventListener('click', () => set(menu.getAttribute('aria-expanded') !== 'true'));
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { set(false); menu.focus(); }
    });
    matchMedia('(min-width: 861px)').addEventListener('change', event => { if (event.matches) set(false); });
  }

  document.querySelectorAll('a[href^="#"]:not([data-scroll])').forEach(link => link.addEventListener('click', event => {
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + scrollY - headerOffset()), behavior: window.lucianMotion.enabled ? 'smooth' : 'auto' });
    history.replaceState(null, '', link.hash);
  }));

  const reveals = document.querySelectorAll('[data-reveal], .site-footer__sign');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(node => io.observe(node));
  } else {
    reveals.forEach(node => node.classList.add('is-in'));
  }

  // Notes: search and tag filtering share one pass over the rendered list.
  const search = document.getElementById('note-search');
  const tags = document.querySelector('[data-tag-filter]');
  const countNode = document.querySelector('[data-note-count]');
  let tag = 'all';
  function filterNotes() {
    const q = (search?.value || '').trim().toLowerCase();
    let count = 0;
    document.querySelectorAll('.note-row').forEach(row => {
      const match = (tag === 'all' || (row.dataset.tags || '').split(' ').includes(tag)) && (!q || (row.dataset.search || row.textContent).toLowerCase().includes(q));
      row.hidden = !match;
      if (match) count++;
    });
    document.querySelectorAll('.note-month').forEach(group => { group.hidden = !group.querySelector('.note-row:not([hidden])'); });
    const empty = document.querySelector('.notes-empty');
    if (empty) empty.hidden = count > 0;
    if (countNode) countNode.textContent = `${count} 篇`;
  }
  search?.addEventListener('input', filterNotes);
  tags?.addEventListener('click', event => {
    const item = event.target.closest('button');
    if (!item) return;
    tag = item.dataset.tag;
    tags.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === item)));
    filterNotes();
  });

  // Reader: progress line and the current table-of-contents entry.
  const prose = document.querySelector('.reader .prose');
  const bar = document.querySelector('.reading-bar');
  const tocLinks = [...document.querySelectorAll('.reader-toc a')];
  const headings = tocLinks.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
  if (prose && bar) {
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = prose.getBoundingClientRect();
      bar.style.setProperty('--read', Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight * .6))).toFixed(4));
      let current = null;
      headings.forEach(h => { if (h.getBoundingClientRect().top <= headerOffset() + 40) current = h.id; });
      tocLinks.forEach(link => link.hash === '#' + current ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
    };
    addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
    update();
  }
})();
