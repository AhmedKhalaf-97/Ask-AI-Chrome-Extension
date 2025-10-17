function grabAllTextContent() {
    let textContent = "";
    // document.querySelectorAll("p").forEach(e => { textContent += e.textContent; });
    textContent += document.querySelectorAll("p")[2].textContent;

    return textContent;
}

// When message receivd from popup.js, proceed.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'performAction') {
        // sendResponse({ status: 'success' }); // Optional: Send a response back
        console.log("message received.")

        let textContent = grabAllTextContent();

        // Send page content to popup.js
        chrome.runtime.sendMessage({ data: textContent });
    }
});


// When message receivd from service-worker.js, proceed.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'summarize') {
        // sendResponse({ status: 'success' }); // Optional: Send a response back
        console.log("message received.");

        // summarizePage();

    }
});

async function summarizePage(pageContent) {
    // let summaryResultElement = document.getElementById("summary-result");

    // summaryResultElement.textContent = pageContent;

    if ('Summarizer' in self) {
        // The Summarizer API is supported.

        const availability = await Summarizer.availability();
        if (availability === 'unavailable') {
            // The Summarizer API isn't usable.
            return;
        }

        const summarizer = await Summarizer.create({
            type: "tldr",
            length: "short",
        });

        const stream = await summarizer.summarize(pageContent);
        // summaryResultElement.textContent += stream;
        console.log(stream);

    }

}