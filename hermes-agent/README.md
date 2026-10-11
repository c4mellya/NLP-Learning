# Hermes Agent 快速入门

从个人站现有 PHP 讲义导出的独立静态页面。双击 `index.html` 打开；复制整个文件夹即可迁移。正文、教学数据、样式和交互来自当前源码，保留现有效果。

页面不依赖 PHP、npm、CDN 或远程数据接口。字体在 `assets/fonts.css` 中内嵌，许可保留在 `licenses/`。官方文档链接需要联网。

原个人站导航改为页内导航，课程目录和相邻讲义链接改为返回本篇开头，避免依赖其他页面。内容中的命令、工具调用和输出均为教学示例，页面不会安装 Hermes 或执行命令。

某些浏览器会限制本地文件的剪贴板访问；复制按钮失败时按提示手动复制。网页保留系统减少动效偏好及原有动效开关。

静态托管只需上传 `index.html`、`assets/`、`licenses/`。本次未进行浏览器验收、测试或公网部署。

源码入口：`app/views/pages/learning/nlp/hermes-agent-getting-started.php`。
