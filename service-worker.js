const aiContextMenuItems = {
    'summarizeCMI': 'Summarize',
    'proofreadCMI': 'Proofread'
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
    if (info.menuItemId === "summarizeCMI") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'summarize', data: info.selectionText });
            // chrome.action.openPopup();
        });
    }
});

