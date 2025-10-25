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
        const allFinishedElements = document.querySelectorAll(config.finishedStateSelector);

        for (const finishedElement of allFinishedElements) {
            if (finishedElement.dataset.promptorySaved === 'true') {
                continue;
            }
            
            console.log('[Promptory] Found a new, unsaved finished element (copy button).', finishedElement);
            finishedElement.dataset.promptorySaved = 'true';

            // Use the stable 'agent-turn' class to find the parent container
            const assistantTurnElement = finishedElement.closest('.agent-turn');
            if (!assistantTurnElement) {
                console.error('[Promptory] Could not find parent turn element (.agent-turn) for a finished button.');
                continue;
            }

            const responseContainer = assistantTurnElement.querySelector('div[data-message-author-role="assistant"]');
            if (!responseContainer) {
                console.error('[Promptory] Could not find response container within the assistant turn.');
                continue;
            }
            const responseText = responseContainer.innerText;

            const promptTurnElement = assistantTurnElement.previousElementSibling;
            if (!promptTurnElement) {
                console.error('[Promptory] Could not find the previous sibling element for the prompt turn.');
                continue;
            }

            const promptContainer = promptTurnElement.querySelector('div[data-message-author-role="user"]');
            if (!promptContainer) {
                console.error('[Promptory] Could not find prompt container in the previous turn element.');
                continue;
            }
            const promptText = promptContainer.innerText;

            if (promptText && responseText) {
                console.log('[Promptory] SUCCESS: Found and extracted a new ChatGPT conversation. Saving.');
                sendConversationToBackend(promptText, responseText, config.source);
            } else {
                console.error('[Promptory] FAILED to extract text from a found ChatGPT conversation.', { promptText, responseText });
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
        console.log('[Promptory] Pre-scanning to mark existing conversations...');
        const allFinishedElements = document.querySelectorAll(config.finishedStateSelector);
        console.log(`[Promptory] Found ${allFinishedElements.length} existing finished elements to mark as saved.`);
        for (const finishedElement of allFinishedElements) {
            finishedElement.dataset.promptorySaved = 'true';
        }
        console.log('[Promptory] Pre-scan complete. Only new conversations will be saved.');
    }

    // --- MAIN EXECUTION ---
    function main() {
        const siteConfigs = [
            {
                hosts: ['chatgpt.com', 'openai.com'],
                config: {
                    source: 'CHAT_GPT',
                    mainAreaSelector: 'main',
                    turnSelector: '.agent-turn', // This is the corrected, stable selector for the whole turn.
                    finishedStateSelector: '[data-testid="copy-turn-action-button"]',
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