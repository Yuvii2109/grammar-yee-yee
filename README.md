# GrammarYeeYee - Chrome Extension

A lightweight, Grammarly-like Chrome Extension that detects spelling and grammar errors in real-time using the LanguageTool API.

## Features

- **Real-time Checking:** Detects errors 2.5 seconds after you stop typing.
- **Smart Caching:** Caches results to reduce API calls and prevent rate limiting.
- **Privacy Focused:** Only sends text to the API when actively typing.
- **One-Click Fix:** Click on a suggestion to automatically replace the error.

## Installation Guide

1. **Download:** Clone this repository or download the ZIP file.
2. **Open Chrome Extensions:** Go to `chrome://extensions/` in your browser.
3. **Developer Mode:** Toggle the switch in the top-right corner to **ON**.
4. **Load Extension:** Click **Load Unpacked** and select the folder where you saved these files.
5. **Test:** Open any website with a text area and type a sentence with errors.

## How It Works

1. **Content Script:** Detects typing in `<textarea>` elements. It uses a **debounce** function to wait until the user stops typing.
2. **Background Script:** Acts as a proxy to fetch data from the **LanguageTool API** (bypassing CORS restrictions).
3. **UI Injection:** If errors are found, a DOM element is injected immediately after the textarea displaying suggestions.

## Note

This project uses the **Public** LanguageTool API, which is rate-limited.
If you type extremely fast or check very long texts, you may experience a slight delay.

## Tech Stack

- Manifest V3
- JavaScript (ES6+)
- CSS3