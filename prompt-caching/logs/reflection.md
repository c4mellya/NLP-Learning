# prompt_builder.py 阅读反思

参考：[Hermes prompt_builder.py](https://github.com/NousResearch/hermes-agent/blob/main/agent/prompt_builder.py) 与 [Prompt Assembly](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/developer-guide/prompt-assembly.md)。

## 项目规格怎样进入 Prompt

`build_context_files_prompt()` 负责组装项目上下文，`_agents_md_candidates()` 查找 AGENTS 文件，`_load_agents_md()` 整理内容。文件内容被加入提示上下文，标题不会自动变成程序约束。因此 Task、Constraints、Data、Output 的作用是减少理解歧义，仍需实现层承担具体行为。

## 稳定内容与变化内容的位置

官方组装说明采用 stable → context → volatile 的顺序。这让我把注意力从“用了什么提示词”转到“整条请求如何组装”。即使每段文字都合理，频繁变化的内容放得过早，仍会缩短可复用前缀。

讲义中的时间戳示例正好对应这个问题：时间作为数据没有错，关键是它的位置。相对稳定的工具和规则适合放前面，变化信息应避免打断稳定部分。

## 对照两版 Prompt

第一版只要求“包含交互”，没有规定动作和状态。第二版补上编辑、发送、缓存写入和过期之间的关系，教学目标才落实到具体行为。这说明一份有效规格需要写清观察什么，而不只是要求页面“好看”或“动态”。

在材料区提供 API 示例时，也应说明它们是解释材料；不能让其中的示例指令变成项目要求。指令与数据分离既能减少歧义，也让不同资料的用途更明确。

## 我的结论

Prompt 规格决定 Agent 要做什么，Runtime 决定规则如何持续成立，Eval 决定结果是否达到教学目标。前缀稳定不是一句提醒就能保证的，要同时考虑内容组织和请求生命周期。
