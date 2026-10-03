# Natural Language Processing

从 Hermes Agent 到 NLP 的学习笔记。每份讲义都能自己跑一遍：讲清概念、给可照抄的命令与验收方式。网站使用 Vue 3、Vue Router 与 Vite，课程正文和公共导航由应用统一装配。

## 课程

| 课程 | 内容 |
| --- | --- |
| [01 · Hermes Agent 六步上手](hermes/) | 安装、快速开始、模型配置、CLI、配置文件、工具调用 |
| [02 · LLM API 与 Prompt Caching](llm-api/) | 前缀缓存命中了什么、为什么改一个字就失效、三家厂商的计费差、省钱决策单 |

[AI 日报](ai-daily/) 按日期读取独立的日报目录；数据格式与服务器持久化要求见 [ai-daily/README.md](ai-daily/README.md)。

## 本地运行

```bash
npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:8765/`。开发时可通过侧边栏切换首页、课程和 AI 日报；页面共享公共导航，正文随路由切换。

```bash
npm run build
npm run preview
```

`build` 将生产文件写入 `dist/`；`preview` 用于本地查看构建结果。

## 页面与课程结构

- `src/components/`：公共导航与共享布局。
- `src/pages/`：首页、课程和 AI 日报的页面正文。
- `src/features/`：课程交互实验及其挂载、卸载逻辑。
- `src/lib/`：生命周期资源管理等共享工具。
- `assets/`：共用样式与图标；`public/theme-init.js` 在首次绘制前恢复主题。
- `assets/studio.css`、`studio-shell.css`、`studio-reading.css`：新的设计系统、导航框架与阅读空间；`NotebookCover.vue` 和 `StudioIcon.vue` 提供共享封面与图标。
- 首页知识雕塑采用本地 Canvas 参数曲面渲染，支持方向切换、轻微视差和暂停；页面入场动画遵循减少动态效果偏好。
- `ai-daily/index.json` 与 `ai-daily/data/`：日报索引和每日 JSON 数据。

新增课程时，将正文放入 `src/pages/`，并接入对应路由与公共导航；页面专属交互放入 `src/features/`。

## 部署

部署后需为 HTML history 路由配置回退到 `index.html`，同时让缺失的 JSON 请求返回真正的 404。Nginx 示例：

```nginx
server {
    root /var/www/nlp-learning/dist;
    index index.html;

    # 日报数据目录真实存在，这三个页面入口仍交给 Vue Router。
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
