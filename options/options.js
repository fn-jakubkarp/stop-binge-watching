// Retrieve the stored value and update the input field
document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get("key", function (data) {
    if (data.key) {
      // Check if there is a stored value
      const inputValue = document.getElementById("inputValue");
      inputValue.value = data.key;
    }
  });

  const settingsSubmitBtn = document.getElementById("settingsSubmitBtn");
  settingsSubmitBtn.addEventListener("click", function () {
    const inputValue = document.getElementById("inputValue").value;
    chrome.storage.local.set({ key: inputValue }, function () {
      console.log("Value is set to " + inputValue);
    });
  });
});
