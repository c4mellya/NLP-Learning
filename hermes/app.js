/* ============================================================================
   Hermes 课程：页面内交互
   ----------------------------------------------------------------------------
   只剩两处真正需要脚本的地方：
     - CLI 命令速查（第 04 章）
     - ~/.hermes/ 文件查看器（第 05 章）
   主题、左侧栏、章节跳转与滚动高亮由 ../assets/site.js 统一负责。
   翻页键、学习状态按钮与状态徽标已按要求移除，进度存储一并删除。
   ========================================================================= */
(() => {
  "use strict";

  /* ------------------------------------------------- 可访问的 tab 小组件 */

  function setRovingState(items, activeItem) {
    items.forEach((item) => {
      const selected = item === activeItem;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
  }

  function addTabKeyboard(items, activate) {
    items.forEach((item, index) => {
      item.addEventListener("keydown", (event) => {
        let nextIndex = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % items.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + items.length) % items.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = items.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        items[nextIndex].focus();
        activate(items[nextIndex]);
      });
    });
  }

  /* ------------------------------------------- CLI 命令速查（第 04 章） */

  const CLI_DATA = {
    help: {
      role: "查看当前交互界面支持的命令与简要用法。",
      output: ["/help      查看命令索引", "/model     查看或切换模型", "/tools     查看可用工具", "/status    查看会话状态", "/context   查看 Context 用量", "/title     设置会话标题"],
      note: "不同配置下的可用命令可能不同；忘记入口时先以 /help 的实际输出为准。",
    },
    model: {
      role: "查看当前 Provider / Model，或在已配置模型之间切换。",
      output: ["Provider   <provider-name>", "Model      <model-id>", "可选项     <configured-models>"],
      note: "会话内 /model 只处理已配置项；新增 Provider、认证或模型配置请在 Shell 中运行 hermes model。",
    },
    tools: {
      role: "查看当前会话实际允许调用的工具与工具集。",
      output: ["terminal    执行受控命令", "process     管理已启动进程", "read_file   读取指定文件", "patch       修改指定文件", "其他        <configured-tools>"],
      note: "这里是教学占位输出。执行任务前应阅读 /tools 的实际结果，确认所需能力和权限都可用。",
    },
    status: {
      role: "查看当前会话、模型以及工具或文件摘要。",
      output: ["Session     <session-state>", "Provider    <provider-name>", "Model       <model-id>", "Tools       <enabled-toolsets>", "Files       <file-summary>"],
      note: "状态异常时先核对 Provider、Model 和会话状态，再按需要运行 hermes doctor 做环境诊断。",
    },
    context: {
      role: "查看 Context 已用 token、上限、占用比例与压缩状态。",
      output: ["Used        <used-tokens>", "Limit       <context-limit>", "Usage       <usage-percent>", "Compaction  <compaction-state>"],
      note: "Context 接近上限时关注压缩状态与关键信息是否保留；具体操作以当前 /help 提示为准。",
    },
  };

  const commandItems = Array.from(document.querySelectorAll(".cmd-item[data-cmd]"));
  const commandPanel = document.getElementById("cmd-panel");
  const commandRole = document.getElementById("cmd-role");
  const commandOutput = document.getElementById("cmd-output");
  const commandNote = document.getElementById("cmd-note");

  function renderCommand(button) {
    const data = CLI_DATA[button.dataset.cmd];
    if (!data || !commandRole || !commandOutput || !commandNote) return;
    setRovingState(commandItems, button);
    commandRole.textContent = data.role;
    commandOutput.textContent = data.output.join("\n");
    commandNote.textContent = data.note;
    if (commandPanel) commandPanel.setAttribute("aria-labelledby", button.id);
  }

  commandItems.forEach((button) => button.addEventListener("click", () => renderCommand(button)));
  addTabKeyboard(commandItems, renderCommand);
  if (commandItems[0]) renderCommand(commandItems[0]);

  /* -------------------------------------- 文件查看器（第 05 章） */

  const FILE_DATA = {
    "config.yaml": {
      code: "model:\n  provider: <provider-name>\n  default: <model-id>\n  base_url: https://provider.example/v1\n  api_mode: <api-mode>\nterminal:\n  backend: local",
      desc: "config.yaml 保存 Provider、默认模型、端点、API mode 与终端后端等普通配置；所有值均为教学占位符。",
    },
    ".env": {
      code: "PROVIDER_API_KEY=your_api_key_here",
      desc: ".env 保存不应公开的敏感凭据；此处只展示教学占位符。",
    },
    "SOUL.md": {
      code: "# Agent 身份\n\n在这里描述 Agent 的角色、表达方式与行为边界。",
      desc: "SOUL.md 用于描述 Agent 身份与行为，不用于保存敏感凭据。",
    },
  };

  const fileItems = Array.from(document.querySelectorAll(".file-item[data-file]"));
  const filePanel = document.getElementById("file-panel");
  const fileName = document.getElementById("file-name");
  const fileCode = document.getElementById("file-code");
  const fileDesc = document.getElementById("file-desc");

  function renderFile(button) {
    const name = button.dataset.file;
    const data = FILE_DATA[name];
    if (!data || !fileName || !fileCode || !fileDesc) return;
    setRovingState(fileItems, button);
    fileName.textContent = name;
    fileCode.textContent = data.code;
    fileDesc.textContent = data.desc;
    if (filePanel) filePanel.setAttribute("aria-labelledby", button.id);
  }

  fileItems.forEach((button) => button.addEventListener("click", () => renderFile(button)));
  addTabKeyboard(fileItems, renderFile);
  if (fileItems[0]) renderFile(fileItems[0]);
})();
