let tabCountdown = {};
const HOUR = 3600; // equals 1 hour

function handleCountdown(tabId, url, title) {
  chrome.storage.local.get("key", function (data) {
    const countdownMinutes = parseInt(data.key, 10) || 60; // Default to 60 minutes if undefined
    const countdownSeconds = countdownMinutes * 60;

    if (isYouTubeTab(url)) {
      if (!tabCountdown[tabId]) {
        tabCountdown[tabId] = {
          remainingTime: countdownSeconds,
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
    } else if (isTutorial(title)) {
      stopCountdown(tabId);
    }
  });
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
  handleCountdown(tab.id, tab.url, tab.title);
});

// Update the open time if tab URL changes to a YouTube URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.title) {
    handleCountdown(
      tabId,
      changeInfo.url || tab.url,
      changeInfo.title || tab.title,
    );
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
  if (!url || typeof url !== "string" || null) {
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
