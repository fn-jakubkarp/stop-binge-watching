// Store tab timers with tabId as the key
let tabTimers = {};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Service Worker installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  if (message.action === "getTimers") {
      sendResponse({ tabTimers: tabTimers });
      return true;
  }
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab URL includes 'youtube.com'
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    // If the title changes and includes 'guide' or 'tutorial', clear any existing timer
    if (changeInfo.title && (changeInfo.title.includes("guide") || changeInfo.title.includes("tutorial"))) {
      clearTimeout(tabTimers[tabId]);
      console.log("Timer cleared for tab: " + tabId);
    } else if (changeInfo.status === 'complete') {
      // Set a timer if the tab loads completely and doesn't contain the keywords
      if (tabTimers[tabId]) {
        clearTimeout(tabTimers[tabId]);
      }
      tabTimers[tabId] = setTimeout(() => {
        // Check again if the tab exists and close it if it doesn't have the specific keywords in the title
        chrome.tabs.get(tabId, currentTab => {
          if (currentTab && !(currentTab.title.includes("guide") || currentTab.title.includes("tutorial"))) {
            chrome.tabs.remove(tabId);
            console.log("Tab closed due to timeout: " + tabId);
          }
        });
      }, 3600000); // 60 minutes in milliseconds
      console.log("Timer set for tab: " + tabId);
    }
  } else {
    // If the URL is not a YouTube URL, remove any existing timer
    if (tabTimers[tabId]) {
      clearTimeout(tabTimers[tabId]);
      delete tabTimers[tabId];
      console.log("Timer removed for non-YouTube tab: " + tabId);
    }
  }
});

// Clean up on tab close
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabTimers[tabId]) {
    clearTimeout(tabTimers[tabId]);
    delete tabTimers[tabId];
    console.log("Timer cleaned up for tab: " + tabId);
  }
});
