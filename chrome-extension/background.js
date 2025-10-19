// Listens for a message from the web app to set the token.
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (request.type === 'SET_TOKEN') {
      if (request.token) {
        chrome.storage.local.set({ 'access_token': request.token }, () => {
          console.log('Promptory: Access token stored successfully.');
          sendResponse({ status: 'success' });
        });
      } else {
        sendResponse({ status: 'failure', message: 'No token provided' });
      }
      return true; // Indicates an asynchronous response.
    }
  }
);
