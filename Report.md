# Project Report: GrammarYeeYee Chrome Extension

**Student Name:** Yuvraj Sachdeva <br>
**Date:** January 20, 2026 <br>
**Project Type:** Chrome Extension (Manifest V3)

---

## 1. Project Overview

**GrammarGuard** is a browser extension designed to enhance user writing by providing real-time grammar and spelling corrections within web-based text fields. Operating similarly to Grammarly, it utilizes the LanguageTool API to analyze text and offers immediate feedback via a custom UI overlay.

The goal was to build a lightweight, non-intrusive tool that demonstrates proficiency in DOM manipulation, asynchronous API handling, and the Chrome Extension architecture.

## 2. Technical Architecture

The extension follows the **Manifest V3** standard, ensuring better security and performance. It consists of three main components:

### A. The Manifest (`manifest.json`)

Acts as the configuration entry point.
- **Permissions:** Requesting `activeTab` to access page content and `scripting` for injection.
- **Host Permissions:** Explicitly allowing requests to `api.languagetool.org` to bypass standard CSP (Content Security Policy) restrictions.

### B. The Background Service Worker (`background.js`)

Serves as the network proxy.
- **Problem:** Content scripts injected into a webpage are often blocked by the site's CORS policy from making requests to external APIs.
- **Solution:** The content script delegates the API request to the background worker. The background worker fetches the data and returns it to the content script.

### C. The Content Script (`content.js`)

Handles the user interaction and DOM manipulation.
- **Input Detection:** Listens for `input` events on `<textarea>` and `<input>` fields.
- **UI Injection:** Dynamically creates and inserts a "Suggestion Box" into the DOM immediately following the target text field.

## 3. Key Implementation Strategies

To ensure a robust user experience, two critical optimization algorithms were implemented:

### 1. Debouncing (Rate Limiting)

**Challenge:** Sending an API request for every keystroke would flood the API, causing rate-limit errors (429) and slowing down the browser.
**Solution:** I implemented a `setTimeout` logic. The extension waits for the user to *stop* typing for **2.5 seconds** before triggering the check. If the user types again within that window, the timer resets.

### 2. Caching Strategy

**Challenge:** Users often delete and re-type the same sentences, or click back to previous text. Redundant API calls waste bandwidth.
**Solution:** A Javascript `Map` object is used as a session cache.
- **Key:** The text content string.
- **Value:** The API response (JSON).
- Before fetching, the script checks if `cache.has(text)`. If yes, it loads instantly from memory; otherwise, it calls the network.

## 4. UI/UX Design

The User Interface was designed to be minimal but informative:
- **Non-blocking:** The suggestion box appears *below* the text area, ensuring it doesn't obscure the text being typed.
- **Interactive:** Clicking a suggestion automatically performs a string replacement in the input field.
- **Visual Feedback:** Uses standard color coding (Red for errors, Green for corrections) to allow users to scan quickly.

## 5. Challenges Faced & Solutions

<table>
  <thead>
    <tr>
      <th style="text-align: left">Challenge</th>
      <th style="text-align: left">Solution</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="font-weight: bold">CORS Errors</td>
      <td>Attempting to <code>fetch()</code> directly from <code>content.js</code> failed on many sites. I moved the network logic to <code>background.js</code> and used message passing (<code>chrome.runtime.sendMessage</code>).</td>
    </tr>
    <tr>
      <td style="font-weight: bold">API Rate Limits</td>
      <td>The public API allows limited requests. I increased the debounce time to 2.5s and added caching to minimize hits.</td>
    </tr>
    <tr>
      <td style="font-weight: bold">Dynamic Elements</td>
      <td>Some websites dynamically load textareas (like Single Page Apps). I used event delegation on the <code>document</code> level rather than attaching listeners to specific IDs.</td>
    </tr>
  </tbody>
</table>

## 6. Future Improvements

If this project were to be expanded, the following features would be prioritized:
1.  **WASM Integration:** Using a local WASM library (like Harper.js) to perform grammar checks offline, removing the need for an external API.
2.  **Rich Text Support:** Currently, the extension works best on raw text. Adding support for `contenteditable` divs (used in Gmail/Google Docs) would require more complex DOM traversal (Range and Selection APIs).
3.  **Authentication:** Allowing users to add their own API keys for faster, premium grammar checking.

## 7. References

- **Chrome Extension Documentation:** https://developer.chrome.com/docs/extensions/mv3/
- **LanguageTool API:** https://languagetool.org/http-api/swagger-ui/