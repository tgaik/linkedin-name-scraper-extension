
# LinkedIn Name Scraper Chrome Extension

A Chrome extension that extracts LinkedIn profile names and URLs from the active tab and appends them into a Google Sheet.
Ideal for recruiters, salespeople, or anyone who wants to quickly save LinkedIn contact info into a spreadsheet.


---

## Features

* Extracts **First Name**, **Last Name**, and **LinkedIn Profile URL** from the active LinkedIn profile page.
* Appends data to a specified Google Sheet.
* Displays a small popup notification in the browser confirming success or showing errors.
* Supports multiple profiles; always appends after the last filled row.

---

## Prerequisites

* Google Cloud Platform (GCP) project with **Google Sheets API** enabled.
* OAuth 2.0 Client ID for Chrome App (configured in Google Cloud Console).
* A Google Sheet where the data will be saved.

---

## Setup Instructions

### 1. Create a Google Cloud Project & Enable APIs

* Go to [Google Cloud Console](https://console.cloud.google.com/).
* Create a new project.
* Enable **Google Sheets API** for your project.
* Go to **Credentials** and create an **OAuth 2.0 Client ID**:

  * Application type: **Chrome App**.
  * Provide your extension’s ID or upload the manifest (see Chrome docs).
* Note your **Client ID**.

### 2. Prepare Your Google Sheet

* Create a Google Sheet.
* Use the first sheet (named `Sheet1` by default).
* Create headers in the first row:

  ```
  First Name | Last Name | LinkedIn Profile
  ```
* Note the Google Sheet ID from the URL:
  `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit#gid=0`

### 3. Update Configuration

Update `background.js` with your own IDs:

```js
const CONFIG = {
  SHEET_ID: "YOUR_SHEET_ID_HERE",
  CLIENT_ID: "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com"
};
```

Replace placeholders with your actual Google Sheet ID and OAuth Client ID.

### 4. Load the Extension

* Go to `chrome://extensions/`
* Enable **Developer mode**
* Click **Load unpacked**
* Select the folder containing the extension files (`manifest.json`, `background.js`, `config.js`)

### 5. Usage

* Navigate to a LinkedIn profile page (e.g., `https://www.linkedin.com/in/username`).
* Press the shortcut **Ctrl + Shift + D** (Windows/Linux) or **Cmd + Shift + D** (Mac).
* Shortcut can be configured in the browser through extension settings
* A small popup will confirm if the name was saved or show an error.
* Check your Google Sheet to see the new row appended with the First Name, Last Name, and Profile URL.

---

## Permissions

* `identity` — for Google OAuth token.
* `activeTab` — to access the current LinkedIn profile tab.
* `scripting` — to execute content scripts for extracting name and URL.

---

## Troubleshooting

* **Access denied or OAuth errors:**
  Ensure your OAuth consent screen is configured and your test user email is added in Google Cloud Console.

* **Failed to save data:**
  Make sure your Google Sheet ID is correct and that the Sheets API is enabled for your project.

* **No name found:**
  LinkedIn might have changed their page structure. Inspect the profile page and update the selector in `background.js` if needed.

---

## Development Notes

* The extension uses **Manifest V3** with a background service worker.
* Authentication is done using `chrome.identity.getAuthToken` with Google OAuth2.
* Data is appended to the Sheet via Google Sheets API `spreadsheets.values.append` endpoint.
* Popup messages are shown using injected DOM elements for UX feedback.

---

## Security & Privacy

* OAuth tokens are managed securely by Chrome Identity API.
* No user data leaves your browser except for the Google Sheets API calls.
* Replace placeholders with your own project/client IDs to keep credentials safe.

---

