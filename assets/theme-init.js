/* 首次绘制前统一主题：手动选择优先，兼容旧存储键，否则跟随系统。 */
(function () {
  "use strict";
  var theme = null;
  var keys = ["lmapi-lab-theme", "hermes-theme", "lmapi-theme"];
  for (var i = 0; i < keys.length; i++) {
    try {
      var value = localStorage.getItem(keys[i]);
      if (value === "light" || value === "dark") { theme = value; break; }
    } catch (_) { /* 存储不可用时跟随系统 */ }
  }
  if (!theme) {
    theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", theme);
})();
