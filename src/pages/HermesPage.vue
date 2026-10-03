<template>
  <div class="site-shell">
<main class="site-main" id="main" ref="pageRoot">

<article class="note note-intro" id="note-overview">
<header class="course-intro notebook-cover">
<div class="course-intro-copy"><p class="course-eyebrow">NOTEBOOK 01 / AGENT · CLI</p>
<h1 id="note-overview-title">把第一个 Agent，<br/><span>带进真实任务。</span></h1>
<p class="course-intro-desc">Hermes Agent 六步上手。从环境搭建、模型配置到工具调用，建立一条可以亲手验证的实践路线。</p>
<div class="course-actions"><RouterLink class="course-primary" to="/hermes/#note-install-title">开始第一步 <span aria-hidden="true" class="ip-icon ip-arrow-up-right"></span></RouterLink><a class="course-secondary" href="https://hermes-agent.nousresearch.com/docs/zh-Hans/getting-started/learning-path" rel="noopener" target="_blank">官方学习路径 <span aria-hidden="true" class="ip-icon ip-arrow-up-right"></span></a></div>
</div>
<NotebookCover kind="agent" />
</header>
<div class="course-meta-strip"><span><b>06</b> 实践步骤</span><span>命令示例</span><span>逐步验收</span><span class="meta-marker">PRACTICE FIRST <i>↗</i></span></div>
<nav aria-label="六步实践路线" class="journey-map"><RouterLink to="/hermes/#note-install-title"><span>01</span><b>安装环境</b><small>STEP 01</small></RouterLink><RouterLink to="/hermes/#note-quickstart-title"><span>02</span><b>第一次对话</b><small>STEP 02</small></RouterLink><RouterLink to="/hermes/#note-providers-title"><span>03</span><b>模型配置</b><small>STEP 03</small></RouterLink><RouterLink to="/hermes/#note-cli-title"><span>04</span><b>熟悉 CLI</b><small>STEP 04</small></RouterLink><RouterLink to="/hermes/#note-config-title"><span>05</span><b>管理配置</b><small>STEP 05</small></RouterLink><RouterLink to="/hermes/#note-tools-title"><span>06</span><b>调用工具</b><small>STEP 06</small></RouterLink></nav><details class="course-reading-note"><summary>关于这份讲义与学习方式</summary><p class="note-desc">Hermes 是 Nous Research 开源的自主 agent（MIT、自托管、Python）。这份材料不做「它很厉害」的介绍，只把官方文档里最必要的内容压成一条六步路线：命令能在 Shell 里找到、模型和 Provider 配好、能跑通第一次对话并恢复会话、能看懂状态与 Context、分得清普通配置与 Secret、并且能让它用工具真的产出一个文件。</p><p class="note-desc">每一步都给四样东西：官方文档入口、要做什么、可直接照抄的命令、以及验收方式。<strong>没通过验收就不该往下走。</strong></p></details>
<div class="reading-divider"><span>THE PRACTICE</span><p>一步一步，把理解变成能验证的结果。</p><span>06 STEPS ↓</span></div></article>
<article class="note" data-nav-group="课程 01 · Hermes Agent" data-nav-num="off" data-step="01" id="note-install">
<header class="note-head"><div aria-hidden="true" class="chapter-number"><span>STEP</span><b>01</b><small>/ 06</small></div><div class="note-head-main"><p class="note-path"><span>STEP 01</span> / 安装</p><h2 data-nav-anchor="" data-nav-label="01 安装" id="note-install-title">安装 Hermes Agent</h2><p class="note-desc">从环境检查到启动诊断，建立一条可重复验证的安装路径。</p>
<p class="note-head-links"><a class="doc-link" href="https://hermes-agent.nousresearch.com/docs/getting-started/installation" rel="noopener" target="_blank">官方文档</a></p>
</div></header>
<section class="note-sec"><h3>学习目标</h3><div class="section-content"><p>完成“检查环境 → 执行安装 → 重新载入 Shell → 启动验证 → 诊断问题”的完整流程，并知道安装方式、命令入口与用户数据目录各自在哪里。</p></div></section>
<section class="note-sec"><h3>开始前需要知道</h3><div class="section-content"><div class="compare-grid"><div class="compare-col"><h4>图形安装</h4><ul class="plain-list"><li>macOS 与 Windows 可选择 Desktop 安装器</li><li>适合希望由图形界面引导完成安装的学习者</li></ul></div><div class="compare-col"><h4>命令行安装</h4><ul class="plain-list"><li>Linux、macOS、WSL2、Termux 使用 shell 脚本</li><li>Windows 原生环境使用 PowerShell 脚本</li></ul></div></div><div class="note-aside spaced"><p>非 Windows 平台主要需要 Git；Linux 还需准备 <code class="inline-code">curl</code> 与 <code class="inline-code">xz-utils</code>。其余主要依赖通常由安装器处理。执行前仍应以官方安装页的当前说明为准。</p></div></div></section>
<section class="note-sec"><h3>分步操作</h3><div class="section-content"><p class="hint-text">下面两种脚本按平台二选一，不要混用。</p><div aria-label="安装与诊断命令示例" class="terminal"><div class="terminal-bar"><span class="terminal-label" data-terminal-kind="bash-powershell" data-terminal-label="bash / PowerShell">bash / PowerShell</span></div><pre class="terminal-body"><code><span class="comment"># Linux / macOS / WSL2 / Termux</span>
<span class="prompt">$</span> curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

<span class="comment"># Windows 原生 PowerShell（二选一）</span>
<span class="prompt">PS&gt;</span> irm https://hermes-agent.nousresearch.com/install.ps1 | iex

<span class="comment"># 重新打开终端，或按当前 Shell 重新载入配置后验证</span>
<span class="prompt">$</span> source ~/.bashrc
<span class="prompt">$</span> command -v hermes
<span class="prompt">$</span> echo $PATH
<span class="prompt">$</span> hermes
<span class="prompt">$</span> hermes doctor</code></pre></div><p>安装器大致会准备运行环境、获取代码、创建隔离环境、安装依赖并使 <code class="inline-code">hermes</code> 命令可用。普通用户数据通常存放在 <code class="inline-code">~/.hermes/</code>，与安装代码的职责不同。</p></div></section>
<section class="note-sec"><h3>结果观察与排错</h3><div class="section-content"><div class="table-wrap"><table class="reading-table"><thead><tr><th scope="col">现象</th><th scope="col">先检查</th><th scope="col">处理方向</th></tr></thead><tbody><tr><td data-label="现象"><span class="cell-value">command not found</span></td><td data-label="先检查"><span class="cell-value">Shell 是否重新载入、<code class="inline-code">command -v hermes</code> 与 <code class="inline-code">$PATH</code></span></td><td data-label="处理方向"><span class="cell-value">重开终端或修正 PATH，再执行诊断</span></td></tr><tr><td data-label="现象"><span class="cell-value">缺少 API Key</span></td><td data-label="先检查"><span class="cell-value">Provider 是否完成认证</span></td><td data-label="处理方向"><span class="cell-value">运行 <code class="inline-code">hermes model</code>，只在 Secret 存储中录入凭据</span></td></tr><tr><td data-label="现象"><span class="cell-value">配置缺失</span></td><td data-label="先检查"><span class="cell-value"><code class="inline-code">hermes doctor</code> 与配置检查提示</span></td><td data-label="处理方向"><span class="cell-value">按提示补齐配置，再运行 <code class="inline-code">hermes config check</code></span></td></tr></tbody></table></div></div></section>
<section class="note-sec"><h3>核心理解</h3><div class="section-content"><div class="note-aside"><p>脚本执行结束不等于安装完成。只有命令能被 Shell 找到、交互界面能启动且诊断命令能指出环境问题，才形成了可验证的安装闭环。</p></div></div></section>
<section class="note-sec acceptance"><h3>验收方式</h3><div class="section-content"><ul class="check-list gate-list"><li class="gate-row"><code class="inline-code">hermes</code> 命令可执行并能进入交互界面</li><li class="gate-row">能说出自己的安装方式以及 <code class="inline-code">~/.hermes/</code> 的用途</li><li class="gate-row">知道用 <code class="inline-code">command -v hermes</code> 与 <code class="inline-code">echo $PATH</code> 检查命令入口</li><li class="gate-row"><code class="inline-code">hermes doctor</code> 可运行并用于诊断</li></ul>
</div></section>
<section class="note-sec summary"><h3>本步总结</h3><div class="section-content"><p>安装的结果不是“脚本跑过”，而是获得可启动、可定位、可诊断的 Hermes CLI。</p></div></section>
<RouterLink class="step-next" to="/hermes/#note-quickstart-title"><span>下一步 / 02</span><b>第一次对话 <span>→</span></b></RouterLink></article>
<article class="note" data-nav-group="课程 01 · Hermes Agent" data-nav-num="off" data-step="02" id="note-quickstart">
<header class="note-head"><div aria-hidden="true" class="chapter-number"><span>STEP</span><b>02</b><small>/ 06</small></div><div class="note-head-main"><p class="note-path"><span>STEP 02</span> / 快速开始</p><h2 data-nav-anchor="" data-nav-label="02 快速开始" id="note-quickstart-title">完成第一次 Hermes 对话</h2><p class="note-desc">配置模型、进行两轮可验证对话，并恢复最近会话。</p>
<p class="note-head-links"><a class="doc-link" href="https://hermes-agent.nousresearch.com/docs/zh-Hans/getting-started/quickstart" rel="noopener" target="_blank">官方文档</a></p>
</div></header>
<section class="note-sec"><h3>学习目标</h3><div class="section-content"><p>沿着“初始化 → 配置 Provider/Model → 第一次对话 → 恢复会话”的最短路径跑通模型调用，并能判断一次对话是否真正成功。</p></div></section>
<section class="note-sec"><h3>核心流程</h3><div class="section-content"><div aria-label="快速开始核心流程" class="flow"><div class="flow-node"><b>01</b><span>初始化</span></div><span aria-hidden="true" class="flow-arrow">→</span><div class="flow-node"><b>02</b><span>配置 Provider / Model</span></div><span aria-hidden="true" class="flow-arrow">→</span><div class="flow-node"><b>03</b><span>第一次对话</span></div><span aria-hidden="true" class="flow-arrow">→</span><div class="flow-node"><b>04</b><span>恢复会话</span></div></div><aside aria-label="模型上下文提示" class="tip-block"><strong>模型选择提示</strong><p>学习工具调用时，建议选择上下文上限至少 64K token 的模型。Secret 不应写入本页面、对话示例或公开仓库。</p></aside></div></section>
<section class="note-sec"><h3>分步操作</h3><div class="section-content"><div aria-label="快速开始命令示例" class="terminal"><div class="terminal-bar"><span class="terminal-label" data-terminal-kind="bash" data-terminal-label="bash">bash</span></div><pre class="terminal-body"><code><span class="comment"># 1. 配置 Provider、认证方式与模型</span>
<span class="prompt">$</span> hermes model
<span class="comment"># 可选：通过 Portal 引导初始化</span>
<span class="prompt">$</span> hermes setup --portal

<span class="comment"># 2. 任选一种入口开始对话</span>
<span class="prompt">$</span> hermes
<span class="prompt">$</span> hermes --tui
<span class="prompt">$</span> hermes chat -q "请用三点解释工具调用，并给出一个可验证示例"

<span class="comment"># 3. 查看与恢复会话</span>
<span class="prompt">$</span> hermes sessions list
<span class="prompt">$</span> hermes --continue
<span class="prompt">$</span> hermes -c</code></pre></div><p>第一次提问应具体、简单、可验证；收到回答后继续追问一次，例如要求澄清其中一点。恢复结果取决于所用 profile 以及会话是否已保存，因此恢复前先确认当前 profile 和会话列表。</p></div></section>
<section class="note-sec"><h3>成功观察与基础排查</h3><div class="section-content"><ul class="check-list"><li>启动信息展示预期的 Provider 与 Model</li><li>没有认证或网络错误，并能完成至少两轮连续追问</li><li>任务需要时，Hermes 能显示并调用可用工具</li></ul><div class="chain spaced"><span>hermes doctor</span><b>→</b><span>hermes model</span><b>→</b><span>重启对话</span><b>→</b><span>检查会话列表</span></div></div></section>
<section class="note-sec"><h3>核心理解</h3><div class="section-content"><div class="note-aside"><p>Quickstart 先验证 <strong>Hermes → Provider/Model → 回复 → 会话保存</strong> 的最短闭环。只有连续对话和恢复都成功，才说明基础链路不只是偶然返回了一条消息。</p></div></div></section>
<section class="note-sec acceptance"><h3>验收方式</h3><div class="section-content"><ul class="check-list gate-list"><li class="gate-row">Provider 与 Model 已完成配置</li><li class="gate-row">围绕同一问题完成至少两轮连续对话</li><li class="gate-row">能从启动信息判断模型链路没有认证或网络错误</li><li class="gate-row">使用 <code class="inline-code">hermes --continue</code> 或 <code class="inline-code">hermes -c</code> 成功恢复最近会话</li></ul>
</div></section>
<section class="note-sec summary"><h3>本步总结</h3><div class="section-content"><p>第一次成功使用包含配置、对话、观察与恢复四个环节；它是后续 CLI、配置和工具学习的基线。</p></div></section>
<RouterLink class="step-next" to="/hermes/#note-providers-title"><span>下一步 / 03</span><b>模型配置 <span>→</span></b></RouterLink></article>
<article class="note" data-nav-group="课程 01 · Hermes Agent" data-nav-num="off" data-step="03" id="note-providers">
<header class="note-head"><div aria-hidden="true" class="chapter-number"><span>STEP</span><b>03</b><small>/ 06</small></div><div class="note-head-main"><p class="note-path"><span>STEP 03</span> / 模型配置</p><h2 data-nav-anchor="" data-nav-label="03 模型配置" id="note-providers-title">理解模型服务配置</h2><p class="note-desc">理解连接链路中的五个概念，并安全配置教师提供的 API。</p>
<p class="note-head-links"><a class="doc-link" href="https://hermes-agent.nousresearch.com/docs/integrations/providers" rel="noopener" target="_blank">官方文档</a></p>
</div></header>
<section class="note-sec"><h3>学习目标</h3><div class="section-content"><p>能解释 Provider、Model、Base URL、API Key/OAuth、API mode 的职责，区分配置向导与会话内切换，并完成一次明确指定模型的验证。</p></div></section>
<section class="note-sec"><h3>完整连接链路</h3><div class="section-content"><div class="chain"><span>Hermes</span><b>→</b><span>Provider</span><b>→</b><span>Base URL</span><b>→</b><span>Model</span><b>→</b><span>API Key / OAuth</span><b>↔</b><span>API mode</span></div><dl class="def-list spaced"><div class="def-row"><dt>Provider</dt><dd>提供模型服务或兼容接口的平台；它决定请求发往哪类服务。</dd></div><div class="def-row"><dt>Model</dt><dd>实际执行推理的模型标识。标识必须与 Provider 端开放的模型一致。</dd></div><div class="def-row"><dt>Base URL</dt><dd>API 请求的服务根地址。自定义兼容服务尤其需要核对路径。</dd></div><div class="def-row"><dt>API Key / OAuth</dt><dd>证明访问权限的认证方式。Key 属于 Secret；OAuth 凭据由认证存储管理。</dd></div><div class="def-row"><dt>API mode</dt><dd>请求与响应所遵循的接口协议模式，必须和目标服务兼容。</dd></div></dl></div></section>
<section class="note-sec"><h3>两个 model 命令的区别</h3><div class="section-content"><div class="table-wrap"><table class="reading-table"><thead><tr><th scope="col">入口</th><th scope="col">用途</th><th scope="col">边界</th></tr></thead><tbody><tr><td data-label="入口"><span class="cell-value"><code class="inline-code">hermes model</code></span></td><td data-label="用途"><span class="cell-value">新增 Provider、完成认证、配置模型</span></td><td data-label="边界"><span class="cell-value">终端中的配置入口</span></td></tr><tr><td data-label="入口"><span class="cell-value"><code class="inline-code">/model</code></span></td><td data-label="用途"><span class="cell-value">查看或切换已配置项</span></td><td data-label="边界"><span class="cell-value">只在当前交互会话内使用，不负责新增认证</span></td></tr></tbody></table></div></div></section>
<section class="note-sec"><h3>推荐操作流程</h3><div class="section-content"><div aria-label="Provider 配置与验证命令" class="terminal"><div class="terminal-bar"><span class="terminal-label" data-terminal-kind="bash-hermes-session" data-terminal-label="bash / hermes 交互">bash / hermes 交互</span></div><pre class="terminal-body"><code><span class="prompt">$</span> hermes model
<span class="prompt">$</span> hermes config
<span class="prompt">$</span> hermes chat --provider &lt;provider-name&gt; --model &lt;model-id&gt; -q "请回复：配置验证成功"
<span class="prompt">$</span> hermes
<span class="prompt">&gt;</span> /model</code></pre></div><p class="hint-text">普通配置放入 config.yaml，API Key 等 Secret 放入 .env，OAuth 由认证存储管理。</p><div aria-label="config.yaml 教学示例" class="terminal"><div class="terminal-bar"><span class="terminal-label" data-terminal-kind="config-yaml" data-terminal-label="config.yaml">config.yaml</span></div><pre class="terminal-body"><code>model:
  provider: &lt;provider-name&gt;
  default: &lt;model-id&gt;
  base_url: https://provider.example/v1
  api_mode: &lt;api-mode&gt;</code></pre></div></div></section>
<section class="note-sec"><h3>结果观察与常见错误</h3><div class="section-content"><div class="table-wrap"><table class="reading-table"><thead><tr><th scope="col">错误</th><th scope="col">检查方向</th></tr></thead><tbody><tr><td data-label="错误"><span class="cell-value">认证失败</span></td><td data-label="检查方向"><span class="cell-value">确认 Provider、Key/OAuth 状态与 Secret 位置，不打印凭据</span></td></tr><tr><td data-label="错误"><span class="cell-value">模型 ID 错</span></td><td data-label="检查方向"><span class="cell-value">核对教师提供的 <code class="inline-code">&lt;model-id&gt;</code> 与大小写</span></td></tr><tr><td data-label="错误"><span class="cell-value">Base URL 错</span></td><td data-label="检查方向"><span class="cell-value">核对协议、主机与接口路径，避免重复路径</span></td></tr><tr><td data-label="错误"><span class="cell-value">API mode 不匹配</span></td><td data-label="检查方向"><span class="cell-value">确认服务要求的请求协议并修改普通配置</span></td></tr><tr><td data-label="错误"><span class="cell-value">上下文不足</span></td><td data-label="检查方向"><span class="cell-value">改用满足任务上下文要求的已配置模型，或缩小输入</span></td></tr></tbody></table></div></div></section>
<section class="note-sec"><h3>核心理解</h3><div class="section-content"><div class="note-aside"><p>Hermes 负责 Agent 行为、工具与任务流程；Provider 负责模型推理与鉴权。配置就是把协议、地址、模型和认证正确地连接起来。</p></div></div></section>
<section class="note-sec acceptance"><h3>验收方式</h3><div class="section-content"><ul class="check-list gate-list"><li class="gate-row">能解释 Provider、Model、Base URL、API Key/OAuth、API mode 五个概念</li><li class="gate-row">能说明 <code class="inline-code">hermes model</code> 与 <code class="inline-code">/model</code> 的区别</li><li class="gate-row">按安全存储规则成功配置教师提供的 API</li><li class="gate-row">明确指定 Provider 与 Model 后能收到验证回复</li></ul>
</div></section>
<section class="note-sec summary"><h3>本步总结</h3><div class="section-content"><p>模型配置是一条端到端连接链；任一环节不匹配，都应按概念边界逐项定位。</p></div></section>
<RouterLink class="step-next" to="/hermes/#note-cli-title"><span>下一步 / 04</span><b>熟悉 CLI <span>→</span></b></RouterLink></article>
<article class="note" data-nav-group="课程 01 · Hermes Agent" data-nav-num="off" data-step="04" id="note-cli">
<header class="note-head"><div aria-hidden="true" class="chapter-number"><span>STEP</span><b>04</b><small>/ 06</small></div><div class="note-head-main"><p class="note-path"><span>STEP 04</span> / CLI</p><h2 data-nav-anchor="" data-nav-label="04 CLI" id="note-cli-title">掌握 Hermes 常用命令</h2><p class="note-desc">从启动、交互到恢复，学会读懂状态和 Context。</p>
<p class="note-head-links"><a class="doc-link" href="https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/cli" rel="noopener" target="_blank">官方文档</a></p>
</div></header>
<section class="note-sec"><h3>学习目标</h3><div class="section-content"><p>能选择合适的启动方式，使用五个核心斜杠命令，并完成多行输入、中断操作与会话恢复。</p></div></section>
<section class="note-sec"><h3>启动方式</h3><div class="section-content"><div aria-label="CLI 启动方式" class="terminal"><div class="terminal-bar"><span class="terminal-label" data-terminal-kind="bash" data-terminal-label="bash">bash</span></div><pre class="terminal-body"><code><span class="prompt">$</span> hermes
<span class="prompt">$</span> hermes --tui
<span class="prompt">$</span> hermes chat -q "请概括当前任务"
<span class="prompt">$</span> hermes --continue
<span class="prompt">$</span> hermes --resume &lt;session-id&gt;</code></pre></div><p class="hint-text">前两项进入交互界面，<code class="inline-code">chat -q</code> 适合单次问题；后两项分别恢复最近会话与指定会话。</p></div></section>
<section class="note-sec"><h3>命令速查</h3><div class="section-content"><p class="hint-text">选择命令查看用途与通用占位输出；页面内容不代表当前机器的实际状态。</p><div class="cmd-layout"><div aria-label="CLI 命令" class="cmd-list" id="cmd-list" role="tablist"><button aria-controls="cmd-panel" aria-selected="true" class="cmd-item active" data-cmd="help" id="cmd-tab-help" role="tab" tabindex="0" type="button">/help</button><button aria-controls="cmd-panel" aria-selected="false" class="cmd-item" data-cmd="model" id="cmd-tab-model" role="tab" tabindex="-1" type="button">/model</button><button aria-controls="cmd-panel" aria-selected="false" class="cmd-item" data-cmd="tools" id="cmd-tab-tools" role="tab" tabindex="-1" type="button">/tools</button><button aria-controls="cmd-panel" aria-selected="false" class="cmd-item" data-cmd="status" id="cmd-tab-status" role="tab" tabindex="-1" type="button">/status</button><button aria-controls="cmd-panel" aria-selected="false" class="cmd-item" data-cmd="context" id="cmd-tab-context" role="tab" tabindex="-1" type="button">/context</button></div><div aria-labelledby="cmd-tab-help" aria-live="polite" class="cmd-detail" id="cmd-panel" role="tabpanel" tabindex="0"><div><span class="mini-label">作用</span><p id="cmd-role"></p></div><div><span class="mini-label">示例输出</span><pre class="codeblock" id="cmd-output"></pre></div><div><span class="mini-label">学习提示</span><p id="cmd-note"></p></div></div></div></div></section>
<section class="note-sec"><h3>如何阅读状态与 Context</h3><div class="section-content"><dl class="def-list"><div class="def-row"><dt>Model / Provider</dt><dd>确认请求将使用哪个已配置模型以及模型服务来源。</dd></div><div class="def-row"><dt>会话状态</dt><dd>判断会话是否可继续工作，出现异常时结合诊断命令排查。</dd></div><div class="def-row"><dt>工具 / 文件摘要</dt><dd>了解当前可用能力以及会话已涉及的文件范围。</dd></div><div class="def-row"><dt>Token 使用</dt><dd>同时看已用 token、上下文上限和占用比例，而不是只看单一数值。</dd></div><div class="def-row"><dt>压缩</dt><dd>接近上限时关注压缩状态；压缩用于保留关键信息并释放上下文空间。</dd></div></dl></div></section>
<section class="note-sec"><h3>输入与会话操作</h3><div class="section-content"><div class="table-wrap"><table class="reading-table"><thead><tr><th scope="col">操作</th><th scope="col">用途</th></tr></thead><tbody><tr><td data-label="操作"><span class="cell-value">Enter</span></td><td data-label="用途"><span class="cell-value">发送当前输入</span></td></tr><tr><td data-label="操作"><span class="cell-value">Alt+Enter / Ctrl+J</span></td><td data-label="用途"><span class="cell-value">插入换行，编写多行提示</span></td></tr><tr><td data-label="操作"><span class="cell-value">Ctrl+C</span></td><td data-label="用途"><span class="cell-value">中断当前生成或操作；使用后检查会话状态</span></td></tr><tr><td data-label="操作"><span class="cell-value">Tab</span></td><td data-label="用途"><span class="cell-value">在支持的输入位置补全命令或候选项</span></td></tr><tr><td data-label="操作"><span class="cell-value"><code class="inline-code">/title</code></span></td><td data-label="用途"><span class="cell-value">为当前会话设置便于识别的标题</span></td></tr></tbody></table></div></div></section>
<section class="note-sec"><h3>顺序练习与结果观察</h3><div class="section-content"><div aria-label="CLI 顺序练习" class="terminal"><div class="terminal-bar"><span class="terminal-label" data-terminal-kind="hermes-session" data-terminal-label="hermes 交互">hermes 交互</span></div><pre class="terminal-body"><code><span class="prompt">&gt;</span> /help
<span class="prompt">&gt;</span> /model
<span class="prompt">&gt;</span> /tools
<span class="prompt">&gt;</span> /status
<span class="prompt">&gt;</span> /context
<span class="comment"># 退出后在 Shell 中恢复</span>
<span class="prompt">$</span> hermes --continue</code></pre></div>
<p>按顺序执行后，口头说明当前模型与 Provider、可用工具、Context 占用与压缩状态；再用多行输入发送一条消息，并练习中断一次可安全重试的生成。</p></div></section>
<section class="note-sec"><h3>核心理解</h3><div class="section-content"><div class="note-aside"><p>斜杠命令是对“当前会话”的观察入口，Shell 参数负责“如何启动或恢复”。把两类入口分清，排错时才不会把会话切换误当成全局配置。</p></div></div></section>
<section class="note-sec acceptance"><h3>验收方式</h3><div class="section-content"><ul class="check-list gate-list"><li class="gate-row">能用 <code class="inline-code">/help</code>、<code class="inline-code">/model</code>、<code class="inline-code">/tools</code> 查看帮助、模型和工具</li><li class="gate-row">能用 <code class="inline-code">/status</code> 与 <code class="inline-code">/context</code> 解释状态、用量和压缩</li><li class="gate-row">能完成多行输入并使用 Ctrl+C 中断</li><li class="gate-row">能退出并恢复最近一次或指定会话</li></ul>
</div></section>
<section class="note-sec summary"><h3>本步总结</h3><div class="section-content"><p>CLI 学习的核心是会启动、会观察、会控制、会恢复，而不是记住所有高级命令。</p></div></section>
<RouterLink class="step-next" to="/hermes/#note-config-title"><span>下一步 / 05</span><b>管理配置 <span>→</span></b></RouterLink></article>
<article class="note" data-nav-group="课程 01 · Hermes Agent" data-nav-num="off" data-step="05" id="note-config">
<header class="note-head"><div aria-hidden="true" class="chapter-number"><span>STEP</span><b>05</b><small>/ 06</small></div><div class="note-head-main"><p class="note-path"><span>STEP 05</span> / 配置文件</p><h2 data-nav-anchor="" data-nav-label="05 配置文件" id="note-config-title">区分普通配置与 Secret</h2><p class="note-desc">理解目录职责、配置优先级，并通过 CLI 安全管理配置。</p>
<p class="note-head-links"><a class="doc-link" href="https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/configuration" rel="noopener" target="_blank">官方文档</a></p>
</div></header>
<section class="note-sec"><h3>学习目标</h3><div class="section-content"><p>能找到四个核心文件，解释配置覆盖顺序，使用 CLI 查看、修改、检查配置，同时不展示或提交任何 Secret。</p></div></section>
<section class="note-sec"><h3><code class="inline-code">~/.hermes/</code> 目录职责</h3><div class="section-content"><div aria-label="Hermes 用户目录树" class="terminal"><div class="terminal-bar"><span class="terminal-label" data-terminal-kind="directory-tree" data-terminal-label="目录树">目录树</span></div><pre class="terminal-body"><code>~/.hermes/
├── config.yaml   <span class="comment"># 普通运行配置</span>
├── .env          <span class="comment"># API Key 等 Secret</span>
├── auth.json     <span class="comment"># OAuth 认证存储</span>
├── SOUL.md       <span class="comment"># Agent 身份与行为说明</span>
├── memories/     <span class="comment"># 长期记忆资料</span>
├── skills/       <span class="comment"># 可用技能</span>
├── sessions/     <span class="comment"># 已保存会话</span>
└── logs/         <span class="comment"># 诊断日志</span></code></pre></div></div></section>
<section class="note-sec"><h3>配置文件查看器</h3><div class="section-content"><p class="hint-text">以下均为教学占位符，不是当前机器配置，也不包含真实凭据。</p><div class="file-layout"><div aria-label="Hermes 配置文件" class="file-tree" id="file-tree" role="tablist"><span class="file-tree-root">~/.hermes/</span><button aria-controls="file-panel" aria-selected="true" class="file-item active" data-file="config.yaml" id="file-tab-config" role="tab" tabindex="0" type="button">config.yaml</button><button aria-controls="file-panel" aria-selected="false" class="file-item" data-file=".env" id="file-tab-env" role="tab" tabindex="-1" type="button">.env</button><button aria-controls="file-panel" aria-selected="false" class="file-item" data-file="SOUL.md" id="file-tab-soul" role="tab" tabindex="-1" type="button">SOUL.md</button></div><div aria-labelledby="file-tab-config" class="file-viewer" id="file-panel" role="tabpanel" tabindex="0"><div class="file-viewer-head" id="file-name">config.yaml</div><pre class="codeblock" id="file-code"></pre><p class="file-desc" id="file-desc"></p></div></div></div></section>
<section class="note-sec"><h3>使用 CLI 管理配置</h3><div class="section-content"><div aria-label="配置管理命令" class="terminal"><div class="terminal-bar"><span class="terminal-label" data-terminal-kind="bash" data-terminal-label="bash">bash</span></div><pre class="terminal-body"><code><span class="comment"># 查看与编辑</span>
<span class="prompt">$</span> hermes config
<span class="prompt">$</span> hermes config edit

<span class="comment"># 设置普通值与 Secret（示例仅用占位符）</span>
<span class="prompt">$</span> hermes config set model.default &lt;model-id&gt;
<span class="prompt">$</span> hermes config set PROVIDER_API_KEY your_api_key_here

<span class="comment"># 检查与迁移</span>
<span class="prompt">$</span> hermes config check
<span class="prompt">$</span> hermes config migrate</code></pre></div><p>普通配置还可通过环境变量引用，例如 <code class="inline-code">api_key: ${PROVIDER_API_KEY}</code>；示例和值都只使用占位符。</p></div></section>
<section class="note-sec"><h3>配置优先级</h3><div class="section-content"><div class="chain"><span>CLI 参数</span><b>→</b><span>config.yaml</span><b>→</b><span>.env</span><b>→</b><span>内置默认值</span></div><div class="note-aside spaced"><p>左侧优先级更高。CLI 参数适合一次性覆盖，不必改变持久设置；<code class="inline-code">config.yaml</code> 与 <code class="inline-code">.env</code> 用于需要跨会话保留的配置，二者分别承载普通值与 Secret。</p></div></div></section>
<section class="note-sec"><h3>普通配置 vs Secret</h3><div class="section-content"><div class="compare-grid"><div class="compare-col"><h4>普通配置 · config.yaml</h4><ul class="plain-list"><li>Provider、Model、Base URL</li><li>终端后端、压缩与工具选项</li><li>可安全分享的功能设置</li></ul></div><div class="compare-col"><h4>Secret · .env / 认证存储</h4><ul class="plain-list"><li>API Key 与 Token</li><li>Password</li><li>OAuth 凭据</li></ul></div></div><aside aria-label="Secret 安全说明" class="tip-block"><strong>安全说明</strong><p>不要把真实凭据写进前端页面、config.yaml、聊天记录或公开仓库；也不要通过截图、日志或命令输出展示 Secret。</p></aside></div></section>
<section class="note-sec"><h3>练习与结果观察</h3><div class="section-content"><ul class="check-list"><li>运行 <code class="inline-code">hermes config</code> 查看普通配置</li><li>确认 config.yaml 中没有 API Key、Token 或 Password</li><li>找到 Secret 存放位置，但不要打开、复制或展示其内容</li><li>用 CLI 修改一个非敏感值，再运行 <code class="inline-code">hermes config check</code></li></ul></div></section>
<section class="note-sec"><h3>核心理解</h3><div class="section-content"><div class="note-aside"><p>配置管理同时解决“行为如何持久化”和“凭据如何隔离”。优先级帮助解释最终生效值，文件边界帮助避免 Secret 泄露。</p></div></div></section>
<section class="note-sec acceptance"><h3>验收方式</h3><div class="section-content"><ul class="check-list gate-list"><li class="gate-row">能找到并说明 config.yaml、.env、auth.json、SOUL.md 四个核心文件</li><li class="gate-row">能解释 CLI 参数到内置默认值的优先级</li><li class="gate-row">能通过 CLI 查看、编辑、设置并检查配置</li><li class="gate-row">操作与分享过程中不泄露 Secret</li></ul>
</div></section>
<section class="note-sec summary"><h3>本步总结</h3><div class="section-content"><p>普通配置决定 Hermes 如何运行，Secret 只提供访问权限；正确的优先级与存储边界同样重要。</p></div></section>
<RouterLink class="step-next" to="/hermes/#note-tools-title"><span>下一步 / 06</span><b>调用工具 <span>→</span></b></RouterLink></article>
<article class="note" data-nav-group="课程 01 · Hermes Agent" data-nav-num="off" data-step="06" id="note-tools">
<header class="note-head"><div aria-hidden="true" class="chapter-number"><span>STEP</span><b>06</b><small>/ 06</small></div><div class="note-head-main"><p class="note-path"><span>STEP 06</span> / 工具调用</p><h2 data-nav-anchor="" data-nav-label="06 工具调用" id="note-tools-title">让 Hermes 完成真实任务</h2><p class="note-desc">理解 Tool Calling 循环，并交付一个可人工复核的文件结果。</p>
<p class="note-head-links"><a class="doc-link" href="https://hermes-agent.nousresearch.com/docs/zh-Hans/user-guide/features/tools" rel="noopener" target="_blank">官方文档</a></p>
<p class="note-head-links"><a class="doc-link" href="https://hermes-agent.nousresearch.com/docs/zh-Hans/getting-started/learning-path" rel="noopener" target="_blank">官方文档</a></p>
</div></header>
<section class="note-sec"><h3>学习目标</h3><div class="section-content"><p>理解从任务判断到文件交付的 Tool Calling 循环，识别实际使用的工具，并比较 local 与 docker 执行环境的基本差别。</p></div></section>
<section class="note-sec"><h3>Tool Calling 核心循环</h3><div class="section-content"><div class="chain"><span>理解任务</span><b>→</b><span>选择工具</span><b>→</b><span>执行调用</span><b>→</b><span>读取结果</span><b>→</b><span>继续行动</span><b>→</b><span>交付文件</span></div><div class="note-aside spaced"><p>模型负责决定下一步，工具负责对环境执行动作；每次结果都会成为后续判断的依据，所以最后还要重新读取产物，而不是只相信“已完成”的文字回复。</p></div></div></section>
<section class="note-sec"><h3>常见工具类型</h3><div class="section-content"><div class="table-wrap"><table class="reading-table"><thead><tr><th scope="col">类型</th><th scope="col">教学职责</th></tr></thead><tbody><tr><td data-label="类型"><span class="cell-value">terminal / process</span></td><td data-label="教学职责"><span class="cell-value">执行命令与管理进程</span></td></tr><tr><td data-label="类型"><span class="cell-value">read_file / patch</span></td><td data-label="教学职责"><span class="cell-value">读取文件与进行受控修改</span></td></tr><tr><td data-label="类型"><span class="cell-value">web_search / web_extract</span></td><td data-label="教学职责"><span class="cell-value">检索网页与提取所需内容</span></td></tr><tr><td data-label="类型"><span class="cell-value">todo / delegate_task</span></td><td data-label="教学职责"><span class="cell-value">规划任务与委派独立工作</span></td></tr><tr><td data-label="类型"><span class="cell-value">memory / session_search</span></td><td data-label="教学职责"><span class="cell-value">查找记忆或历史会话信息</span></td></tr></tbody></table></div><p class="hint-text">名称随配置与版本能力而异，实际可用工具始终以 <code class="inline-code">hermes tools</code> 或会话内 <code class="inline-code">/tools</code> 输出为准。</p></div></section>
<section class="note-sec"><h3>工具集与执行环境</h3><div class="section-content"><div aria-label="工具集和后端命令" class="terminal"><div class="terminal-bar"><span class="terminal-label" data-terminal-kind="bash" data-terminal-label="bash">bash</span></div><pre class="terminal-body"><code><span class="prompt">$</span> hermes tools
<span class="prompt">$</span> hermes chat --toolsets "terminal,file"
<span class="prompt">$</span> hermes config
<span class="comment"># 可选：按配置文档将 terminal.backend 设为 docker</span></code></pre></div><div class="compare-grid"><div class="compare-col"><h4>local</h4><ul class="plain-list"><li>直接在本机允许的范围内执行</li><li>访问方便，但需更谨慎地限定路径与命令</li></ul></div><div class="compare-col"><h4>docker</h4><ul class="plain-list"><li>在隔离容器环境中执行</li><li>隔离更清晰，但需准备 Docker 与必要的挂载/权限</li></ul></div></div></div></section>
<section class="note-sec"><h3>完整练习</h3><div class="section-content"><p class="hint-text">练习输入固定为两条记录；要求 Hermes 读取、计算、写入并复核。</p><div aria-label="sales.csv 工具调用练习" class="terminal"><div class="terminal-bar"><span class="terminal-label" data-terminal-kind="bash-hermes-session" data-terminal-label="bash / hermes 交互">bash / hermes 交互</span></div><pre class="terminal-body"><code><span class="prompt">$</span> printf "category,amount\nSoftware,299\nMedia,88\n" &gt; sales.csv
<span class="prompt">$</span> hermes
<span class="prompt">&gt;</span> 读取 sales.csv，统计记录数、总金额和平均金额，将结果写入 summary.md；重新读取文件验证，并说明实际使用的工具。
<span class="prompt">$</span> cat summary.md</code></pre></div></div></section>
<section class="note-sec"><h3>任务流程与结果观察</h3><div class="section-content"><div aria-label="工具调用任务流程" class="task-flow"><div class="task-flow-step"><b>01</b><span><strong>读取输入</strong><small>读取 sales.csv</small></span></div><span aria-hidden="true" class="task-flow-arrow">↓</span><div class="task-flow-step"><b>02</b><span><strong>分析计算</strong><small>记录数、总金额、平均金额、分类</small></span></div><span aria-hidden="true" class="task-flow-arrow">↓</span><div class="task-flow-step"><b>03</b><span><strong>写入结果</strong><small>使用文件修改工具或 terminal 创建 summary.md</small></span></div><span aria-hidden="true" class="task-flow-arrow">↓</span><div class="task-flow-step"><b>04</b><span><strong>重新读取验证</strong><small>确认文件内容与计算一致</small></span></div></div><aside aria-label="人工复核期望" class="tip-block"><strong>人工复核期望</strong><p>记录数为 2，总金额为 387，平均金额为 193.50，分类包含 Software 与 Media。措辞可以不同，但这些数值必须正确，且 summary.md 必须真实存在。</p></aside></div></section>
<section class="note-sec"><h3>安全原则</h3><div class="section-content"><ul class="check-list"><li>调用前确认工具权限与实际可用范围</li><li>限定输入文件、输出文件和工作目录</li><li>对删除、覆盖与联网操作保持谨慎，必要时先请求确认</li><li>不信任输入或风险较高时使用隔离环境</li><li>交付前重新检查产物内容和路径</li></ul></div></section>
<section class="note-sec"><h3>核心理解</h3><div class="section-content"><div class="note-aside"><p>Tool Calling 的价值在于产生可验证的环境变化。清楚记录“为何选工具、工具返回什么、如何据此继续”，比只得到一段回答更重要。</p></div></div></section>
<section class="note-sec acceptance"><h3>验收方式</h3><div class="section-content"><ul class="check-list gate-list"><li class="gate-row">Hermes 成功读取 sales.csv，并能说出实际调用的工具</li><li class="gate-row">记录数、总金额、平均金额与分类全部正确</li><li class="gate-row">summary.md 真实存在且经过重新读取验证</li><li class="gate-row">能解释完整 Tool Calling 循环以及 local / docker 的差别</li></ul>
</div></section>
<section class="note-sec summary"><h3>本步总结</h3><div class="section-content"><p>工具让 Hermes 从“回答问题”走向“执行并交付”；真实文件、正确数值与复核过程共同构成验收证据。</p></div></section>
<section class="note-sec"><h3>选读资料</h3><div class="section-content"><p class="hint-text">完成六步主线后，可按需要继续拓展。</p><div class="table-wrap"><table class="reading-table"><thead><tr><th scope="col">资料</th><th scope="col">用途</th><th scope="col">入口</th></tr></thead><tbody><tr><td data-label="资料"><span class="cell-value">Hermes Learning Path</span></td><td data-label="用途"><span class="cell-value">按经验与使用场景继续学习 CLI、消息平台与任务自动化。</span></td><td data-label="入口"><span class="cell-value"><a class="doc-link" href="https://hermes-agent.nousresearch.com/docs/zh-Hans/getting-started/learning-path" rel="noopener" target="_blank">官方文档</a></span></td></tr></tbody></table></div></div></section>
<section class="note-sec"><h3>四条使用前提</h3><div class="section-content">

<div class="compare-grid">
<div class="compare-col">
<h4>示例输出是占位符</h4>
<ul class="plain-list"><li>命令输出、配置片段都是教学占位，不是实测记录</li><li>所有具体值写成 <code class="inline-code">&lt;placeholder&gt;</code>，避免过期数字被当成结论</li></ul>
</div>
<div class="compare-col">
<h4>版本会漂移</h4>
<ul class="plain-list"><li>命令与配置项随版本变化</li><li>以 <code class="inline-code">hermes doctor</code>、<code class="inline-code">/help</code>、<code class="inline-code">/tools</code> 的实际输出为准</li></ul>
</div>
</div>
<div class="compare-grid">
<div class="compare-col">
<h4>只覆盖入门主线</h4>
<ul class="plain-list"><li>skills、memories、MCP、消息网关、安全加固不在本页范围</li><li>页末只给官方入口，不做二手转述</li></ul>
</div>
</div>
</div></section>
</article>
<nav aria-label="继续学习" class="course-end"><RouterLink to="/"><small>THE NOTEBOOK</small><strong>返回全部笔记 <span aria-hidden="true" class="ip-icon ip-arrow-left"></span></strong></RouterLink><RouterLink to="/llm-api/"><small>继续探索</small><strong>LLM API 与 Prompt Caching <span aria-hidden="true" class="ip-icon ip-arrow-up-right"></span></strong></RouterLink></nav>
</main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NotebookCover from '../components/NotebookCover.vue'
import { usePage } from '../composables/useReading.js'
import { mountHermes } from '../features/hermes.js'
const pageRoot = ref(null)
usePage(pageRoot, mountHermes, 'hermes')
</script>
