const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'ai-daily/daily.js'), 'utf8');
const fixture = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/ai-daily', name), 'utf8'));

function node(tag = 'div') {
  const item = {
    tag, children: [], dataset: {}, attributes: {}, hidden: false, className: '',
    appendChild(child) { this.children.push(child); return child; },
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, callback) { (this.events ??= {})[name] = callback; },
    scrollIntoView() { this.scrolledIntoView = true; }
  };
  item.classList = { add(name) { item.className += ` ${name}`; } };
  Object.defineProperty(item, 'childNodes', { get() { return item.children; } });
  return item;
}

function descendants(parent, predicate) {
  return parent.children.flatMap((child) => [
    ...(predicate(child) ? [child] : []),
    ...(child.children ? descendants(child, predicate) : [])
  ]);
}

async function open(search = '', files = {}) {
  const ids = ['daily-list', 'daily-select', 'daily-title', 'daily-date', 'daily-head-meta',
    'daily-status', 'daily-latest', 'daily-toc', 'daily-toc-links', 'daily-content', 'daily-overview'];
  const nodes = Object.fromEntries(ids.map((id) => [id, node()]));
  const requests = [];
  const document = {
    title: '', getElementById: (id) => nodes[id], createElement: node,
    createTextNode: (textContent) => ({ tag: '#text', textContent, children: [] })
  };
  const location = new URL(`https://example.com/ai-daily/${search}`);
  location.assign = function (url) { this.assigned = url; };
  const data = { 'index.json': fixture('index.json'),
    'data/2026-09-29.json': fixture('2026-09-29.json'),
    'data/2026-09-28.json': fixture('2026-09-28.json'), ...files };
  const fetch = async (url, options) => {
    requests.push({ url, cache: options.cache });
    const file = url.split('?')[0];
    if (!(file in data)) return { ok: false, status: 404 };
    return { ok: true, status: 200, json: async () => data[file] };
  };
  vm.runInNewContext(script, { document, location, fetch, URL, URLSearchParams, Intl, Date, Number, Set });
  await new Promise(setImmediate);
  return { nodes, requests, document, location };
}

(async () => {
  let page = await open();
  assert.deepEqual(page.requests.map((request) => request.url.split('?')[0]), ['index.json', 'data/2026-09-29.json']);
  assert.equal(page.requests[0].cache, 'no-store');
  assert.equal(page.requests[1].cache, 'no-store');
  assert.match(page.requests[0].url, /^index\.json\?refresh=\d+$/);
  assert.equal(page.nodes['daily-date'].textContent, '2026年9月29日');
  assert.equal(page.nodes['daily-list'].children.filter((item) => item.tag === 'a').length, 2);
  assert.equal(page.nodes['daily-list'].children.find((item) => item.tag === 'a').attributes['aria-current'], 'page');
  const sections = page.nodes['daily-content'].children;
  assert.deepEqual(sections.map((section) => section.id), [
    'daily-glance', 'daily-top', 'daily-openai', 'daily-claude', 'daily-deepseek',
    'daily-other', 'daily-editor', 'daily-meta'
  ]);
  assert.equal(page.nodes['daily-toc-links'].children.length, sections.length);
  assert.equal(descendants(sections[1], (item) => item.className === 'daily-item').length, 3);
  assert.ok(descendants(sections[1], (item) => item.dataset?.kind === 'uncertain').length);
  assert.ok(descendants(sections[2], (item) => item.textContent === 'OpenAI员工动态').length);
  assert.ok(descendants(sections[6], (item) => item.textContent?.includes('编辑分析区域')).length);

  assert.equal(page.nodes['daily-overview'].hidden, false);
  assert.ok(page.nodes['daily-overview'].children.every((link) => sections.some((section) => `#${section.id}` === new URL(link.href).hash)));
  assert.ok(page.nodes['daily-overview'].children.every((link) => new URL(link.href).searchParams.get('date') === '2026-09-29'));
  const longReport = fixture('2026-09-29.json');
  const fullSummary = '先读这一句。' + '这是应当完整保留的新闻详情。'.repeat(20);
  longReport.top5[0].summary = fullSummary;
  const longPage = await open('', { 'data/2026-09-29.json': longReport });
  const topSection = longPage.nodes['daily-content'].children.find((section) => section.id === 'daily-top');
  const firstCard = descendants(topSection, (item) => item.className === 'daily-item')[0];
  assert.equal(descendants(firstCard, (item) => item.className === 'daily-item-summary').map((item) => item.textContent).join(''), fullSummary);
  assert.equal(descendants(firstCard, (item) => item.tag === 'details').length, 0);
  assert.ok(firstCard.children.filter((item) => item.className === 'daily-item-summary').length > 1);

  page = await open('?date=2026-09-28');
  assert.deepEqual(page.requests.map((request) => request.url.split('?')[0]), ['index.json', 'data/2026-09-28.json']);
  assert.equal(page.requests[1].cache, 'default');
  assert.equal(page.nodes['daily-date'].textContent, '2026年9月28日');
  assert.ok(!page.nodes['daily-content'].children.some((section) => section.id === 'daily-other'));
  assert.ok(!page.nodes['daily-content'].children.some((section) => section.id === 'daily-editor'));
  assert.equal(descendants(page.nodes['daily-content'].children.find((section) => section.id === 'daily-top'), (item) => item.className === 'daily-item').length, 2);
  assert.ok(descendants(page.nodes['daily-content'], (item) => item.textContent === '今日暂无值得单独报道的重大更新。').length);
  const sourceLinks = descendants(page.nodes['daily-content'], (item) => item.tag === 'a' && item.href?.includes('example.com/'));
  assert.ok(sourceLinks.length >= 2);
  assert.ok(sourceLinks.every((link) => link.target === '_blank' && link.rel === 'noopener noreferrer'));
  page.nodes['daily-select'].value = '2026-09-29';
  page.nodes['daily-select'].events.change();
  assert.equal(page.location.assigned, '?date=2026-09-29');

  // 按实际 HTML 的 base 解析链接，再重新打开：旧日报的日期和章节必须同时保留。
  const html = fs.readFileSync(path.join(root, 'ai-daily/index.html'), 'utf8');
  const base = new URL(html.match(/<base href="([^"]+)"/)[1], page.location.href);
  for (const link of [...page.nodes['daily-toc-links'].children, ...page.nodes['daily-overview'].children]) {
    const url = new URL(link.href, base);
    assert.equal(url.searchParams.get('date'), '2026-09-28');
    assert.equal(url.pathname, page.location.pathname);
    const reopened = await open(url.search + url.hash);
    assert.equal(reopened.nodes['daily-date'].dateTime, '2026-09-28');
    const target = reopened.nodes['daily-content'].children.find((section) => `#${section.id}` === url.hash);
    assert.ok(target?.scrolledIntoView, `Missing deep-link target: ${url.href}`);
  }

  page = await open('?date=../secret');
  assert.equal(page.requests.length, 1);
  assert.equal(page.nodes['daily-status'].textContent, '未找到该日期的 AI 日报');
  assert.equal(page.nodes['daily-latest'].hidden, false);

  page = await open('', { 'index.json': null });
  assert.equal(page.nodes['daily-status'].textContent, '日报数据暂时无法读取');
  page = await open('', { 'data/2026-09-29.json': { date: 'wrong' } });
  assert.equal(page.nodes['daily-status'].textContent, '日报数据暂时无法读取');
  page = await open('', { 'index.json': { latest: null, entries: [] } });
  assert.equal(page.nodes['daily-status'].textContent, 'AI 日报暂未生成');

  console.log('AI Daily fixtures, navigation, TOC, statuses, sources, empty fields, errors and cache checks passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
