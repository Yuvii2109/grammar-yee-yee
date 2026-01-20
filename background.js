// Listen for messages sent from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    // Checking if the message is for grammar checking
    if (request.type === "CHECK_GRAMMAR") {
      
      const apiUrl = "https://api.languagetool.org/v2/check";
      
      // Preparing the data for the API request
      // We use URLSearchParams because the API expects form-encoded data
      const params = new URLSearchParams();
      params.append("text", request.text);
      params.append("language", "en-US");
      params.append("enabledOnly", "false"); // Basic check
  
      // Fetching data from LanguageTool
      fetch(apiUrl, {
        method: "POST",
        body: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        }
      })
      .then(response => response.json()) // Parsing JSON response
      .then(data => {
          // Sending the data back to content.js
          sendResponse({ data: data });
      })
      .catch(error => {
          console.error("GrammarYeeYee API Error:", error);
          sendResponse({ error: error.toString() });
      });
  
      return true; // REQUIRED: Keeps the message channel open for the async response
    }
  });