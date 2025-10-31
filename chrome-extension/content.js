(function() {
    'use strict';

    console.log("Promptory content script loaded and executing.");

    // --- UTILITY FUNCTIONS ---
    let debounceTimeout;
    function debounce(func, delay) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(func, delay);
    }

    // --- MESSAGING AND DATA HANDLING ---
    function sendConversationToBackend(prompt, response, source) {
        console.log('[Promptory] Sending conversation to background script.');
        chrome.runtime.sendMessage(
            {
                type: 'SAVE_CONVERSATION',
                payload: { prompt, response, source, conversation_timestamp: new Date().toISOString() },
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error('[Promptory] Error sending message to background:', chrome.runtime.lastError.message);
                } else if (response && response.status === 'success') {
                    console.log('[Promptory] Background script confirmed conversation was saved.');
                } else {
                    console.error('[Promptory] Background script reported an error.', response);
                }
            }
        );
    }

    // --- SITE-SPECIFIC SCANNING LOGIC ---
    function scanForUnsavedTurns_ChatGPT(config) {
        console.log('[Promptory] Scanning for completed ChatGPT conversations...');
        const allAssistantTurns = document.querySelectorAll(config.turnSelector + '[data-turn="assistant"]');

        for (const assistantTurnElement of allAssistantTurns) {
            // Check if this turn is already processed
            if (assistantTurnElement.dataset.promptorySaved === 'true') {
                continue;
            }

            // Check if the turn is finished by looking for the copy button within this turn
            const finishedElement = assistantTurnElement.querySelector(config.finishedStateSelector);
            
            if (finishedElement) {
                console.log('[Promptory] Found a new, completed ChatGPT turn.', assistantTurnElement);
                assistantTurnElement.dataset.promptorySaved = 'true'; // Mark the entire turn as saved

                const responseContainer = assistantTurnElement.querySelector('div[data-message-author-role="assistant"]');
                if (!responseContainer) continue;
                
                // Find the corresponding prompt by looking for the previous user turn article
                let userTurnArticle = null;
                let currentElement = assistantTurnElement.previousElementSibling;
                while (currentElement) {
                    if (currentElement.matches('article[data-turn="user"]')) {
                        userTurnArticle = currentElement;
                        break;
                    }
                    currentElement = currentElement.previousElementSibling;
                }

                if (userTurnArticle) {
                    const promptContainer = userTurnArticle.querySelector('div[data-message-author-role="user"]');
                    if (promptContainer) {
                        const promptText = promptContainer.innerText;
                        const responseText = responseContainer.innerText;

                        if (promptText && responseText) {
                            console.log('[Promptory] SUCCESS: Extracted prompt and response. Saving.');
                            sendConversationToBackend(promptText, responseText, config.source);
                        } else {
                            console.error('[Promptory] FAILED to extract text from a found conversation.', { promptText, responseText });
                        }
                    } else {
                        console.error('[Promptory] Could not find prompt container within the user turn article.');
                    }
                } else {
                    console.error('[Promptory] Could not find a corresponding user turn article for the response.');
                }
            }
        }
    }

    function scanForUnsavedTurns_Gemini(config) {
        const allTurnElements = document.querySelectorAll(config.turnSelector);

        for (const turnElement of allTurnElements) {
            if (turnElement.dataset.promptorySaved === 'true') continue;

            const finishedElement = turnElement.querySelector(config.finishedStateSelector);
            if (finishedElement) {
                console.log('[Promptory] Found a new, completed Gemini turn. Saving.', turnElement);
                turnElement.dataset.promptorySaved = 'true';
                
                const promptText = turnElement.querySelector(config.promptSelector)?.innerText;
                const responseText = turnElement.querySelector(config.responseSelector)?.innerText;

                if (promptText && responseText) {
                    sendConversationToBackend(promptText, responseText, config.source);
                } else {
                    console.error('[Promptory] Could not extract Gemini prompt or response text.');
                }
            }
        }
    }
    
    // This function runs once on page load for ChatGPT to prevent saving history.
    function markExistingTurnsAsSaved_ChatGPT(config) {
        console.log('[Promptory] Pre-scanning to mark existing conversations as saved...');
        const allTurnElements = document.querySelectorAll(config.turnSelector + '[data-turn="assistant"]');
        
        let markedCount = 0;
        for (const turnElement of allTurnElements) {
            const finishedElement = turnElement.querySelector(config.finishedStateSelector);
            if (finishedElement) {
                turnElement.dataset.promptorySaved = 'true';
                markedCount++;
            }
        }
        console.log(`[Promptory] Pre-scan complete. Marked ${markedCount} existing assistant messages as saved.`);
    }

    // --- MAIN EXECUTION ---
    function main() {
        const siteConfigs = [
            {
                hosts: ['chatgpt.com', 'openai.com'],
                config: {
                    source: 'CHAT_GPT',
                    mainAreaSelector: 'main',
                    turnSelector: 'article', // The article element now represents a full turn
                    finishedStateSelector: 'button[data-testid="copy-turn-action-button"]',
                    scanFunction: scanForUnsavedTurns_ChatGPT,
                    preScanFunction: markExistingTurnsAsSaved_ChatGPT,
                }
            },
            {
                hosts: ['google.com'],
                config: {
                    source: 'GEMINI',
                    mainAreaSelector: 'main',
                    turnSelector: '.conversation-container',
                    finishedStateSelector: 'thumb-up-button',
                    promptSelector: '.query-text',
                    responseSelector: '.markdown',
                    scanFunction: scanForUnsavedTurns_Gemini,
                }
            }
        ];

        const host = window.location.hostname;
        console.log(`[Promptory] Initializing on host: "${host}"`);

        const site = siteConfigs.find(site => site.hosts.some(h => host.includes(h)));
        const config = site ? site.config : null;

        if (!config) {
            console.error(`[Promptory] No configuration found for host: "${host}".`);
            return;
        }

        console.log('[Promptory] Using configuration for:', config.source);
        
        // Run pre-scan after a delay to let the page load, if the site needs it.
        if (config.preScanFunction) {
            setTimeout(() => config.preScanFunction(config), 2500); // Wait for initial content to load
        }
        
        const observer = new MutationObserver((mutationsList, obs) => {
            debounce(() => config.scanFunction(config), 500);
        });

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

        startObserver(config);
    }

    main();

})();