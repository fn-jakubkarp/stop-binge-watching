// Object to store tab open times with tabId as the key
let tabCountdown = {};
const HOUR = 3600;

// TODO: Check the errors:: there's a bug that url can't be set to null

// TODO: Refactor to also close the tab itself
function handleCountdown(tabId) {
  if (!tabCountdown[tabId]) {
    tabCountdown[tabId] = {
      remainingTime: HOUR,
      intervalId: setInterval(() => {
        if (tabCountdown[tabId].remainingTime > 0) {
          tabCountdown[tabId].remainingTime--;
        } else {
          clearInterval(tabCountdown[tabId].intervalId);
          chrome.tabs.remove(tabId);
          delete tabCountdown[tabId];
        }
      }, 1000),
    };
  }
}

function stopCountdown(tabId) {
  if (tabCountdown[tabId]) {
    clearInterval(tabCountdown[tabId].intervalId);
    delete tabCountdown[tabId];
    console.log(`Countdown stopped for tab ${tabId}`);
  }
}
function isTutorial(tabTitle) {
  const keywords = ["guide", "tutorial"];
  return keywords.some((keyword) =>
    tabTitle.toLowerCase().includes(keyword.toLowerCase()),
  );
}

chrome.tabs.onCreated.addListener((tab) => {
  console.log("Created tab with URL:", tab.url);
  if (tab.url && isYouTubeTab(tab.url)) {
    handleCountdown(tab.id);
  }
});

// Update the open time if tab URL changes to a YouTube URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    console.log("Updating tab with URL:", changeInfo.url);
    if (isYouTubeTab(changeInfo.url)) {
      handleCountdown(tabId);
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (tabCountdown[tabId]) {
    clearInterval(tabCountdown[tabId].intervalId);
    delete tabCountdown[tabId];
  }
});

// Message listener for popup requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTabInfo") {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
      const filteredTabs = tabs.filter(
        (tab) => tab.url.includes("/watch") || tab.url.includes("/shorts"),
      );
      const info = filteredTabs.map((tab) => {
        const timeRemaining = tabCountdown[tab.id]
          ? Math.floor(tabCountdown[tab.id].remainingTime / 60) + " minutes"
          : "Timer expired";
        return `${timeRemaining} | ${tab.title}`;
      });
      sendResponse({ info: info });
    });
    return true;
  }
});

function isYouTubeTab(url) {
  if (!url || typeof url !== "string") {
    console.error("Invalid or empty URL passed to isYouTubeTab:", url);
    return false;
  }

  try {
    const parser = new URL(url);
    return (
      parser.hostname === "www.youtube.com" &&
      (parser.pathname.startsWith("/watch") ||
        parser.pathname.startsWith("/shorts"))
    );
  } catch (error) {
    console.error("Error parsing URL in isYouTubeTab:", url, error);
    return false;
  }
}
