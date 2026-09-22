# NLP Learning · 站点

两份可以自己跑一遍的讲义，合成一个站点：统一顶栏、统一左侧导航、统一的深蓝黑网格视觉。
每门课都是**一页全文**，左栏按分节跳转，不用再点进二级页面。

```
site/
├── index.html              课程总览：一段介绍 + 课程卡片（后续加课只加卡片，无侧栏）
├── assets/
│   ├── tokens.css          全站设计变量（配色 / 字体 / 间距 / 半径）
│   ├── site.css            站点外壳：顶栏、sticky 左侧导航、课程卡片
│   ├── site.js             顶栏主题开关 + 左栏生成（按正文分节跳转）+ 滚动高亮
│   └── logo.svg            站点图标（页头内联同款图形）
├── hermes/
│   ├── index.html          课程 01 全文：提要 + 六章（安装 → 工具调用）
│   ├── app.js              本章交互：命令速查、文件查看器
│   ├── hermes-content.css  讲义组件（终端块、表格、验收卡、流程图…）
│   ├── hermes-new.css      单页全文的章节层次
│   └── hermes.css          构建产物（勿手改，见文末）
└── llm-api/
    └── index.html          课程 02 全文：Prompt Caching 五节
```

## 三层结构

1. **顶栏**（所有页面一致）：左边是 logo + `NLP Learning`，右边是深浅色开关。**只有这两样。**
   点品牌回课程总览。
2. **左侧栏**（宽屏 ≥1081px）：本页全部章节/分节的唯一跳转入口。
   - Hermes：只列六步（01 安装 … 06 工具调用），一行一章；
   - Prompt Caching：本节提要 + 五个小节。
   - **定位**：`position: fixed`，`left` 由 `site.js` 按栅格左列的实际位置算
     （宽屏居中布局下不能写死）；外面用 `.site-rail { clip-path: inset(0) }`
     把绘制范围裁在左列内——否则 fixed 元素的背景会盖到顶栏和正文上。
     不用 `position: sticky`：实测在部分渲染路径下它会静默失效（元素跟着页面滚走）。
   - 自身超出视口高度时在内部滚动，当前项自动滑进可见区；
     **≤1080px 时整条侧栏回到普通流**，变成正文上方一行可横滑的胶囊目录。
3. **正文**：阅读列最宽 780px；首页没有侧栏，单列居中。

导航项的来源是正文里带 `data-nav-anchor` 的标题：Hermes 只给六章的 `<h1>` 打了标记
（`data-nav-num="off"` 表示这一层不显示编号），caching 给提要 + 五个 `<h2>` 打了标记。
要调粒度改这几个属性即可，不用动脚本。

## 视觉系统

| 角色 | 取值 | 用途 |
| --- | --- | --- |
| 底 / 面 | `#0A0F14` / `#101A24` / `#0E161F` / `#070D13` | 页面底、卡片、面板、仪表（终端）面 |
| 字 | `#E9F1F8` / `#9DB0C2` / `#8298A9` | 标题 / 正文 / 弱化 |
| **琥珀** `--hot` | `#FFB224` | 命中、当前项、关键读数、主行动 |
| **冰蓝** `--cold` | `#62C6F5` | 结构线、链接、进度 |
| 绿松 `--ok` | `#34D399` | 已完成 |
| 暖橙 `--warn` | `#E0A458` | 验收门槛（只给它） |
| 显示 / 正文 | Space Grotesk、Noto Sans SC | 标题与正文 |
| 等宽 | IBM Plex Mono | 数据、标签、命令、参数 |

背景是 44px 细网格 + 顶部微光，`background-attachment: fixed`，整站是同一张底。
字体走 Google Fonts CDN，断网时按 CSS 里的 `ui-monospace` / `-apple-system` / `PingFang SC`
回落，排版不塌、只是字形退化。

主题三态：手动选过就记住（`localStorage["lmapi-lab-theme"]`，兼容旧的 `hermes-theme` /
`lmapi-theme`），没选过就跟随系统。

## 内容来源与改写边界

- **Hermes 课程**：正文文字来自 `../hermes/index.html`（旧版单页）与
  `../site/.review/backup/hermes/index.html`，逐字搬运。改的只有外壳：单页 tab 变成
  连续全文、左栏换成站点导航、样式换成本站语言。
- **Prompt Caching 课程**：正文与交互（token 带、示波器、成本模拟器）来自
  `../LLM api/index.html`，除删除页内顶部锚点导航、把配色接到本站 token 外，正文未改。
- 旧版两个目录原样保留，作为内容来源与对照。

## 本地预览

```bash
cd site
python -m http.server 8000     # 访问 http://localhost:8000
```

也可以直接双击 `site/index.html`（全部相对路径，`file://` 打开同样可用）。

## 构建与验证

`hermes/index.html` 与 `hermes/hermes.css` 由 `../.review/build-split.mjs` 生成：
从旧版单页取出六个 `<article>` 的正文，拼成一页全文（课程提要 + 六章），
并把旧样式表的分层映射成新 token。**要改 Hermes 正文，请改旧文件后重跑构建**，
手改生成物会被覆盖。

`llm-api/index.html` 是手写维护的：它的 demo、门槛块与成本模拟器共享同一份运行状态，
不适合拆页。

验证脚本放在 `../.review/`：

| 脚本 | 作用 |
| --- | --- |
| `verify.mjs` | 内链健康 + 正文指纹 + 版式结构（溢出 / 标题层级 / 分节数） |
| `contrast.mjs` | 逐页 × 深/浅两套主题的 WCAG 对比度审计 |
| `smoke.mjs` | 交互冒烟：锚点跳转、主题开关、已移除元素确认 |
| `nav-check.mjs` | 点击左栏的落点与高亮复核（不用视口覆盖，见下方注意） |
| `shot.mjs` / `shot-scrolled.mjs` | 截图（后者可指定滚动位置或选择器） |

> headless 注意两条：
> 1. CDP 的 `Emulation.setDeviceMetricsOverride` 会让 `position: sticky` 失效、
>    也会影响锚点落点，排查定位/滚动问题要用 `--no-override`（用 Chrome 窗口尺寸定视口）。
> 2. 机器上访问不到 fonts.googleapis.com 时，外部样式会一直挂住 DOM 解析
>    （`readyState` 停在 loading），脚本里要 `Network.setBlockedURLs` 掐掉外部请求。

## 已知取舍

- Hermes 章节页头只保留「眉标 / 标题 / 一句话说明 / 官方文档链接」；**状态徽标、学习状态按钮、
  章末翻页键都已移除**，进度不再记录（旧的 `hermes-learning-progress-v1` 数据不再读写）。
- 官方文档链接放在页头末尾单独一行，文字后不带 ↗ 箭头——原来那个箭头会把行宽顶出去。
  正文「选读资料」表格里的 ↗ 是原文内容，保留。
- Hermes 左栏只到「章」这一层：六章内部的小节标题仍有 id，可以直接用
  `#sec-学习目标` 这类链接深链，但不出现在导航里。
- 首页只保留介绍与课程卡片。
