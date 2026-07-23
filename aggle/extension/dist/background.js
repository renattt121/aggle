"use strict";
(() => {
  // extension/src/background.ts
  console.log("Aggle Extension Loaded!");
  var BLOCKED = [
    "*://*.doubleclick.net/*",
    "*://*.googlesyndication.com/*"
  ];
  browser.webRequest.onBeforeRequest.addListener(
    (details) => ({ cancel: true }),
    { urls: BLOCKED },
    ["blocking"]
  );
  browser.commands.onCommand.addListener((command) => {
    if (command === "toggle-ai-sidebar") {
      browser.sidebarAction.open().catch(() => {
      });
    }
  });
})();
//# sourceMappingURL=background.js.map
