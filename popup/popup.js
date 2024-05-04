document.addEventListener('DOMContentLoaded', function() {
    updateTabList();
    setInterval(updateTabList, 5000); // Refresh every 5 seconds
});

function updateTabList() {
    const tabList = document.getElementById('tabs');
    tabList.innerHTML = ''; // Clear existing list

    chrome.runtime.sendMessage({ action: "getTimers" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error in communication:", chrome.runtime.lastError);
            return;
        }
        if (!response || !response.tabTimers) {
            console.error("No data received on timers");
            return;
        }
        Object.entries(response.tabTimers).forEach(([tabId, timer]) => {
            chrome.tabs.get(parseInt(tabId), (tab) => {
                if (!tab) {
                    console.error("No tab found for ID:", tabId);
                    return;
                }
                if (tab.url.includes("youtube.com/watch")) {
                    const listItem = document.createElement('li');
                    listItem.textContent = `Tab ${tabId}: ${tab.title} - Timer set for 60 minutes`;
                    tabList.appendChild(listie);
                }
            });
        });
    });
}
