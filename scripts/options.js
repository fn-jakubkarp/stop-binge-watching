document.addEventListener("DOMContentLoaded", function () {
  const settingsSubmitBtn = document.getElementById("settingsSubmitBtn");

  settingsSubmitBtn.addEventListener("click", function () {
    const inputValue = document.getElementById("inputValue").value;
    chrome.storage.local.set({ key: inputValue }, function () {
      console.log("Value is set to " + inputValue);
    });
  });
});
