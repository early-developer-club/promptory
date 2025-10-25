// Listens for a message from the web app to set the token.
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (request.type === 'SET_TOKEN') {
      if (request.token) {
        chrome.storage.local.set({ 'access_token': request.token }, () => {
          console.log('Promptory BG: Access token stored successfully.');
          sendResponse({ status: 'success' });
        });
      } else {
        sendResponse({ status: 'failure', message: 'No token provided' });
      }
      return true; // Indicates an asynchronous response.
    }
  }
);

// Listens for a message from the content script to save a conversation.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SAVE_CONVERSATION') {
    console.log('[Promptory BG] Received conversation from content script:', request.payload);
    
    chrome.storage.local.get('access_token', (result) => {
      const token = result.access_token;
      if (!token) {
        console.error('[Promptory BG] No access token found.');
        sendResponse({ status: 'error', message: 'No token found' });
        return;
      }

      const apiUrl = 'http://localhost:8000/api/v1/conversations';
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request.payload),
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Server responded with: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('[Promptory BG] Conversation saved successfully:', data);
        sendResponse({ status: 'success', data });
      })
      .catch(error => {
        console.error('[Promptory BG] Error sending conversation to backend:', error.message);
        sendResponse({ status: 'error', message: error.message });
      });
    });

    // Return true to indicate that the response is sent asynchronously.
    return true;
  }
});
