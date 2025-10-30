// Enum for all built-in APIs used in this extension.
const AIModels = {
    SUMMARIZER: "Summary",
    PROOFREADER: "Proofread",
    TRANSLATOR: "Translator",
    REWRITER: "Rewriter",
    WRITER: "Writer",
    PROMPT: "Prompt"
};

// Key-value pairs of context menu items that get populated when users selects a text from the webpage.
const selectionContextMenuItems = {
    'summarizeContext': 'Summarize',
    'proofreadContext': 'Proofread',
    'translatorContext': 'Translate',
    'rewriterContext': 'Rewrite',
}

// Key-value pairs of context menu items that get populated when users right clicks on the page.
const pageContextMenuItems = {
    'promptContext': 'Ask Anything',
    'writerContext': "Writing Helper"
}

// Open AI Prompt when the user clicks on the extension icon. 
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { action: AIModels.PROMPT });
});

// Create contxt menu items for the extension.
chrome.runtime.onInstalled.addListener(() => {
    for (let [id, title] of Object.entries(selectionContextMenuItems)) {
        chrome.contextMenus.create({
            id: id,
            title: title,
            contexts: ["selection"]
        });
    }

    for (let [id, title] of Object.entries(pageContextMenuItems)) {
        chrome.contextMenus.create({
            id: id,
            title: title,
            contexts: ["page"]
        });
    }
});

// Listens for which context menu item gets selected.
// Then, it sends a message to the content script to open the extension with the selected model.  
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarizeContext") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: AIModels.SUMMARIZER, data: info.selectionText });
        });
    }

    if (info.menuItemId === "proofreadContext") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: AIModels.PROOFREADER, data: info.selectionText });
        });
    }

    if (info.menuItemId === "translatorContext") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: AIModels.TRANSLATOR, data: info.selectionText });
        });
    }

    if (info.menuItemId === "rewriterContext") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: AIModels.REWRITER, data: info.selectionText });
        });
    }

    if (info.menuItemId === "writerContext") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: AIModels.WRITER });
        });
    }

    if (info.menuItemId === "promptContext") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: AIModels.PROMPT });
        });
    }
});

