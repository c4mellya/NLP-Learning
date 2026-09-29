(() => {
  "use strict";

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const statuses = new Set(["已确认", "官方发布", "官方预告", "OpenAI员工动态", "可靠爆料", "传闻"]);
  const $ = (id) => document.getElementById(id);
  const list = $("daily-list");
  const select = $("daily-select");
  const title = $("daily-title");
  const dateNode = $("daily-date");
  const headMeta = $("daily-head-meta");
  const statusNode = $("daily-status");
  const latestLink = $("daily-latest");
  const toc = $("daily-toc");
  const tocLinks = $("daily-toc-links");
  const content = $("daily-content");
  const requestedDate = new URLSearchParams(location.search).get("date");

  const str = (value) => typeof value === "string" ? value.trim() : "";
  const arr = (value) => Array.isArray(value) ? value : [];
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch (_) { return null; }
  };
  const validEntry = (entry) => entry && typeof entry === "object"
    && datePattern.test(entry.date) && entry.file === `${entry.date}.json`;
  const displayDate = (value) => {
    const [year, month, day] = value.split("-");
    return `${year}年${Number(month)}月${Number(day)}日`;
  };
  const displayTime = (value, timezone) => {
    if (!str(value)) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    try {
      return new Intl.DateTimeFormat("zh-CN", {
        timeZone: str(timezone) || "Asia/Shanghai", dateStyle: "medium", timeStyle: "short"
      }).format(parsed);
    } catch (_) { return ""; }
  };

  const showStatus = (message, showLatest = false) => {
    statusNode.textContent = message;
    statusNode.hidden = false;
    latestLink.hidden = !showLatest;
    toc.hidden = true;
    content.hidden = true;
  };

  const addSection = (id, heading, detail = "") => {
    const section = el("section", "daily-section");
    section.id = id;
    const head = el("div", "daily-section-head");
    head.appendChild(el("h2", "", heading));
    if (detail) head.appendChild(el("small", "", detail));
    section.appendChild(head);
    content.appendChild(section);
    const link = el("a", "", heading);
    link.href = `#${id}`;
    tocLinks.appendChild(link);
    return section;
  };

  const sourceList = (item) => {
    const sources = [item.primary_source, ...arr(item.sources)].filter((source) => source && str(source.name));
    if (!sources.length && safeUrl(item.url)) sources.push({ name: "原文", url: item.url });
    if (!sources.length) return null;
    const wrap = el("div", "daily-sources");
    wrap.appendChild(el("span", "", "来源："));
    const seen = new Set();
    for (const source of sources) {
      const name = str(source.name);
      const url = safeUrl(source.url);
      const key = `${name}|${url || ""}`;
      if (seen.has(key)) continue;
      if (seen.size) wrap.appendChild(el("span", "", " · "));
      seen.add(key);
      if (url) {
        const link = el("a", "", name);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.referrerPolicy = "no-referrer";
        wrap.appendChild(link);
      } else {
        wrap.appendChild(el("span", "", name));
      }
    }
    return seen.size ? wrap : null;
  };

  const renderItem = (item, number = 0) => {
    const card = el("li", "daily-item");
    const top = el("div", "daily-item-top");
    if (number) top.appendChild(el("span", "daily-top-number", String(number).padStart(2, "0")));
    if (str(item.brand)) top.appendChild(el("span", "daily-item-brand", str(item.brand)));
    const status = str(item.status);
    if (statuses.has(status)) {
      const badge = el("span", "daily-status-badge", status);
      badge.dataset.kind = status === "可靠爆料" || status === "传闻" ? "uncertain"
        : status === "官方预告" || status === "OpenAI员工动态" ? "preview" : "confirmed";
      top.appendChild(badge);
    }
    if (top.childNodes.length) card.appendChild(top);
    card.appendChild(el("h3", "", str(item.title)));
    if (str(item.summary)) card.appendChild(el("p", "daily-item-summary", str(item.summary)));
    if (str(item.analysis)) {
      const analysis = el("p", "daily-item-analysis");
      analysis.appendChild(el("strong", "", "观察："));
      analysis.appendChild(document.createTextNode(str(item.analysis)));
      card.appendChild(analysis);
    }
    if (str(item.published_at)) card.appendChild(el("p", "daily-item-meta", `发布时间：${str(item.published_at)}`));
    const sources = sourceList(item);
    if (sources) card.appendChild(sources);
    return card;
  };

  const newsItems = (value, limit = Infinity) => arr(value).filter((item) => item && str(item.title)).slice(0, limit);
  const appendItems = (section, items, numbered = false) => {
    const listNode = el("ol", "daily-items");
    items.forEach((item, i) => listNode.appendChild(renderItem(item, numbered ? i + 1 : 0)));
    section.appendChild(listNode);
  };

  const renderReport = (report, date) => {
    content.replaceChildren();
    tocLinks.replaceChildren();
    title.textContent = str(report.title) || "AI 日报";
    dateNode.dateTime = date;
    dateNode.textContent = displayDate(date);
    const meta = report.meta && typeof report.meta === "object" ? report.meta : {};
    const generated = displayTime(meta.generated_at, meta.timezone);
    headMeta.textContent = generated ? `生成时间：${generated}` : "";
    headMeta.hidden = !generated;

    const glance = report.glance && typeof report.glance === "object" ? report.glance : {};
    const highlights = arr(glance.highlights).filter((value) => str(value)).slice(0, 4);
    if (str(glance.summary) || highlights.length) {
      const section = addSection("daily-glance", "今日速览");
      const box = el("div", "daily-glance");
      if (str(glance.summary)) box.appendChild(el("p", "", str(glance.summary)));
      if (highlights.length) {
        const bullets = el("ul", "daily-highlights");
        highlights.forEach((value) => bullets.appendChild(el("li", "", str(value))));
        box.appendChild(bullets);
      }
      section.appendChild(box);
    }

    const top = newsItems(report.top5, 5);
    if (top.length) {
      const section = addSection("daily-top", "Today's Top 5", `TOP ${top.length}`);
      section.classList.add("daily-top");
      appendItems(section, top, true);
    }

    for (const [key, label, id] of [
      ["openai", "OpenAI / GPT", "daily-openai"],
      ["claude", "Claude / Anthropic", "daily-claude"],
      ["deepseek", "DeepSeek", "daily-deepseek"]
    ]) {
      const group = report[key] && typeof report[key] === "object" ? report[key] : {};
      const section = addSection(id, label);
      const items = newsItems(group.items);
      if (items.length) appendItems(section, items);
      if (str(group.note) || !items.length) {
        section.appendChild(el("p", "daily-section-note", str(group.note) || "今日暂无值得单独报道的重大更新。"));
      }
    }

    const other = report.other_major_updates && typeof report.other_major_updates === "object"
      ? report.other_major_updates : {};
    const otherItems = newsItems(other.items);
    if (otherItems.length) appendItems(addSection("daily-other", "Other Major Updates"), otherItems);

    const editor = report.editor_note && typeof report.editor_note === "object" ? report.editor_note : {};
    const paragraphs = arr(editor.content).filter((value) => str(value));
    if (!paragraphs.length && str(editor.summary)) paragraphs.push(str(editor.summary));
    if (!paragraphs.length) paragraphs.push(...arr(editor.points).filter((value) => str(value)));
    if (paragraphs.length) {
      const section = addSection("daily-editor", "今日观察");
      const box = el("div", "daily-editor");
      paragraphs.forEach((value) => box.appendChild(el("p", "", str(value))));
      section.appendChild(box);
    }

    const footer = addSection("daily-meta", "信息来源与检索范围");
    const facts = el("dl", "daily-meta");
    const addFact = (label, value) => {
      if (!value) return;
      const row = el("div");
      row.append(el("dt", "", label), el("dd", "", value));
      facts.appendChild(row);
    };
    addFact("日报日期", displayDate(date));
    addFact("检索截止", displayTime(meta.search_cutoff, meta.timezone));
    addFact("生成时间", generated);
    addFact("信息来源", "请以各条目所列来源为准");
    footer.appendChild(facts);

    statusNode.hidden = true;
    latestLink.hidden = true;
    toc.hidden = false;
    content.hidden = false;
    document.title = `${title.textContent} · ${date} · NLP Learning`;
  };

  const renderHistory = (entries, chosenDate) => {
    let month = "";
    for (const entry of entries) {
      const currentMonth = entry.date.slice(0, 7);
      if (currentMonth !== month) {
        month = currentMonth;
        list.appendChild(el("p", "daily-month", `${entry.date.slice(0, 4)}年${Number(entry.date.slice(5, 7))}月`));
      }
      const link = el("a", "daily-list-link", entry.date.slice(5));
      link.href = `?date=${entry.date}`;
      link.title = str(entry.title) || `AI 日报 · ${entry.date}`;
      if (entry.date === chosenDate) link.setAttribute("aria-current", "page");
      list.appendChild(link);
      const option = el("option", "", entry.date);
      option.value = entry.date;
      option.selected = entry.date === chosenDate;
      select.appendChild(option);
    }
    select.addEventListener("change", () => {
      if (datePattern.test(select.value)) location.assign(`?date=${select.value}`);
    });
  };

  const start = async () => {
    let index;
    try {
      // 运行时索引可能在同一秒内被替换；避免静态服务器按秒级 Last-Modified 返回旧的 304。
      const response = await fetch(`index.json?refresh=${Date.now()}`, { cache: "no-store" });
      if (response.status === 404) { showStatus("AI 日报暂未生成"); return; }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      index = await response.json();
      if (!index || !Array.isArray(index.entries)) throw new Error("invalid index");
    } catch (_) { showStatus("日报数据暂时无法读取"); return; }

    const seen = new Set();
    const entries = index.entries.filter((entry) => {
      if (!validEntry(entry) || seen.has(entry.date)) return false;
      seen.add(entry.date);
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
    if (!entries.length) { showStatus("AI 日报暂未生成"); return; }
    const latest = datePattern.test(index.latest) && seen.has(index.latest)
      ? index.latest : entries[0].date;
    const chosenDate = requestedDate || latest;
    const chosen = entries.find((entry) => entry.date === chosenDate);
    renderHistory(entries, chosenDate);
    if (!datePattern.test(chosenDate) || !chosen) {
      showStatus("未找到该日期的 AI 日报", true);
      return;
    }

    try {
      const isLatest = chosen.date === latest;
      const url = `data/${chosen.date}.json${isLatest ? `?refresh=${Date.now()}` : ""}`;
      const response = await fetch(url, { cache: isLatest ? "no-store" : "default" });
      if (response.status === 404) { showStatus("未找到该日期的 AI 日报", true); return; }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const report = await response.json();
      if (!report || typeof report !== "object" || report.date !== chosen.date) throw new Error("invalid report");
      renderReport(report, chosen.date);
    } catch (_) { showStatus("日报数据暂时无法读取", chosen.date !== latest); }
  };

  start();
})();
