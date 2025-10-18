// // When popup is open, send message to content script.
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.tabs.sendMessage(tabs[0].id, { action: 'performAction' });
// });

// // Message is received from content script with the page text data.
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.data) {
//         // Perform action on page text data with built-in AI modules.
//         summarizePage(message.data);
//     }
// });


// async function summarizePage(pageContent) {
//     let summaryResultElement = document.getElementById("summary-result");

//     // summaryResultElement.textContent = pageContent;

//     if ('Summarizer' in self) {
//         // The Summarizer API is supported.

//         const availability = await Summarizer.availability();
//         if (availability === 'unavailable') {
//             // The Summarizer API isn't usable.
//             return;
//         }

//         const summarizer = await Summarizer.create({
//             type: "tldr",
//             length: "short",
//         });

//         const stream = await summarizer.summarize(pageContent);
//         summaryResultElement.textContent += stream;
//     }

// }