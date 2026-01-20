let typingTimer; // Timer identifier
const doneTypingInterval = 2500; // Time in ms (2.5 seconds)
const requestCache = new Map(); // Simple cache to store checked text

// 1. Event Listener: Watch for user input on text areas
document.addEventListener('input', (e) => {
  const target = e.target;

  // We only care about <textarea> or <input type="text">
  if (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && target.type === 'text')) {
    
    // Clear the timer if the user keeps typing (Debouncing)
    clearTimeout(typingTimer);
    
    // Remove old suggestion box while typing to avoid confusion
    removeSuggestionBox(target);

    // Start a new timer
    typingTimer = setTimeout(() => {
      handleGrammarCheck(target);
    }, doneTypingInterval);
  }
});

// 2. Logic: Prepare text and check cache
function handleGrammarCheck(element) {
  const text = element.value.trim();

  // Don't check empty or very short text
  if (text.length < 5) return;

  // OPTIMIZATION: Check if we have already checked this exact text
  if (requestCache.has(text)) {
    console.log("GrammarYeeYee: Loaded from Cache");
    const cachedMatches = requestCache.get(text);
    if (cachedMatches.length > 0) showSuggestions(element, cachedMatches);
    return;
  }

  // If not in cache, send to background script
  console.log("GrammarYeeYee: Fetching from API...");
  chrome.runtime.sendMessage({ type: "CHECK_GRAMMAR", text: text }, (response) => {
    
    if (chrome.runtime.lastError) {
      console.error("Runtime error:", chrome.runtime.lastError);
      return;
    }

    if (response && response.data) {
      // Save result to cache
      requestCache.set(text, response.data.matches);
      
      // Only show UI if there are errors
      if (response.data.matches.length > 0) {
        showSuggestions(element, response.data.matches);
      }
    }
  });
}

// 3. UI: Remove existing suggestion box
function removeSuggestionBox(element) {
  // We look for the sibling immediately following the textarea
  const nextSibling = element.nextSibling;
  if (nextSibling && nextSibling.classList && nextSibling.classList.contains('gg-suggestion-box')) {
    nextSibling.remove();
  }
}

// 4. UI: Create and display the suggestion box
function showSuggestions(targetElement, matches) {
  // Double check to remove old boxes
  removeSuggestionBox(targetElement);

  // Create the container
  const box = document.createElement('div');
  box.className = 'gg-suggestion-box';
  
  // Header
  const header = document.createElement('div');
  header.className = 'gg-header';
  header.innerText = `GrammarYeeYee: ${matches.length} issue(s) found`;
  box.appendChild(header);

  // Iterate through errors (Limit to top 5 to keep UI clean)
  matches.slice(0, 5).forEach(match => {
    const item = document.createElement('div');
    item.className = 'gg-error-item';

    // Extract the bad word and the suggestion
    const wrongText = match.context.text.substr(match.context.offset, match.context.length);
    const suggestion = match.replacements[0] ? match.replacements[0].value : "N/A";
    
    item.innerHTML = `
      <div class="gg-info">
        <span class="gg-wrong">${wrongText}</span> &rarr; 
        <span class="gg-correct">${suggestion}</span>
      </div>
      <div class="gg-msg">${match.message}</div>
    `;

    // Click handler to fix the text
    item.addEventListener('click', () => {
      const newValue = targetElement.value.replace(wrongText, suggestion);
      
      // 1. Update the value
      targetElement.value = newValue;
      
      // 2. CRITICAL FIX: Tell the website the value changed
      // This tricks Google/React into updating their internal state
      const event = new Event('input', { bubbles: true });
      targetElement.dispatchEvent(event);
      
      // 3. Cleanup UI
      item.remove();
      if (box.querySelectorAll('.gg-error-item').length === 0) {
        box.remove();
      }
    });

    box.appendChild(item);
  });

  // Insert the box directly after the textarea in the DOM
  targetElement.parentNode.insertBefore(box, targetElement.nextSibling);
}