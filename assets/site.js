/* ============================================================================
   NLP Learning — site shell script（全站共用）
   ----------------------------------------------------------------------------
   1. 主题：顶栏右侧的深浅色开关。默认跟随系统，手动选过后记住。
      与旧版 key 互通（hermes-theme / lmapi-theme 都读，写时都写）。
   2. 顶栏导航：站点总览 + 本页的章节/分节，横向排列、可横滑、跟随滚动高亮。
   3. 侧栏（仅宽屏）：列出本页全部分节，position:fixed 钉在左列；
      同时算出它横轴该停在哪（宽屏居中布局下不能写死 left: 0）。
   ========================================================================= */
(() => {
  "use strict";

  const KEY = "lmapi-lab-theme";
  const LEGACY_KEYS = ["hermes-theme", "lmapi-theme"];
  const root = document.documentElement;

  /* ---------------------------------------------------------------- 主题 */

  const readStoredTheme = () => {
    for (const k of [KEY, ...LEGACY_KEYS]) {
      try {
        const v = localStorage.getItem(k);
        if (v === "light" || v === "dark") return v;
      } catch (_) { /* 存储不可用：按未选择处理 */ }
    }
    return null;
  };

  const writeStoredTheme = (theme) => {
    for (const k of [KEY, ...LEGACY_KEYS]) {
      try { localStorage.setItem(k, theme); } catch (_) { /* 忽略 */ }
    }
  };

  const systemDark = () => !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const effectiveTheme = () => {
    const attr = root.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    return systemDark() ? "dark" : "light";
  };

  /* 没手动选过时把系统偏好写成显式属性：tokens.css 里系统浅色只能靠媒体查询覆盖
     （深色是 :root 默认），写下来才能让「跟随系统」在两套配色下都成立。 */
  const adoptSystemTheme = () => {
    if (readStoredTheme()) return;
    root.setAttribute("data-theme", systemDark() ? "dark" : "light");
  };

  const paintThemeButton = () => {
    const dark = effectiveTheme() === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      const ic = btn.querySelector(".theme-ic");
      const word = btn.querySelector(".theme-word");
      if (ic) ic.textContent = dark ? "☾" : "☀";
      if (word) word.textContent = dark ? "浅色" : "深色";
      btn.setAttribute("aria-label", `切换到${dark ? "浅色" : "深色"}模式`);
      btn.setAttribute("aria-pressed", String(dark));
    });
  };

  /* ------------------------------------------------------------ 站点结构 */

  const slug = (text, index) => {
    const base = text.toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    return base ? `sec-${base}` : `sec-${index + 1}`;
  };

  /* 收集本页所有可跳转的章节/小节：正文里带 data-nav-anchor 的标题 */
  const collectSections = (main) => {
    const heads = Array.from(main.querySelectorAll("[data-nav-anchor]"));
    const seen = new Set();
    const groups = [];
    let n = 0;

    heads.forEach((h, i) => {
      const label = String(h.dataset.navLabel || h.textContent || "").replace(/\s+/g, " ").trim();
      if (!label) return;

      let id = h.id;
      if (!id) {
        id = slug(label, i);
        while (seen.has(id) || document.getElementById(id)) id = `${id}-${i + 1}`;
        h.id = id;
      }
      if (seen.has(id)) return;
      seen.add(id);

      const holder = h.closest("[data-nav-group]");
      const name = holder ? String(holder.dataset.navGroup || "") : "";
      /* 导航只到「章」这一层时（data-nav-num="off"）不显示 01/02 编号 */
      const withNum = !(holder && holder.dataset.navNum === "off");
      let group = groups.find((g) => g.name === name && g.withNum === withNum);
      if (!group) { group = { name, withNum, items: [] }; groups.push(group); }
      n += 1;
      group.items.push({ id, n, label: label.replace(/[：:。.]$/, "") });
    });

    return groups;
  };

  const flatten = (groups) => groups.reduce((acc, g) => acc.concat(g.items), []);

  /* ---------------------------------------------------------- 左侧栏 */

  /* 顶栏只有品牌与主题开关，章节跳转一律在左侧栏（窄屏时是正文上方那一条）。
     这里只负责渲染左栏。 */
  const renderRail = (main) => {
    const groups = main ? collectSections(main) : [];

    /* 侧栏：宽屏显示，按分组呈现。
       分组标题放在滚动容器之外（.rail-head）：放进滚动容器里的话，
       侧栏内容一旦比视口高、发生内部滚动，标题就会被裁掉半个字。 */
    const railHost = document.querySelector("[data-site-nav]");
    if (railHost) {
      const wrap = document.createElement("div");
      wrap.className = "site-rail-in";

      const head = document.createElement("div");
      head.className = "rail-head";
      const scroll = document.createElement("div");
      scroll.className = "rail-scroll";
      const frag = document.createDocumentFragment();

      groups.forEach((group) => {
        const box = document.createElement("div");
        box.className = "rail-secs-group";

        if (group.name) {
          const tag = document.createElement("p");
          tag.className = "rail-secs-h";
          const t = document.createElement("b");
          t.textContent = group.name;
          tag.append(t);
          head.appendChild(tag);
        }

        const list = document.createElement("div");
        list.className = "rail-secs";
        group.items.forEach((sec) => {
          const a = document.createElement("a");
          a.className = "rail-sec";
          a.href = "#" + sec.id;
          a.dataset.sec = sec.id;
          const t = document.createElement("span");
          t.textContent = sec.label;
          if (group.withNum) {
            const n = document.createElement("span");
            n.className = "rail-sec-n";
            n.textContent = String(sec.n).padStart(2, "0");
            a.append(n, t);
          } else {
            a.classList.add("rail-sec-chapter");
            a.append(t);
          }
          list.appendChild(a);
        });
        box.appendChild(list);
        frag.appendChild(box);
      });

      scroll.appendChild(frag);
      wrap.appendChild(head);
      wrap.appendChild(scroll);
      railHost.textContent = "";
      railHost.appendChild(wrap);
    }

    return groups;
  };

  /* 侧栏是 fixed：定位上下文是视口，left 得按栅格左列的实际位置算
     （宽屏居中布局下不能写死 left: 0）。窗口尺寸变化时重算。 */
  const alignRail = () => {
    const shell = document.querySelector(".site-shell");
    if (!shell) return;
    const shellBox = shell.getBoundingClientRect();
    const padLeft = parseFloat(getComputedStyle(shell).paddingLeft) || 0;
    root.style.setProperty("--rail-left", Math.max(8, Math.round(shellBox.left + padLeft)) + "px");
  };

  /* ------------------------------------------------------------ scroll-spy */

  /* 用「最后一条越过阅读线的分节」判定当前项，并以章节/小节起点为准
     （只看标题的话，跳转后标题常还差几十像素，高亮会落回上一节）。 */
  const watchSections = (items) => {
    if (!items.length) return;

    const nodes = items
      .map((it) => {
        const node = document.getElementById(it.id);
        if (!node) return null;
        return { id: it.id, box: node.closest(".note-sec, .note, section[id], article[id]") || node };
      })
      .filter(Boolean);
    if (!nodes.length) return;

    const links = Array.from(document.querySelectorAll("[data-sec]"));
    const railScroller = document.querySelector(".rail-scroll");

    /* 只滚动容器自己的 scrollTop/scrollLeft —— 绝不能用 scrollIntoView：
       它会把整页也滚起来，和锚点跳转/用户滚动抢位置。 */
    const keepVisible = (el, scroller, axis) => {
      if (!scroller) return;
      const box = scroller.getBoundingClientRect();
      const item = el.getBoundingClientRect();
      const pad = 12;
      if (axis === "y") {
        if (scroller.scrollHeight <= scroller.clientHeight + 4) return;
        if (item.top < box.top + pad) scroller.scrollTop -= (box.top + pad - item.top);
        else if (item.bottom > box.bottom - pad) scroller.scrollTop += (item.bottom - (box.bottom - pad));
      } else {
        if (scroller.scrollWidth <= scroller.clientWidth + 4) return;
        if (item.left < box.left + pad) scroller.scrollLeft -= (box.left + pad - item.left);
        else if (item.right > box.right - pad) scroller.scrollLeft += (item.right - (box.right - pad));
      }
    };

    const mark = (id) => {
      let currentRail = null;
      let currentTop = null;
      links.forEach((a) => {
        const on = a.dataset.sec === id;
        a.classList.toggle("is-current", on);
        if (on) {
          a.setAttribute("aria-current", "true");
          if (a.classList.contains("rail-sec")) currentRail = a;
          else currentTop = a;
        } else {
          a.removeAttribute("aria-current");
        }
      });
      if (currentRail) keepVisible(currentRail, railScroller, "y");
    };

    const topbarH = () => parseFloat(getComputedStyle(root).getPropertyValue("--topbar-h")) || 58;
    let raf = 0;

    /* 点击跳转期间锁住 scroll-spy：锁的时长不是写死的毫秒数，而是
       「滚动真的停下来了」。原先写死 900ms，长距离跳转（第一个分节点到
       最后一节）滑完要 1s 以上，锁一到期、滚动还在半路，spy 就用中途位置
       重算一次，高亮会在中间那几节上闪一下再回到目标。
       现在：只要还有 scroll 事件，锁就一直续期；连续 SILENT_MS 没有新事件
       才算停下，然后重算一次。另外两条兜底 —— 点完一直不滚（目标已在视口
       里）按 NO_SCROLL_MS 解锁；任何情况下不超过 MAX_LOCK_MS。 */
    let locked = false;
    let settleTimer = 0;
    let bailTimer = 0;
    let maxTimer = 0;
    const SILENT_MS = 140;
    const NO_SCROLL_MS = 200;
    const MAX_LOCK_MS = 2600;

    const update = () => {
      raf = 0;
      if (locked) return;
      const line = window.scrollY + topbarH() + 90;
      let best = nodes[0];
      for (const it of nodes) {
        if (it.box.getBoundingClientRect().top + window.scrollY <= line) best = it;
        else break;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        best = nodes[nodes.length - 1];
      }
      mark(best.id);
    };

    const schedule = () => {
      if (locked) return;
      if (!raf) raf = requestAnimationFrame(update);
    };

    const unlock = () => {
      if (!locked) return;
      locked = false;
      window.clearTimeout(settleTimer);
      window.clearTimeout(bailTimer);
      window.clearTimeout(maxTimer);
      update();
    };

    window.addEventListener("scroll", () => {
      if (locked) {
        /* 还在滚：把「停下来了」的判定不停往后推，并取消「根本没滚」的兜底 */
        window.clearTimeout(settleTimer);
        window.clearTimeout(bailTimer);
        settleTimer = window.setTimeout(unlock, SILENT_MS);
        return;
      }
      schedule();
    }, { passive: true });
    window.addEventListener("resize", () => { alignRail(); schedule(); });
    update();

    /* 点过链接立刻高亮目标，并一直锁到平滑滚动结束 */
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-sec]");
      if (!a) return;
      locked = true;
      mark(a.dataset.sec);
      window.clearTimeout(settleTimer);
      window.clearTimeout(bailTimer);
      window.clearTimeout(maxTimer);
      bailTimer = window.setTimeout(unlock, NO_SCROLL_MS);
      maxTimer = window.setTimeout(unlock, MAX_LOCK_MS);
    });
  };

  /* ---------------------------------------------------------------- 启动 */

  const init = () => {
    adoptSystemTheme();

    const main = document.getElementById("main");
    const host = document.querySelector("[data-site-nav]");
    const groups = main && host ? renderRail(main) : [];
    const items = flatten(groups);

    alignRail();
    watchSections(items);

    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.setAttribute("data-theme", effectiveTheme() === "dark" ? "light" : "dark");
        writeStoredTheme(root.getAttribute("data-theme"));
        paintThemeButton();
      });
    });
    paintThemeButton();
    if (window.matchMedia) {
      const dark = window.matchMedia("(prefers-color-scheme: dark)");
      const light = window.matchMedia("(prefers-color-scheme: light)");
      const onSys = () => {
        if (readStoredTheme()) return;      /* 用户选过就不再跟随系统 */
        root.setAttribute("data-theme", systemDark() ? "dark" : "light");
        paintThemeButton();
      };
      if (dark.addEventListener) { dark.addEventListener("change", onSys); light.addEventListener("change", onSys); }
      else if (dark.addListener) { dark.addListener(onSys); light.addListener(onSys); }
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
