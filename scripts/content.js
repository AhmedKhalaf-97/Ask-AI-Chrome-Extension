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
        // document.getElementById("ai-result").innerText = await summarizePage(message.data);


    }
});

injectHTML();


async function injectHTML() {
    const injectedHTMLURL = chrome.runtime.getURL('injected_html.html');
    const injectedCSSURL = chrome.runtime.getURL('style.css');
    const aiIconURL = chrome.runtime.getURL('images/icon-128.png');
    const dragIconURL = chrome.runtime.getURL('images/drag-drop.png');

    const draggableIframeWrapper = document.createElement("div");
    draggableIframeWrapper.id = "draggableIframeWrapper";
    draggableIframeWrapper.setAttribute("draggable", "true");
    document.body.appendChild(draggableIframeWrapper);

    const topBar = document.createElement("div");
    topBar.id = "topBar";
    draggableIframeWrapper.appendChild(topBar);

    const aiIcon = document.createElement("img");
    aiIcon.id = "ai-icon";
    aiIcon.src = aiIconURL;
    topBar.appendChild(aiIcon);

    const dragIconImg = document.createElement("img");
    dragIconImg.id = "dragIconImg";
    dragIconImg.src = dragIconURL;
    topBar.appendChild(dragIconImg);

    const closeBtn = document.createElement("div");
    closeBtn.id = "closeBtn";
    topBar.appendChild(closeBtn);


    // Inject css styling.
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.type = "text/css";
    cssLink.href = injectedCSSURL;
    document.head.appendChild(cssLink);

    const metaTagElement = document.createElement("meta");
    metaTagElement.setAttribute("charset", "UTF-8");

    // Inject extension html.
    const injectedIframe = document.createElement('iframe');
    injectedIframe.id = "injected-iframe";
    draggableIframeWrapper.appendChild(injectedIframe);


    injectedIframe.contentDocument.head.appendChild(cssLink.cloneNode(false));
    injectedIframe.contentDocument.head.appendChild(metaTagElement);

    await fetch(injectedHTMLURL).then(res => res.text()).then(data => {
        injectedIframe.contentDocument.body.innerHTML = data;
    }).catch(e => console.error("Error loading extenstion HTML."));


    // Update the extension html icon image.
    // injectedIframe.contentDocument.getElementById("ai-icon").src = aiIconURL;


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

const draggableElement = document.getElementById("draggableIframeWrapper");

DragElement(draggableElement);

function DragElement(element) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(element.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(element.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}