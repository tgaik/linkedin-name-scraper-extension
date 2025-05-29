const CONFIG = {
  SHEET_ID: "YOUR_SHEET_ID_HERE",
  CLIENT_ID: "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com"
};

function showPopup(tabId, message) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (msg) => {
      const existing = document.getElementById('linkedin-popup-notification');
      if (existing) existing.remove();

      const popup = document.createElement('div');
      popup.id = 'linkedin-popup-notification';
      popup.textContent = msg;

      Object.assign(popup.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#444',
        color: '#fff',
        padding: '10px 15px',
        borderRadius: '5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        zIndex: 100000,
        opacity: '1',
        transition: 'opacity 0.5s ease-out',
        cursor: 'default',
        maxWidth: '300px',
        userSelect: 'none'
      });

      document.body.appendChild(popup);

      setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 500);
      }, 3000);
    },
    args: [message]
  });
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "save-name") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.error("No active tab found.");
    return;
  }

  // Extract full name and LinkedIn profile URL from the active tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const h1 = document.querySelector('h1.yOxMigNgsHeyCrMheswcnurvlbsCZiTQtc.inline.t-24.v-align-middle.break-words') || document.querySelector('h1');
      const name = h1 ? h1.innerText.trim() : null;
      const profileUrl = window.location.href;
      return { name, profileUrl };
    }
  }, async (results) => {
    const data = results?.[0]?.result;
    if (!data?.name) {
      showPopup(tab.id, '⚠️ No name found on this LinkedIn page.');
      return;
    }

    const nameParts = data.name.split(' ').filter(Boolean);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    const profileUrl = data.profileUrl;

    let token;
    try {
      token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(token);
          }
        });
      });
    } catch (err) {
      console.error("Auth token error:", err);
      showPopup(tab.id, '❌ Failed to get auth token.');
      return;
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [[firstName, lastName, profileUrl]] })
        }
      );

      if (response.ok) {
        showPopup(tab.id, `✅ Saved: ${firstName} ${lastName}`);
      } else {
        const errorText = await response.text();
        console.error("Google Sheets error:", errorText);
        showPopup(tab.id, `❌ Failed to save to Sheet.`);
      }
    } catch (err) {
      console.error("Network error:", err);
      showPopup(tab.id, '❌ Network error while saving.');
    }
  });
});
