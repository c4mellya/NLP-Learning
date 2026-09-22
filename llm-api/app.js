(function () {
  'use strict';

  /* ================= 基础设施 ================= */
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = reduceMQ.matches;
  if (reduceMQ.addEventListener) {
    reduceMQ.addEventListener('change', function (e) { reduced = e.matches; });
  }

  function el(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function sleep(ms) { return new Promise(function (res) { setTimeout(res, reduced ? 0 : ms); }); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  /* 任何不可计算的输入都退化成「—」，页面上不出现 NaN */
  function fmt(n) { return (typeof n === 'number' && isFinite(n)) ? Math.round(n).toLocaleString('en-US') : '—'; }
  function money(n) { return (typeof n === 'number' && isFinite(n)) ? n : 0; }
  function flash(node) {
    if (!node || reduced) return;
    node.classList.remove('flash');
    void node.offsetWidth;
    node.classList.add('flash');
  }

  /* ================= 示意分词（F7） =================
     CJK 连续单字逐字成 token；ASCII 单词整体成 token；标点/符号单独成 token。
     仅用于可视化，不代表任何真实 tokenizer。 */
  var TOK_RE = /[\u3400-\u4dbf\u4e00-\u9fff]|[A-Za-z0-9_]+|[^\s]/g;
  function tokenize(text) {
    var s = String(text == null ? '' : text).replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n/g, ' \u23ce ');
    var out = [];
    var m;
    TOK_RE.lastIndex = 0;
    while ((m = TOK_RE.exec(s)) !== null) {
      out.push(m[0]);
      if (m.index === TOK_RE.lastIndex) TOK_RE.lastIndex++;
    }
    return out;
  }

  function renderTape(node, tokens) {
    node.textContent = '';
    var frag = document.createDocumentFragment();
    var cells = [];
    tokens.forEach(function (tk) {
      var c = document.createElement('span');
      c.className = 'tok';
      c.textContent = tk;
      frag.appendChild(c);
      cells.push(c);
    });
    node.appendChild(frag);
    return cells;
  }

  /* ================= hero：示波器 + TTL（F6） ================= */
  var DEMO_PROMPT = '你是一名企业合规助手。请只依据用户提供的合同原文回答问题，不要引用外部法条；金额保留两位小数并注明币种；拿不准时回答「无法确定」并说明缺少什么信息。\n合同原文：《云服务采购协议》甲方购买乙方云服务，合同总额 120 万元；违约金为合同总额的 5%；争议提交甲方所在地法院管辖。\n问题：违约金条款是否有效？';

  var HERO_TOKENS = 16;            /* 示意带长度：为可读性只画 16 格 */
  var HERO_W = 1.25;               /* Anthropic 5 分钟档写价 [1] */
  var HERO_R = 0.1;                /* Anthropic 5 分钟档读价 [1] */
  var TTL_SECONDS = 300;           /* 5 分钟档 */

  var heroCells1 = null, heroCells2 = null, heroPlayed = false, heroGen = 0, heroBusy = false;
  var heroEquivNow = 0;

  var scope = { samples: [], raf: 0, last: 0, state: 'idle', until: 0 };

  function heroRender() {
    var toks = tokenize(DEMO_PROMPT).slice(0, HERO_TOKENS);
    heroCells1 = renderTape(el('heroTape1'), toks);
    heroCells2 = renderTape(el('heroTape2'), toks);
  }

  function heroClear() {
    [heroCells1, heroCells2].forEach(function (cs) {
      (cs || []).forEach(function (c) { c.className = 'tok'; c.style.animationDelay = ''; });
    });
  }

  /* 示波器是 canvas 绘制，取不到 CSS 变量，主题切换时把色值读进来缓存 */
  var themeColors = {
    amber: '#FFB224', ice: '#62C6F5', dead: '#8298A9',
    grid: 'rgba(98,198,245,.12)', refW: 'rgba(98,198,245,.30)', refR: 'rgba(255,178,36,.30)'
  };
  function readThemeColors() {
    var cs = getComputedStyle(document.documentElement);
    function v(name, fallback) {
      var x = cs.getPropertyValue(name);
      x = x ? x.trim() : '';
      return x || fallback;
    }
    themeColors.amber = v('--amber', themeColors.amber);
    themeColors.ice = v('--ice', themeColors.ice);
    themeColors.dead = v('--dim', themeColors.dead);
    themeColors.grid = v('--scope-grid', themeColors.grid);
    themeColors.refW = v('--scope-ref-w', themeColors.refW);
    themeColors.refR = v('--scope-ref-r', themeColors.refR);
  }

  function scopeColor(state) {
    if (state === 'hit') return themeColors.amber;
    if (state === 'expired') return themeColors.dead;
    return themeColors.ice;
  }

  function drawScope() {
    var c = el('heroWave');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d');
    if (!ctx) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = c.clientWidth || 320, h = c.clientHeight || 124;
    var pw = Math.round(w * dpr), ph = Math.round(h * dpr);
    if (c.width !== pw || c.height !== ph) { c.width = pw; c.height = ph; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var top = 6, bottom = h - 6, span = bottom - top;
    ctx.strokeStyle = themeColors.grid;
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var y = Math.round(top + span * g / 4) + 0.5;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    /* 参考线：1.25× 与 0.1× 的高度 */
    [1.25, 0.1].forEach(function (amp) {
      var ry = Math.round(bottom - (amp / 1.25) * span) + 0.5;
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = amp === 1.25 ? themeColors.refW : themeColors.refR;
      ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(w, ry); ctx.stroke();
      ctx.restore();
    });

    var s = scope, n = s.samples.length;
    if (n > 1) {
      var col = scopeColor(s.state);
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.shadowColor = col;
      ctx.shadowBlur = 7;
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var x = (i / (s.samples.length - 1)) * w;
        var amp = s.samples[i];
        var yy = bottom - (amp / 1.25) * span;
        if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      var lastX = w, lastY = bottom - (s.samples[n - 1] / 1.25) * span;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(lastX - 2, lastY, 2.6, 0, Math.PI * 2); ctx.fill();
    }
  }

  function pushSample(amp) {
    scope.samples.push(clamp(amp, 0, 1.25));
    if (scope.samples.length > 104) scope.samples.shift();
  }

  function scopeFrame(t) {
    if (!scope.last) scope.last = t;
    var dt = t - scope.last;
    if (dt >= 26) {
      scope.last = t;
      var amp = (scope.state === 'hit') ? HERO_R : (scope.state === 'expired' ? 0.02 : HERO_W);
      pushSample(amp + (Math.random() - 0.5) * 0.05);
      drawScope();
    }
    if (t < scope.until) { scope.raf = requestAnimationFrame(scopeFrame); }
    else { scope.raf = 0; }
  }

  function scopeRun(state, ms) {
    scope.state = state;
    scope.until = performance.now() + (reduced ? 0 : (ms || 1400));
    if (reduced) {
      scope.samples = [];
      for (var i = 0; i < 104; i++) {
        var amp = (state === 'hit') ? HERO_R : (state === 'expired' ? 0.02 : HERO_W);
        pushSample(amp + (Math.random() - 0.5) * 0.05);
      }
      drawScope();
      return;
    }
    if (!scope.raf) { scope.last = 0; scope.raf = requestAnimationFrame(scopeFrame); }
  }

  function setHeroReadouts(state, equivTarget) {
    var peak = el('heroPeak');
    peak.className = 'oscope-peak' + (state === 'hit' ? ' is-amber' : (state === 'expired' ? ' is-dead' : ''));
    peak.textContent = state === 'hit' ? 'PEAK 0.10× · READ' : (state === 'expired' ? 'PEAK — · EXPIRED' : 'PEAK 1.25× · WRITE');
    el('heroMultW').textContent = HERO_W + '×';
    el('heroMultR').textContent = HERO_R + '×';
    el('heroGap').textContent = (HERO_W / HERO_R) + '×';
    animateNum(el('heroEquiv'), heroEquivNow, equivTarget, 620);
    heroEquivNow = equivTarget;
    flash(el('heroRdE'));
    if (state === 'hit') flash(el('heroRdR')); else flash(el('heroRdW'));
  }

  function animateNum(node, from, to, dur) {
    if (!node) return;
    if (reduced || !isFinite(to)) { node.textContent = to.toFixed(1); return; }
    var t0 = performance.now();
    function step(t) {
      var k = clamp((t - t0) / dur, 0, 1);
      var e = 1 - Math.pow(1 - k, 3);
      var v = from + (to - from) * e;
      node.textContent = isFinite(v) ? v.toFixed(1) : '0.0';
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- TTL 倒计时 ---- */
  var ttl = { deadline: 0, running: false, expired: true };

  function ttlRender(remain) {
    var sec = Math.max(0, Math.ceil(remain / 1000));
    var mm = Math.floor(sec / 60), ss = sec % 60;
    el('heroTtlClock').textContent = mm + ':' + (ss < 10 ? '0' : '') + ss;
    var pct = clamp(remain / (TTL_SECONDS * 1000), 0, 1) * 100;
    var fill = el('heroTtlFill');
    fill.style.width = pct + '%';
    fill.classList.toggle('is-warn', pct < 25);
    el('heroTtlNote').textContent = pct < 25 && remain > 0
      ? 'TTL 即将归零：再不命中就要冷启动、重新按写价写入整段。'
      : '倒计时从「写入」起算；归零后同一前缀需按写入价格重新建立缓存（冷启动）。';
  }

  function ttlExpire() {
    ttl.expired = true;
    ttl.running = false;
    ttlRender(0);
    el('heroTtlNote').textContent = 'TTL 已过期：同一前缀需按写入价格重新建立缓存（冷启动），此前的命中读数不再适用于下一次请求。';
    scopeRun('expired', reduced ? 0 : 1600);
    if (!heroBusy) {
      var st = el('heroStatus');
      st.textContent = 'EXPIRED · TTL 归零，需重新写入';
      st.className = 'scope-status is-dead';
    }
    if (heroCells2) heroCells2.forEach(function (c) { c.classList.remove('hit'); c.classList.add('dead'); });
  }

  function ttlTick() {
    if (!ttl.running) return;
    var remain = ttl.deadline - Date.now();
    if (remain <= 0) { ttlExpire(); return; }
    ttlRender(remain);
    setTimeout(ttlTick, 200);
  }

  function ttlStart(seconds) {
    ttl.deadline = Date.now() + seconds * 1000;
    ttl.expired = false;
    if (!ttl.running) { ttl.running = true; ttlTick(); }
  }

  async function heroPlay(force) {
    if (!heroCells1) return;
    if (heroPlayed && !force) return;
    heroPlayed = true;
    heroBusy = true;
    var gen = ++heroGen;
    heroClear();

    /* 阶段 1：冷启动，写入 */
    var st = el('heroStatus');
    st.textContent = 'COLD · 请求 1 写入缓存';
    st.className = 'scope-status is-idle';
    scopeRun('write', 1400);
    setHeroReadouts('write', HERO_TOKENS * HERO_W);
    for (var i = 0; i < heroCells1.length; i++) {
      if (gen !== heroGen) { heroBusy = false; return; }
      heroCells1[i].style.animationDelay = (i * 45) + 'ms';
      heroCells1[i].classList.add('write');
    }
    ttlStart(TTL_SECONDS);
    await sleep(heroCells1.length * 45 + 380);
    if (gen !== heroGen) { heroBusy = false; return; }

    /* 阶段 2：重放，命中 */
    st.textContent = 'REPLAY · 请求 2 重放同一前缀';
    st.className = 'scope-status is-idle';
    scopeRun('hit', 1400);
    for (var j = 0; j < heroCells2.length; j++) {
      if (gen !== heroGen) { heroBusy = false; return; }
      heroCells2[j].style.animationDelay = (j * 35) + 'ms';
      heroCells2[j].classList.add('hit');
    }
    setHeroReadouts('hit', HERO_TOKENS * HERO_R);
    await sleep(heroCells2.length * 35 + 260);
    if (gen !== heroGen) { heroBusy = false; return; }

    ttlStart(TTL_SECONDS);   /* 命中即刷新 TTL [1] */
    st.textContent = 'HIT · 命中读 0.1×（TTL 已刷新）';
    st.className = 'scope-status is-hit';
    heroBusy = false;
  }

  /* ================= demo ================= */
  var DEMO_PROFILES = {
    openaiNew: {
      label: 'OpenAI · GPT-5.6+',
      floor: 0,
      w: 1.25, r: 0.5,
      usage: function (hit, miss, total) {
        return [
          'prompt_tokens: ' + fmt(total),
          'prompt_tokens_details: {',
          '  cached_tokens: ' + fmt(hit) + ',   // 命中读价（文档未给确定值，暂按 0.5×）',
          '  uncached: ' + fmt(miss) + '        // 未命中 / 写入侧',
          '}',
          '',
          '// 断点侧参数：prompt_cache_options / prompt_cache_breakpoint /',
          '//             mode:"explicit" / ttl:"30m"|"24h" / prompt_cache_key',
          '// 写入按 1.25× 标准未缓存输入价计费'
        ];
      },
      costNote: 'OpenAI GPT-5.6+：默认一个隐式断点，可用 prompt_cache_breakpoint 设置显式断点（每请求最多 4 个）；写入按 1.25× 计费，ttl 默认 30m。[2]'
    },
    anthropic: {
      label: 'Anthropic',
      floor: 1024,
      w: 1.25, r: 0.1,
      usage: function (hit, miss, total, cacheActive) {
        return [
          'input_tokens: ' + fmt(cacheActive ? 0 : total) + ', // 未参与缓存的输入',
          'cache_read_input_tokens: ' + fmt(hit) + ',       // 命中读 0.1×',
          'cache_creation_input_tokens: ' + fmt(cacheActive ? miss : 0) + '   // 新写入 1.25×'
        ];
      },
      costNote: 'Anthropic 显式断点：写 1.25×、读 0.1×（5 分钟档；1 小时档写 2×）。最小可缓存长度依模型 512–4,096 token。[1]'
    },
    deepseek: {
      label: 'DeepSeek',
      floor: 0,
      w: 1.0, r: 0.03,
      usage: function (hit, miss, total) {
        return [
          'prompt_tokens: ' + fmt(total),
          'prompt_cache_hit_tokens: ' + fmt(hit) + ',    // 硬盘缓存命中',
          'prompt_cache_miss_tokens: ' + fmt(miss) + '   // 未命中，按原价'
        ];
      },
      costNote: 'DeepSeek 硬盘缓存：默认开启、无明示最小长度；命中约为未命中的 2%–3%（官网价目），尽力而为不保证 100%。[3]'
    }
  };

  var demo = { provider: 'deepseek', snapshot: [], busy: false, dirty: false };

  function demoGate(cur) {
    var p = DEMO_PROFILES[demo.provider];
    var n = cur.length;
    var gate = el('demoGate'), badge = el('demoGateBadge'), text = el('demoGateText');
    var ok = n >= p.floor;
    gate.classList.toggle('is-ok', ok);
    badge.textContent = ok ? '达到门槛' : '低于门槛';
    if (ok) {
      text.textContent = '门槛检查：当前 ' + fmt(n) + ' token ≥ ' + p.label + ' 门槛 ' + fmt(p.floor) +
        ' token，缓存可以生效（真实命中率仍取决于前缀字节是否稳定、是否在 TTL 内复用）。';
    } else if (p.floor === 0) {
      text.textContent = '门槛检查：' + p.label + ' 无明示最小可缓存长度' +
        (demo.provider === 'deepseek'
          ? '；但仍须完整匹配一个 cache prefix unit，且尽力而为、不保证 100% 命中。[3]'
          : '；具体门槛与断点行为以官方实时页面为准。[2]');
    } else {
      text.textContent = '门槛检查：当前 ' + fmt(n) + ' token < ' + p.label + ' 最小可缓存长度 ' + fmt(p.floor) +
        ' token —— 真实环境中这段前缀' + (demo.provider === 'anthropic' || demo.provider === 'openaiNew' ? '不会建立缓存，也' : '不会建立缓存，也') +
        '不会产生写溢价，整段按无缓存全价计费。为可读性这里的 prompt 被压缩了；调整长度至门槛以上，再评估成本收益（见成本模拟器）。';
    }
    return ok;
  }

  function demoFinish(cur, hit, miss, identical, cacheActive, d) {
    var p = DEMO_PROFILES[demo.provider];
    var total = cur.length;
    var w = cacheActive ? p.w : 1.0;
    var r = cacheActive ? p.r : 0;
    var cost = miss * w + hit * r;
    var sum = el('demoSummary');
    if (!cacheActive) {
      sum.textContent = '前缀 ' + fmt(total) + ' token 低于 ' + p.label + ' 的 ' + fmt(p.floor) +
        ' token 门槛：没有缓存可命中，' + fmt(total) + ' 个 token 全部按原价计费，写溢价也不会发生。';
    } else if (identical) {
      sum.textContent = '与缓存快照逐字节相同：' + fmt(total) + ' 个 token 在本示例中全部命中，无需重新计算前缀。';
    } else {
      sum.textContent = '第 ' + fmt(d + 1) + ' 个 token 起不同：前 ' + fmt(hit) + ' 个命中，后 ' + fmt(miss) + ' 个无法复用，在本示例中按写入价格计算。';
    }
    var usage = p.usage(hit, miss, total, cacheActive);
    usage.push('');
    usage.push(cacheActive
      ? '等效全价 token ≈ ' + fmt(hit) + '×' + r + ' + ' + fmt(miss) + '×' + w + ' = ' + cost.toFixed(2)
      : '等效全价 token = ' + fmt(total) + ' × 1.0 = ' + cost.toFixed(2) + '   // 低于门槛，按无缓存计费');
    usage.push('（若无缓存：' + fmt(total) + '）');
    el('demoUsage').textContent = usage.join('\n');
    demo.snapshot = cur;
    demo.dirty = false;
  }

  async function demoReplay() {
    if (demo.busy) return;
    demo.busy = true;
    var inputEl = el('demoInput');
    var tape = el('demoTape');
    var pill = el('demoPill');
    var cur = tokenize(inputEl.value);
    var cacheActive = demoGate(cur);

    if (cur.length === 0) {
      renderTape(tape, []);
      pill.textContent = '空 prompt';
      pill.className = 'pill is-idle';
      el('demoSummary').textContent = '当前输入为空，请输入一段文本后再观察匹配结果。';
      el('demoUsage').textContent = '';
      demo.snapshot = [];
      demo.busy = false;
      return;
    }

    var snap = demo.snapshot;
    var max = Math.min(cur.length, snap.length);
    var d = 0;
    while (d < max && cur[d] === snap[d]) d++;
    var identical = (d === cur.length && d === snap.length);
    /* 第 3 轮回归修复：完全一致时整段都算命中，不能落进「全价重写」分支。
       （第 2 轮引入 cacheActive 时把此处写反，导致「重放相同请求」不产生命中动画、
         usage 反而报 cache_creation_input_tokens = 全文。） */
    var hit = !cacheActive ? 0 : (identical ? cur.length : d);
    var miss = !cacheActive ? cur.length : (identical ? 0 : cur.length - d);

    var cells = renderTape(tape, cur);

    if (!identical && d < cur.length) {
      var fork = document.createElement('span');
      fork.className = 'fork';
      fork.setAttribute('aria-hidden', 'true');
      var tag = document.createElement('span');
      tag.className = 'fork-tag';
      tag.textContent = '分叉';
      fork.appendChild(tag);
      tape.insertBefore(fork, cells[d]);
    }

    if (reduced) {
      cells.forEach(function (c, i) { c.classList.add(i < hit ? 'hit' : 'dead'); });
      if (hit < cells.length) cells[hit].classList.add('crack');
      pill.textContent = !cacheActive ? 'NO-CACHE · 低于门槛' : (identical ? 'HIT · 前缀完整命中' : 'MISS · 前缀失效');
      pill.className = (!cacheActive || !identical) ? 'pill is-miss' : 'pill is-hit';
      demoFinish(cur, hit, miss, identical, cacheActive, d);
      demo.busy = false;
      return;
    }

    pill.textContent = 'REPLAY · 回放中';
    pill.className = 'pill is-idle';

    for (var i = 0; i < hit; i++) {
      cells[i].style.animationDelay = (i * 22) + 'ms';
      cells[i].classList.add('hit');
    }
    if (hit > 0) await sleep(hit * 22 + 120);

    if (!cacheActive) {
      for (var z = 0; z < cells.length; z++) {
        cells[z].style.animationDelay = (z * 14) + 'ms';
        cells[z].classList.add('dead');
      }
      pill.textContent = 'NO-CACHE · 低于门槛';
      pill.className = 'pill is-miss';
      demoFinish(cur, hit, miss, identical, cacheActive, d);
      demo.busy = false;
      return;
    }

    if (!identical) {
      for (var k = hit; k < cells.length; k++) {
        cells[k].style.animationDelay = ((k - hit) * 16) + 'ms';
        cells[k].classList.add('dead');
      }
      if (hit < cells.length) {
        cells[hit].classList.add('crack');
        cells[hit].style.animationDelay = '0ms';
      }
      pill.textContent = 'MISS · 前缀失效';
      pill.className = 'pill is-miss';
      await sleep(340);
    } else {
      pill.textContent = 'HIT · 前缀完整命中';
      pill.className = 'pill is-hit';
    }
    demoFinish(cur, hit, miss, identical, cacheActive, d);
    demo.busy = false;
  }

  /* 只改一个字节：把示例里的数字轮换，保证字节真的变了 */
  function toggleOneChar(text) {
    var cycle = ['120', '128', '126'];
    for (var k = 0; k < cycle.length; k++) {
      if (text.indexOf(cycle[k]) !== -1) {
        return text.replace(cycle[k], cycle[(k + 1) % cycle.length]);
      }
    }
    return text.replace(/\d/, '9');
  }

  function demoRefreshGate() {
    demoGate(tokenize(el('demoInput').value));
  }

  function demoInit() {
    var inputEl = el('demoInput');
    inputEl.value = DEMO_PROMPT;
    demo.snapshot = tokenize(DEMO_PROMPT);
    var cells = renderTape(el('demoTape'), demo.snapshot);
    cells.forEach(function (c) { c.classList.add('cached'); });
    el('demoTokCount').textContent = '≈ ' + fmt(demo.snapshot.length);
    demoRefreshGate();

    el('btnReplay').addEventListener('click', demoReplay);

    el('btnChange').addEventListener('click', function () {
      if (demo.busy) return;
      inputEl.value = toggleOneChar(inputEl.value);
      demo.dirty = true;
      demoReplay();
    });

    el('btnAppend').addEventListener('click', function () {
      if (demo.busy) return;
      /* F1：这里必须是 inputEl.value.replace(...)，不是 inputEl.replace(...) */
      inputEl.value = inputEl.value.replace(/\s*$/, '') + '\n追问：违约金上限可以调整吗？';
      demo.dirty = true;
      demoRefreshGate();
      demoReplay();
    });

    el('btnReset').addEventListener('click', function () {
      if (demo.busy) return;
      inputEl.value = DEMO_PROMPT;
      demo.snapshot = tokenize(DEMO_PROMPT);
      var cs = renderTape(el('demoTape'), demo.snapshot);
      cs.forEach(function (c) { c.classList.add('cached'); });
      el('demoPill').textContent = '已恢复初始快照';
      el('demoPill').className = 'pill is-idle';
      el('demoSummary').textContent = '缓存快照已重置为初始 prompt，点「重放相同请求」可再次看到命中。';
      el('demoUsage').textContent = '';
      demo.dirty = false;
      el('demoTokCount').textContent = '≈ ' + fmt(demo.snapshot.length);
      demoRefreshGate();
    });

    inputEl.addEventListener('input', function () {
      if (!demo.dirty) {
        demo.dirty = true;
        el('demoPill').textContent = '已编辑 · 待重放';
        el('demoPill').className = 'pill is-idle';
      }
      el('demoTokCount').textContent = '≈ ' + fmt(tokenize(inputEl.value).length);
      demoRefreshGate();
    });

    /* 按钮高亮 / aria / 计费口径说明都按 demo.provider 走。抽成函数是为了让
       初始态和点击后走同一条路：以前初始高亮只写在 HTML 里，改默认口径要改两处。 */
    function syncProviderUI() {
      all('[data-provider]').forEach(function (b) {
        var on = b.getAttribute('data-provider') === demo.provider;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      el('demoCostNote').textContent = DEMO_PROFILES[demo.provider].costNote;
    }

    all('[data-provider]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        demo.provider = btn.getAttribute('data-provider');
        syncProviderUI();
        demoRefreshGate();
      });
    });

    syncProviderUI();
  }

  /* ================= 静态示意（sec.1） ================= */
  function schematicInit() {
    var base = tokenize(DEMO_PROMPT).slice(0, 9);
    var CHANGED = base.slice();
    /* 第 6 轮修复两件事：
       (1) 这两处下标曾被第 5 轮的「[4] → [2] 全页重编号」误伤，改动点从第 5 个 token
           错位到第 3 个，与本行标签「第 5 个 token 起不同」自相矛盾。
       (2) 替换值原为两字的「合规」，与后文已有的「合规」重复，会渲染成
           「你是一名合规业合规助手」；改为单字后得到「你是一名行业合规助手」。 */
    CHANGED[4] = '行';
    var hitCells = renderTape(el('schHit'), base);
    var missCells = renderTape(el('schMiss'), CHANGED);
    hitCells.forEach(function (c) { c.classList.add('hit'); });
    missCells.forEach(function (c, i) {
      if (i < 4) c.classList.add('hit');
      else c.classList.add('dead');
    });
    missCells[4].classList.add('crack');
  }

  /* ================= 成本模拟器（F2） ================= */
  var SIM_PROFILES = {
    openaiNew: {
      w: 1.25, r: null, floor: 0, label: 'OpenAI GPT-5.6+',
      note: 'OpenAI GPT-5.6+：写入按 1.25× 计费；读价倍率为资料未确认项（默认 0.5×，可改），以官方实时页面为准。<a class="ref" href="#src-2">[2]</a>'
    },
    anthropic: {
      w: 1.25, r: 0.1, floor: null, label: 'Anthropic',
      note: 'Anthropic：写 1.25×、读 0.1×（5 分钟档；1 小时档写 2×）；最小可缓存长度依模型 512–4,096，低于门槛静默不缓存。<a class="ref" href="#src-1">[1]</a>'
    },
    deepseek: {
      w: 1.0, r: 0.03, floor: 0, label: 'DeepSeek',
      note: 'DeepSeek：默认开启、无明示最小长度；须完整匹配一个 cache prefix unit，命中约为未命中的 2%–3%，尽力而为不保证 100%。<a class="ref" href="#src-3">[3]</a>'
    }
  };

  var sim = { provider: 'anthropic', prefix: 6000, per: 400, rounds: 8, invalid: 2, price: 3, readMult: 0.5, minLen: 1024 };

  function simFloor() {
    var p = SIM_PROFILES[sim.provider];
    if (p.floor === null) return sim.minLen;
    return p.floor;
  }

  function simInvalidRounds() {
    var N = sim.rounds, K = Math.min(sim.invalid, Math.max(0, N - 1));
    var slots = [];
    for (var i = 2; i <= N; i++) slots.push(i);
    if (K <= 0 || slots.length === 0) return {};
    var step = slots.length / K;
    var picked = {};
    for (var j = 0; j < K; j++) {
      var idx = Math.min(slots.length - 1, Math.floor(j * step));
      picked[slots[idx]] = true;
    }
    return picked;
  }

  function simCompute() {
    var p = SIM_PROFILES[sim.provider];
    var readRate = (p.r === null) ? sim.readMult : p.r;
    if (!isFinite(readRate) || readRate < 0) readRate = 0;
    var P = sim.prefix, S = sim.per, N = sim.rounds;
    var floor = simFloor();
    var cacheActive = P >= floor;
    var invalid = simInvalidRounds();
    var write = 0, read = 0, base = 0, noCache = 0;
    for (var i = 1; i <= N; i++) {
      var T = P + i * S;
      var prev = P + (i - 1) * S;
      noCache += T;
      if (!cacheActive) { base += T; continue; }
      if (i === 1 || invalid[i]) {
        write += T * p.w;
      } else {
        read += prev * readRate;
        // 新增内容也写入缓存，下一轮才能作为 prev 的一部分读取。
        write += S * p.w;
      }
    }
    var total = write + read + base;
    return {
      write: write, read: read, base: base, total: total, noCache: noCache,
      cacheActive: cacheActive, floor: floor, readRate: readRate
    };
  }

  function simRender() {
    var r = simCompute();
    var max = Math.max(r.total, r.noCache, 1);
    var savePct = r.noCache > 0 ? (1 - r.total / r.noCache) * 100 : 0;

    el('barNoCache').style.width = (r.noCache / max * 100) + '%';
    el('barCache').style.width = (r.total / max * 100) + '%';
    var inner = function (v) { return (v / Math.max(r.total, 1) * 100) + '%'; };
    el('segWrite').style.width = inner(r.write);
    el('segRead').style.width = inner(r.read);
    el('segBase').style.width = inner(r.base);

    el('numNoCache').textContent = fmt(r.noCache);
    el('numCache').textContent = fmt(r.total);
    el('numNoCacheBar').textContent = fmt(r.noCache);
    el('numCacheBar').textContent = fmt(r.total);
    el('numSave').textContent = (savePct >= 0 ? '省 ' : '多花 ') + Math.abs(savePct).toFixed(1) + '%';
    el('numDetail').textContent = '构成：写 ' + fmt(r.write) + ' · 读 ' + fmt(r.read) + ' · 新内容与原价 ' + fmt(r.base);
    el('numDollar').textContent = '折合约 $' + (r.total * money(sim.price) / 1e6).toFixed(2) +
      '；无缓存 $' + (r.noCache * money(sim.price) / 1e6).toFixed(2) + '（按 $' + sim.price + ' / 1M 全价输入）';

    /* F2：门槛警告，不静默 */
    var gate = el('simGate'), gb = el('simGateBadge'), gt = el('simGateText');
    gate.classList.toggle('is-ok', r.cacheActive);
    gb.textContent = r.cacheActive ? '缓存生效' : '低于门槛';
    if (r.cacheActive) {
      gt.textContent = '前缀 ' + fmt(sim.prefix) + ' token ≥ ' + SIM_PROFILES[sim.provider].label + ' 最小可缓存长度 ' + fmt(r.floor) +
        ' token，缓存可以建立；命中仍受 TTL 与前缀字节稳定性影响。';
    } else {
      gt.textContent = '前缀 ' + fmt(sim.prefix) + ' token < ' + SIM_PROFILES[sim.provider].label + ' 最小可缓存长度 ' + fmt(r.floor) +
        ' token：无法建立缓存（Anthropic 低于门槛时会静默忽略 cache_control），不产生写入溢价，全部输入按标准价格计费。可将前缀长度调整至 ' + fmt(r.floor) + ' 以上，再比较成本变化。';
    }

    var advice, warn = false;
    if (!r.cacheActive) {
      advice = '当前参数下未达到最小可缓存长度，模型按无缓存处理。可将「稳定前缀 token 数」调整至 ' + fmt(r.floor) +
        ' 以上，再评估读取倍率和复用次数对成本的影响。';
      warn = true;
    } else if (r.total > r.noCache) {
      advice = '当前参数下，缓存成本高于无缓存成本，说明读取节省尚未抵消写入开销。可以调整失效次数、前缀长度或读取倍率，比较各因素的影响。';
      warn = true;
    } else if (savePct < 15) {
      advice = '当前成本节省较为有限。可以分别调整前缀长度与失效次数，观察重复使用的内容规模和频率如何影响收益。';
    } else {
      advice = '当前参数下，前缀复用带来了较明显的输入成本节省。结果仅覆盖输入侧，输出 token 需另行计费；实际收益还取决于前缀稳定性、缓存有效期和服务端命中情况。';
    }
    var adv = el('simAdvice');
    adv.textContent = advice;
    adv.classList.toggle('warn', warn);
    el('simCostNote').innerHTML = SIM_PROFILES[sim.provider].note;
  }

  function simSyncExtra() {
    all('#simExtra .extra-row').forEach(function (row) {
      row.hidden = row.getAttribute('data-for') !== sim.provider;
    });
    var rm = el('simReadMult');
    rm.disabled = sim.provider !== 'openaiNew';
    el('simMinLen').disabled = sim.provider !== 'anthropic';
  }

  function simInit() {
    function bind(id, key, fmtFn) {
      var node = el(id);
      node.addEventListener('input', function () {
        var v = Number(node.value);
        if (!isFinite(v)) v = 0;
        sim[key] = v;
        if (key === 'rounds') {
          var inv = el('simInvalid');
          inv.max = String(Math.max(0, sim.rounds - 1));
          if (sim.invalid > sim.rounds - 1) {
            sim.invalid = sim.rounds - 1;
            inv.value = String(sim.invalid);
            el('simInvalidOut').textContent = String(sim.invalid);
          }
        }
        el(id + 'Out').textContent = fmtFn(v);
        simRender();
      });
    }
    /* 第 4 轮修复：el() 走的是 getElementById，不吃 CSS 选择器语法。
       这四处原先写成 '#simPrefix'，导致 el() 返回 null、addEventListener 抛 TypeError，
       整个 DOMContentLoaded 初始化链在此中断（sec.0 自动播放 / 导航高亮 / 模拟器初值全部失效）。 */
    bind('simPrefix', 'prefix', function (v) { return fmt(v) + ' token'; });
    bind('simPer', 'per', function (v) { return fmt(v); });
    bind('simRounds', 'rounds', function (v) { return String(v); });
    bind('simInvalid', 'invalid', function (v) { return String(v); });

    el('simReadMult').addEventListener('input', function () {
      var v = Number(el('simReadMult').value);
      if (!isFinite(v) || v < 0) v = 0.5;
      sim.readMult = v;
      el('simReadMultOut').textContent = v.toFixed(2).replace(/0$/, '');
      simRender();
    });
    el('simMinLen').addEventListener('change', function () {
      var v = Number(el('simMinLen').value);
      if (!isFinite(v)) v = 1024;
      sim.minLen = v;
      simRender();
    });

    var priceEl = el('simPrice');
    priceEl.addEventListener('input', function () {
      var v = Number(priceEl.value);
      sim.price = (isFinite(v) && v >= 0) ? v : 0;
      simRender();
    });

    all('[data-simprovider]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        sim.provider = btn.getAttribute('data-simprovider');
        all('[data-simprovider]').forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        simSyncExtra();
        simRender();
      });
    });
    simSyncExtra();
  }

  /* ================= 主题切换 ================= */
  /* 按钮本身（点击、文案、aria、localStorage）由 ../assets/site.js 统一接管；
     这里只负责让 Canvas 重新按当前 CSS 变量取色，否则切主题后示波器会留旧色。 */
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  var lastPaintedTheme = null;
  function syncThemePaint() {
    var theme = currentTheme();
    if (theme === lastPaintedTheme) return;
    lastPaintedTheme = theme;
    readThemeColors();
    drawScope();
  }

  function themeInit() {
    syncThemePaint();
    /* site.js 会在切换时改写 data-theme；用 MutationObserver 跟上，不抢它的职责 */
    if (window.MutationObserver) {
      new MutationObserver(function () { syncThemePaint(); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
    /* 没手动选过时跟随系统变化 */
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onSys = function () { syncThemePaint(); };
      if (mq.addEventListener) mq.addEventListener('change', onSys);
      else if (mq.addListener) mq.addListener(onSys);
    }
  }

  /* ================= init ================= */
  document.addEventListener('DOMContentLoaded', function () {
    heroRender();
    schematicInit();
    demoInit();
    simInit();
    readThemeColors();
    themeInit();
    simRender();
    el('heroReplay').addEventListener('click', function () { heroPlay(true); });
    el('heroTtlSkip').addEventListener('click', function () {
      ttl.deadline = Date.now() + 2600;   /* 示教快进：几秒后看过期 */
      ttl.expired = false;
      if (!ttl.running) { ttl.running = true; ttlTick(); }
      el('heroTtlNote').textContent = '已快进：倒计时按示教加速走完，观察归零后的状态。';
    });
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawScope, 120);
    });
    setTimeout(heroPlay, 500);
  });
})();
