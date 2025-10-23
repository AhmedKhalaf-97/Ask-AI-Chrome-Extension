const aiContextMenuItems = {
    'summarizeContext': 'Summarize',
    'proofreadContext': 'Proofread'
}

chrome.runtime.onInstalled.addListener(() => {
    for (let [id, title] of Object.entries(aiContextMenuItems)) {
        chrome.contextMenus.create({
            id: id,
            title: title,
            contexts: ["selection"]
        });
    }
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarizeContext") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'summarize', data: info.selectionText });
            // chrome.action.openPopup();
        });
    }

    if (info.menuItemId === "proofreadContext") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'proofread', data: info.selectionText });
        });
    }
});

