# Prompt Caching 与稳定前缀

本项目对应《大模型与自然语言处理》第 2 次实验的 C 题：为什么前缀稳定能省钱。

网页从“改一个字，后面为什么重算”入手，用可编辑请求展示稳定前缀、时间戳位置、工具顺序与缓存过期，再对比 OpenAI 与 Anthropic 的缓存用法及用量字段。

## 工具与模型

- Deepseek Harness
- codex
- cursor
- GPT6.1 sol
- claude opus5.5


## 使用

双击 `index.html` 打开。页面使用原生 HTML、CSS、JavaScript，不需要安装依赖。迁移时保留 `assets/` 和 `licenses/`。官方资料链接需要联网；复制按钮受浏览器权限限制时，可以手动选择代码复制。

## 项目资料

- `AGENTS.md`：Task / Constraints / Data / Output 项目规格。
- `SOURCES.md`：官方参考资料。
- `TASK_REQUIREMENTS.md`：实验要求与评分维度。
- `logs/prompt-log.md`：两版 Prompt、问题分析、规格修改与结论。
- `logs/reflection.md`：Hermes prompt_builder.py 的阅读反思。
- `logs/development-log.md`：探索、建构、迭代与交付过程。

## 发布

将 `index.html`、`assets/` 和 `licenses/` 上传到个人独立的静态站点，保持相对路径。课程提交材料可附网页地址、仓库地址及过程记录。

配套过程材料为依据任务书与现有网页整理的实验写作示例。
