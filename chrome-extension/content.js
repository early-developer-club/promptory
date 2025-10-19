
console.log("Promptory content script loaded.");

// --- MutationObserver Logic ---
let observer;

function extractAndSave(turnElement, config) {
  console.log('Promptory: extractAndSave function called for turn:', turnElement);
  
  const promptText = turnElement.querySelector(config.promptSelector)?.innerText;
  const responseText = turnElement.querySelector(config.responseSelector)?.innerText;

  if (promptText && responseText) {
    console.log("Promptory: Detected finished conversation. Sending to backend.");
    sendConversationToBackend(promptText, responseText, config.source);
  } else {
    console.error('Promptory: Could not extract prompt or response text.', { promptText, responseText });
  }
}

// --- Site-specific Configurations ---
const siteConfigs = {
  'chatgpt.com': {
    source: 'CHAT_GPT',
    mainAreaSelector: 'main',
    turnSelector: "article[data-testid^='conversation-turn-']",
    finishedStateSelector: 'button[data-testid="copy-turn-action-button"]',
    promptSelector: 'div[data-message-author-role="user"]',
    responseSelector: 'div.markdown',
    getTurnElement: (node) => node.closest("article[data-testid^='conversation-turn-']"),
  },
  'gemini.google.com': {
    source: 'GEMINI',
    mainAreaSelector: 'main',
    turnSelector: '.conversation-container',
    finishedStateSelector: 'thumb-up-button',
    promptSelector: '.query-text',
    responseSelector: '.markdown',
    getTurnElement: (node) => node.closest('.conversation-container'),
  }
};

const host = window.location.hostname;
const config = Object.values(siteConfigs).find(c => host.includes(c.source.toLowerCase().replace('_', '.')));

if (!config) {
    console.error('Promptory: No configuration found for this site.');
} else {
    console.log('Promptory: Using configuration for:', config.source);
    observer = new MutationObserver((mutationsList, obs) => {
      console.log('Promptory: MutationObserver detected changes:', mutationsList);
      for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
    
          const finishedElement = node.querySelector(config.finishedStateSelector) || (node.matches(config.finishedStateSelector) ? node : null);
          
          if (finishedElement) {
            console.log('Promptory: Found finished element:', finishedElement);
            const turnElement = config.getTurnElement(finishedElement);
    
            if (turnElement && turnElement.dataset.promptorySaved !== 'true') {
              extractAndSave(turnElement, config);
              turnElement.dataset.promptorySaved = 'true';
            }
          }
        }
      }
    });
    startObserver(config);
}


function sendConversationToBackend(prompt, response, source) {
  chrome.storage.local.get('access_token', (result) => {
    const token = result.access_token;
    console.error('PROMPTORY DEBUG: Retrieved token:', token);
    if (!token) {
      console.error('Promptory: No access token found. Please log in to the web app first.');
      return;
    }
    const apiUrl = 'http://localhost:8000/api/v1/conversations';
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        prompt, 
        response, 
        source, 
        conversation_timestamp: new Date().toISOString()
      }),
    })
    .then(res => {
      if (!res.ok) {
        console.error(`Promptory: Failed to save conversation. Server responded with: ${res.status}`);
      } else {
        console.log('Promptory: Conversation saved successfully.');
      }
    })
    .catch(error => console.error('Promptory: Error sending conversation to backend:', error));
  });
}

function startObserver(config) {
  console.log('Promptory: Attempting to start MutationObserver...');
  const targetNode = document.querySelector(config.mainAreaSelector);
  if (targetNode) {
    observer.observe(targetNode, { childList: true, subtree: true });
    console.log('Promptory: MutationObserver is now watching for conversations on target:', targetNode);
  } else {
    console.log('Promptory: Target node for MutationObserver not found. Retrying...');
    setTimeout(() => startObserver(config), 2000);
  }
}
