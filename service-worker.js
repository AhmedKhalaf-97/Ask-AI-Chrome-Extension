const AIModels = {
    SUMMARIZER: "Summary",
    PROOFREADER: "Proofread",
    TRANSLATOR: "Translator",
    REWRITER: "Rewriter",
    WRITER: "Writer",
    PROMPT: "Prompt"
};

const selectionContextMenuItems = {
    'summarizeContext': 'Summarize',
    'proofreadContext': 'Proofread',
    'translatorContext': 'Translate',
    'rewriterContext': 'Rewrite',
}

const pageContextMenuItems = {
    'promptContext': 'Ask Anything',
    'writerContext': "Writing Helper"
}

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: AIModels.PROMPT });
});

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


chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarizeContext") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: AIModels.SUMMARIZER, data: info.selectionText });
            // chrome.action.openPopup();
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

