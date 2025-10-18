// function grabAllTextContent() {
//     let textContent = "";
//     // document.querySelectorAll("p").forEach(e => { textContent += e.textContent; });
//     textContent += document.querySelectorAll("p")[2].textContent;

//     return textContent;
// }

// // When message receivd from popup.js, proceed.
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === 'performAction') {
//         // sendResponse({ status: 'success' }); // Optional: Send a response back
//         console.log("message received.")

//         let textContent = grabAllTextContent();

//         // Send page content to popup.js
//         chrome.runtime.sendMessage({ data: textContent });
//     }
// });


// When message receivd from service-worker.js, proceed.
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'summarize') {
        console.log("message received.");

        document.getElementById("ai-result").innerText = await summarizePage(message.data);
    }
});

// injectHTML();

async function injectHTML() {
    const injectedHTMLURL = chrome.runtime.getURL('injected_html.html');
    const injectedCSSURL = chrome.runtime.getURL('style.css');
    const aiIconImg = chrome.runtime.getURL('images/icon-128.png');

    // Inject css styling.
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.type = "text/css";
    cssLink.href = injectedCSSURL;
    document.head.appendChild(cssLink);

    // Inject extension html.
    await fetch(injectedHTMLURL).then(res => res.text()).then(data => {
        const injectedDiv = document.createElement('div');
        injectedDiv.id = "injected-div";

        injectedDiv.innerHTML = data;

        document.body.appendChild(injectedDiv);

    }).catch(e => console.error("Error loading extenstion HTML."));

    // Update the extension html icon image.
    document.getElementById("ai-icon").src = aiIconImg;
}

async function summarizePage(pageContent) {
    if ('Summarizer' in self) {
        // The Summarizer API is supported.

        const availability = await Summarizer.availability();
        if (availability === 'unavailable') {
            // The Summarizer API isn't usable.
            return "The Summarizer isn't available right now. Please try again.";
        }

        const summarizer = await Summarizer.create({
            type: "key-points",
            length: "short",
            format: "plain-text"
        });

        const stream = await summarizer.summarize(pageContent);
        // summaryResultElement.textContent += stream;
        return stream;
    }
}
