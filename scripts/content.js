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


const AIModels = {
    SUMMARIZER: "Summary",
    PROOFREADER: "Proofread"
};

// When message receivd from service-worker.js, proceed.
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'summarize') {
        initiateExtension(AIModels.SUMMARIZER, message.data);
    }

    if (message.action === 'proofread') {
        initiateExtension(AIModels.PROOFREADER, message.data);
    }
});

async function initiateExtension(aiModel, selectedText) {
    const extensionUI = document.getElementById("draggableIframeWrapper") || null;

    if (extensionUI) {
        openExtensionUI(extensionUI, aiModel, selectedText);
    }
    else {
        await injectExtensionUIHtml(aiModel, selectedText);
    }

    const injectedIframe = document.getElementById("injected-iframe");
    injectedIframe.contentDocument.getElementById("title-header").textContent = "🤖" + aiModel;

    const contentHeader = injectedIframe.contentDocument.getElementById("ai-content").firstElementChild;
    if (aiModel === AIModels.SUMMARIZER) {
        contentHeader.textContent = "Key points:";
    }
    else if (aiModel === AIModels.PROOFREADER) {
        contentHeader.textContent = "Result:";
    }
}

// injectExtensionUIHtml("Empty");

async function injectExtensionUIHtml(aiModel, selectedText) {
    const injectedHTMLURL = chrome.runtime.getURL('injected_html.html');
    const injectedCSSURL = chrome.runtime.getURL('style.css');
    const aiIconURL = chrome.runtime.getURL('images/icon-128.png');
    const dragIconURL = chrome.runtime.getURL('images/drag-drop.png');

    const draggableIframeWrapper = document.createElement("div");
    draggableIframeWrapper.id = "draggableIframeWrapper";
    draggableIframeWrapper.setAttribute("draggable", "true");
    document.body.appendChild(draggableIframeWrapper);

    DragElement(draggableIframeWrapper);

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
    closeBtn.addEventListener("click", () => {
        closeExtensionUI();
    });
    topBar.appendChild(closeBtn);

    // Inject css styling.
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.type = "text/css";
    cssLink.href = injectedCSSURL;
    document.head.appendChild(cssLink);

    const metaTagElement = document.createElement("meta");
    metaTagElement.setAttribute("charset", "UTF-8");

    // Inject iframe html.
    const injectedIframe = document.createElement('iframe');
    injectedIframe.id = "injected-iframe";
    draggableIframeWrapper.appendChild(injectedIframe);


    injectedIframe.contentDocument.head.appendChild(cssLink.cloneNode(false));
    injectedIframe.contentDocument.head.appendChild(metaTagElement);

    await fetch(injectedHTMLURL).then(res => res.text()).then(async data => {
        injectedIframe.contentDocument.body.innerHTML = data;

        injectAIResult(aiModel, selectedText);

    }).catch(e => console.error("Error loading extenstion HTML."));
}

function openExtensionUI(extensionUI, aiModel, selectedText) {
    extensionUI.style.display = 'block';
    extensionUI.style.bottom = "0%";
    extensionUI.style.left = "40%";

    injectAIResult(aiModel, selectedText);
}

function closeExtensionUI() {
    const extensionUI = document.getElementById("draggableIframeWrapper")

    extensionUI.style.display = 'none';
}

async function injectAIResult(aiModel, selectedText) {
    const injectedIframe = document.getElementById("injected-iframe");
    const aiResultTextArea = injectedIframe.contentDocument.getElementById("ai-result");

    aiResultTextArea.innerHTML = "Generating...";
    aiResultTextArea.classList.remove('disable-animations');

    if (aiModel === AIModels.SUMMARIZER) {
        aiResultTextArea.innerHTML = await marked.parse(await summarize(selectedText));
    }
    else if (aiModel === AIModels.PROOFREADER) {
        aiResultTextArea.innerHTML = await proofread(selectedText);
    }
    aiResultTextArea.classList.add('disable-animations');
}

function DragElement(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    element.onmousedown = dragMouseDown;


    function dragMouseDown(e) {
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

async function summarize(content) {
    let output = "";

    if ('Summarizer' in self) {
        // The Summarizer API is supported.

        const availability = await Summarizer.availability();
        if (availability === 'unavailable') {
            // The Summarizer API isn't usable.
            output = "The Summarizer isn't available right now. Please try again.";
        }
        else {
            const summarizer = await Summarizer.create({
                type: "key-points",
                length: "short",
                format: "markdown"
            });

            try {
                output = await summarizer.summarize(content);
            }
            catch (error) {
                output = "Input is too large or the Summarizer is not available right now. Please try again.";
            }
        }
    }
    else {
        output = "Your browser doesn't support the Summarizer API.";
    }

    return output;
}


async function proofread(content) {
    let output = "";

    if ('Proofreader' in self) {
        const availability = await Proofreader.availability();

        if (availability === 'unavailable') {
            output = "The Proofreader isn't available right now. Please try again.";
        }
        else {
            const proofreader = await Proofreader.create({
                expectedInputLanguages: ['en'],
            });

            try {
                const proofreadResult = await proofreader.proofread(content);
                output = "<strong>Corrected text:</strong><br><br>";
                output += proofreadResult.correctedInput;

                output += "<br><br><hr><strong>Original text:</strong>"

                let inputtedText = content;
                let offset = 0;
                for (const correction of proofreadResult.corrections) {
                    inputtedText = inputtedText.slice(0, correction.startIndex + offset) + "<mark>" + inputtedText.slice(correction.startIndex + offset);
                    offset += 6;
                    inputtedText = inputtedText.slice(0, correction.endIndex + offset) + "</mark>" + inputtedText.slice(correction.endIndex + offset);
                    offset += 7;
                }

                output += `<br><br>${inputtedText}`;

                output += "<br><br><strong><i>*Corrections are highlighted above.</i></strong>";

                output += "<br><br><strong>Corrections made:</strong>";

                let i = 0;
                for (const correction of proofreadResult.corrections) {
                    output += `<br>${++i}. ${correction.correction}`;
                }
            }
            catch (error) {
                output = "Input is too large or the Proofreader is not available right now. Please try again.";
            }
        }
    }
    else {
        output = "Your browser doesn't support the Proofreader API.";
    }

    return output;
}