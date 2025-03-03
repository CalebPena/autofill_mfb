chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "toggle_auto_fill_mfb",
    title: "Toggle Auto Fill MFB",
    contexts: ["page"],
    documentUrlPatterns: [
      "http://localhost/*",
      "https://screener.myfriendben.org/*",
      "https://benefits-calculator-staging.herokuapp.com/*",
      "https://screener.bennc.org/*",
    ],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggle_auto_fill" });
});
