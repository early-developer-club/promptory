console.log("Promptory Content Script Loaded!");

/**
 * Sends the extracted conversation data to the backend API.
 * @param {object} payload The conversation data to send.
 */
async function sendConversationToBackend(payload) {
    // TODO: Retrieve the JWT token from chrome.storage
    const token = "dummy-jwt-token"; // Placeholder

    try {
        const response = await fetch("http://localhost:8000/api/v1/conversations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Promptory: Conversation successfully sent.", result);
    } catch (error) {
        console.error("Promptory: Error sending conversation to backend.", error);
        // TODO: Implement retry logic as per the spec
    }
}

/**
 * Observes the DOM for changes and triggers the conversation extraction.
 */
function observeConversations() {
    // This is a placeholder for the main logic.
    // The actual implementation will need to identify the correct DOM nodes
    // for both ChatGPT and Gemini, which can be complex and subject to change.

    // TODO: Implement MutationObserver to watch for new conversations.
    console.log("Promptory: DOM observer logic to be implemented here.");

    // --- Example of what the extraction logic might look like ---
    // 1. Use MutationObserver to detect when a response is complete.
    // 2. Find the relevant prompt and response elements.
    // 3. Extract text content.
    // 4. Determine the source ('CHAT_GPT' or 'GEMINI') from window.location.hostname
    // 5. Call sendConversationToBackend with the payload.

    /*
    // Dummy payload for testing
    const dummyPayload = {
        source: "CHAT_GPT",
        prompt: "Hello, who are you?",
        response: "I am a large language model.",
        conversationTimestamp: new Date().toISOString()
    };
    // sendConversationToBackend(dummyPayload);
    */
}

observeConversations();
