document.addEventListener("DOMContentLoaded", function () {
  const youtubeTabsList = document.getElementById("youtubeTabs");

  // Function to fetch and display tab information
  function fetchTabInfo() {
    chrome.runtime.sendMessage({ action: "getTabInfo" }, function (response) {
      youtubeTabsList.innerHTML = ""; // Clear the current list
      response.info.forEach((info) => {
        const li = document.createElement("li");
        li.textContent = info;
        youtubeTabsList.appendChild(li);
      });
    });
  }

  // Update immediately and set up periodic update
  fetchTabInfo();
  setInterval(fetchTabInfo, 5999);
});

// Handler for settings button
document.addEventListener("DOMContentLoaded", function () {
  const settingsBtn = document.getElementById("settingsBtn");

  settingsBtn.addEventListener("click", function () {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  });
});