# 参考资料

- [OpenAI Prompt Caching](https://developers.openai.com/api/docs/guides/prompt-caching)：缓存入口、稳定前缀、用量字段及具体模型规则。
- [Anthropic Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)：显式断点、自动缓存、缓存写入和读取字段。
- [Hermes agent/prompt_builder.py](https://github.com/NousResearch/hermes-agent/blob/main/agent/prompt_builder.py)：项目上下文发现、AGENTS.md 加载和内容整理。
- [Hermes Prompt Assembly](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/developer-guide/prompt-assembly.md)：系统提示的分层与排列。

本页 Anthropic 示例讲解内容块上的显式断点；官方也支持顶层 cache_control 自动管理断点。token 切分、过期和成本图采用教学简化，具体模型的长度门槛、有效期与价格以官方文档为准。
