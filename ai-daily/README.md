# AI 日报数据约定

本站由 Vue 3、Vue Router 与 Vite 构建。日报正文使用固定页面模板，运行时读取 JSON；每天不生成新页面，也不需要重新构建。日报源数据保持在 `ai-daily/index.json` 与 `ai-daily/data/*.json`。

```text
ai-daily/
├── index.json      日期索引（运行时数据）
└── data/
    └── YYYY-MM-DD.json（运行时数据）

src/pages/DailyPage.vue  固定日报页面模板
```

开发服务器和 `npm run preview` 从源目录读取日报数据；`npm run build` 会把现有数据复制到 `dist/ai-daily/`。生产环境新增日报时，直接写入实际站点根目录下的 `ai-daily/index.json` 与 `ai-daily/data/`，无需重新构建。若部署新的 `dist/`，需把最新运行数据带入新目录或挂载持久数据目录，避免发布覆盖日报索引和历史数据。

## Hermes 写入格式

先原子写入 `data/YYYY-MM-DD.json`，再原子更新 `index.json`。文件均为 UTF-8 JSON。`date` 必须与文件名一致；日期格式限定为 `YYYY-MM-DD`。`index.json` 的 `entries` 按日期倒序，`latest` 指向其中一条；`file` 必须精确等于 `YYYY-MM-DD.json`。

```json
{
  "latest": "2026-09-29",
  "entries": [
    { "date": "2026-09-29", "title": "AI 日报 · 2026-09-29", "file": "2026-09-29.json" }
  ]
}
```

每日 JSON 使用固定的语义字段。`top5` 最多显示 5 条，实际可少于 5 条；`openai`、`claude`、`deepseek` 即使无重大更新也会显示简短说明。`other_major_updates` 为空时隐藏；`editor_note` 缺失时隐藏。`glance` 只有一句总结也能显示。

```json
{
  "date": "2026-09-29",
  "title": "AI 日报",
  "meta": {
    "generated_at": "2026-09-29T08:00:00+08:00",
    "search_cutoff": "2026-09-29T07:50:00+08:00",
    "timezone": "Asia/Shanghai"
  },
  "glance": { "summary": "今日概览。", "highlights": ["重点一", "重点二"] },
  "top5": [],
  "openai": { "items": [], "note": "今日暂无值得单独报道的重大更新。" },
  "claude": { "items": [] },
  "deepseek": { "items": [] },
  "other_major_updates": { "items": [] },
  "editor_note": { "content": ["观察第一段。", "观察第二段。"] }
}
```

`top5` 和各厂商、其他重大更新中的新闻项共用以下字段：

```json
{
  "brand": "OpenAI",
  "status": "官方发布",
  "title": "新闻标题",
  "summary": "事实摘要",
  "analysis": "可选的观察分析",
  "published_at": "2026-09-29T06:00:00+08:00",
  "url": "https://example.com/article",
  "primary_source": { "name": "官方来源", "url": "https://example.com/official" },
  "sources": [
    { "name": "官方来源", "url": "https://example.com/official" },
    { "name": "其他来源", "url": "https://example.com/other" }
  ]
}
```

除 `title` 外，新闻项字段可缺省。状态标签支持：`已确认`、`官方发布`、`官方预告`、`OpenAI员工动态`、`可靠爆料`、`传闻`。来源只接受 HTTP/HTTPS 链接；文本使用 `textContent` 渲染。`editor_note` 不是新闻列表，也可在没有 `content` 时使用 `summary` 或 `points`。两天纯模拟测试数据位于 `tests/fixtures/ai-daily/`，**不在正式索引中**。

## URL、缓存与部署

- `/ai-daily/` 打开 `index.json.latest` 指向的日报，不根据系统当天日期推测。
- `/ai-daily/?date=YYYY-MM-DD` 打开指定日期；历史导航使用可分享的普通链接，浏览器前进、后退和刷新均保留日期。
- 每次打开只请求 `index.json` 和所选日期的 JSON。索引和最新日报使用 `no-store` 加刷新参数，避免静态服务器在文件被快速替换时返回旧的 304；历史日报使用浏览器默认缓存策略。服务器或 CDN 也应让索引短缓存或重新验证。
- 本地日报源是项目根目录下的 `ai-daily/index.json` 和 `ai-daily/data/`；build 将已有文件带入 `dist/ai-daily/`。生产环境应将运行数据持久化，并在发布新 `dist/` 时保留最新索引和 JSON 文件。
- 部署必须支持 HTML history 路由回退到 `index.html`，但缺失的 JSON 必须返回真实 404，不能回退成 HTML。Nginx 可使用以下配置：

```nginx
server {
    root /var/www/nlp-learning/dist;
    index index.html;

    location ~ ^/(hermes|llm-api|ai-daily)/?$ {
        try_files /index.html =404;
    }

    location ~* \.json$ {
        try_files $uri =404;
        add_header Cache-Control "no-store";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

以后调整网页视觉，只改固定模板或日报样式，所有历史日报都会使用新样式。每天发布只需新增一份 JSON 并更新索引，无需修改网站代码、重新构建或重启静态服务。
