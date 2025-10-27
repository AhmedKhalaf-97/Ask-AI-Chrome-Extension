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
    PROOFREADER: "Proofread",
    TRANSLATOR: "Translator",
    REWRITER: "Rewriter",
    WRITER: "Writer",
    PROMPT: "Prompt"
};

// When message receivd from service-worker.js, proceed.
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === AIModels.SUMMARIZER) {
        initiateExtension(AIModels.SUMMARIZER, message.data);
    }

    if (message.action === AIModels.PROOFREADER) {
        initiateExtension(AIModels.PROOFREADER, message.data);
    }

    if (message.action === AIModels.TRANSLATOR) {
        initiateExtension(AIModels.TRANSLATOR, message.data);
    }

    if (message.action === AIModels.REWRITER) {
        initiateExtension(AIModels.REWRITER, message.data);
    }

    if (message.action === AIModels.WRITER) {
        initiateExtension(AIModels.WRITER);
    }

    if (message.action === AIModels.PROMPT) {
        initiateExtension(AIModels.PROMPT);
    }
});

// initiateExtension(AIModels.REWRITER);

async function initiateExtension(aiModel, selectedText) {
    let extensionUI = document.getElementById("draggableIframeWrapper") || null;

    if (extensionUI) {
        openExtensionUI(extensionUI, aiModel);
    }
    else {
        extensionUI = await injectExtensionUI(aiModel);
    }

    setExtensionUI(extensionUI, aiModel, selectedText);
}

async function injectExtensionUI(aiModel) {
    const layoutURL = chrome.runtime.getURL('html-components/_layout.html');
    const iframeCompURL = chrome.runtime.getURL('html-components/iframe_comp.html');
    const injectedCSSURL = chrome.runtime.getURL('style.css');
    const aiIconURL = chrome.runtime.getURL('images/icon-128.png');
    const dragIconURL = chrome.runtime.getURL('images/drag-drop.png');

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.type = "text/css";
    cssLink.href = injectedCSSURL;

    const metaTagElement = document.createElement("meta");
    metaTagElement.setAttribute("charset", "UTF-8");

    await fetch(layoutURL).then(res => res.text()).then(async data => {

        const layoutElement = document.createElement("div");
        layoutElement.innerHTML = data;

        document.body.appendChild(layoutElement);
    });


    const draggableIframeWrapper = document.getElementById("draggableIframeWrapper");
    const aiIcon = document.getElementById("ai-icon");
    const dragIconImg = document.getElementById("dragIconImg");
    const closeBtn = document.getElementById("closeBtn");
    const injectedIframe = document.getElementById('injected-iframe');

    DragElement(draggableIframeWrapper);

    aiIcon.src = aiIconURL;
    dragIconImg.src = dragIconURL;
    closeBtn.addEventListener("click", () => {
        closeExtensionUI();
    });

    document.head.appendChild(cssLink);
    injectedIframe.contentDocument.head.appendChild(cssLink.cloneNode(false));
    injectedIframe.contentDocument.head.appendChild(metaTagElement);


    await fetch(iframeCompURL).then(res => res.text()).then(async data => {
        injectedIframe.contentDocument.body.innerHTML = data;
    });

    return draggableIframeWrapper;
}

function openExtensionUI(extensionUI, aiModel) {
    extensionUI.style.display = 'block';
    extensionUI.style.bottom = "0%";
    extensionUI.style.left = "40%";
}

const submitBtnController = new AbortController();
const submitBtnSignal = submitBtnController.signal;

async function setExtensionUI(extensionUI, aiModel, selectedText) {
    const injectedIframe = document.getElementById("injected-iframe");
    const extensionTitleHeader = injectedIframe.contentDocument.getElementById("title-header");
    const originalTextTitle = injectedIframe.contentDocument.getElementById("original-text-title");
    const originalText = injectedIframe.contentDocument.getElementById("original-text");
    const resultTextTitle = injectedIframe.contentDocument.getElementById("result-text-title");
    const resultText = injectedIframe.contentDocument.getElementById("result-text");
    const bottomBar = injectedIframe.contentDocument.getElementById("bottom-bar");
    const translatorInputGrp = injectedIframe.contentDocument.getElementById("translator-input-gp");
    const rewriterInputGrp = injectedIframe.contentDocument.getElementById("rewriter-input-gp");
    const promptInputGrp = injectedIframe.contentDocument.getElementById("prompt-input-gp");
    const translatorInputtedLang = injectedIframe.contentDocument.getElementById("translator-inputted-lang");
    const submitBtn = injectedIframe.contentDocument.getElementById("submit-btn");

    submitBtnController.abort();

    extensionTitleHeader.textContent = "🤖" + aiModel;

    resultText.textContent = "";
    resultText.classList.add('disable-animations');

    if (aiModel === AIModels.SUMMARIZER) {
        originalTextTitle.classList.add('disable-element');
        originalText.classList.add('disable-element');
        resultTextTitle.classList.remove('disable-element');
        resultTextTitle.textContent = "Key points:";
        bottomBar.classList.add('disable-element');

        injectAIResult(aiModel, selectedText);
    }
    else if (aiModel === AIModels.PROOFREADER) {
        originalTextTitle.classList.add('disable-element');
        originalText.classList.add('disable-element');
        resultTextTitle.classList.add('disable-element');
        bottomBar.classList.add('disable-element');

        injectAIResult(aiModel, selectedText);
    }
    else if (aiModel === AIModels.TRANSLATOR) {
        const langDropdownBtn = injectedIframe.contentDocument.getElementById("lang-dropdown-btn");
        const langDropdown = injectedIframe.contentDocument.getElementById("lang-dropdown-content");

        langDropdownBtn.textContent = "Select a Language ⤴️";

        originalTextTitle.classList.remove('disable-element');
        originalText.classList.remove('disable-element');
        originalText.textContent = selectedText;
        resultTextTitle.classList.remove('disable-element');
        resultTextTitle.textContent = "Translation:";
        bottomBar.classList.remove('disable-element');
        translatorInputGrp.classList.remove('disable-element');
        rewriterInputGrp.classList.add('disable-element');
        promptInputGrp.classList.add('disable-element');

        submitBtn.classList.add("submit-btn-disabled");

        resultText.innerHTML = "<em><b>Select a language from the dropdown menu below, then click the send button to start translating.</b></em>";

        const displayLangName = new Intl.DisplayNames(['en'], { type: 'language' });
        const detectedLang = await detectLanguage(selectedText);
        const detectedLangName = displayLangName.of(detectedLang);
        translatorInputtedLang.textContent = detectedLangName;

        let targetLang = "";

        const langDropdownContent = langDropdown.children;
        for (const child of langDropdownContent) {
            child.addEventListener("click", () => {
                targetLang = child.id;
                langDropdownBtn.textContent = child.textContent + " ⤴️";

                if (detectedLang === targetLang) {
                    resultText.innerHTML = "<em><b>Can't translate to the same language. Please select another language.</b></em>";
                    submitBtn.classList.add("submit-btn-disabled");
                }
                else {
                    resultText.innerHTML = `<em><b>Translate from <u>${detectedLangName}</u> to <u>${child.textContent}</u> </b></em>`;
                    submitBtn.classList.remove("submit-btn-disabled");
                }

            });
        }

        submitBtn.addEventListener("click", () => {
            injectAIResult(AIModels.TRANSLATOR, selectedText, { sourceLang: detectedLang, targetedLang: targetLang });
            submitBtn.classList.add("submit-btn-disabled");
        }, { submitBtnSignal });
    }
    else if (aiModel === AIModels.REWRITER) {
        const toneDropdownBtn = injectedIframe.contentDocument.getElementById("tone-dropdown-btn");
        const toneDropdown = injectedIframe.contentDocument.getElementById("tone-dropdown-content");
        const lengthDropdownBtn = injectedIframe.contentDocument.getElementById("length-dropdown-btn");
        const lengthDropdown = injectedIframe.contentDocument.getElementById("length-dropdown-content");

        toneDropdownBtn.textContent = "Select the Tone: ⤴️";
        lengthDropdownBtn.textContent = "Select the Length: ⤴️";

        originalTextTitle.classList.remove('disable-element');
        originalText.classList.remove('disable-element');
        originalText.textContent = selectedText;
        resultTextTitle.classList.remove('disable-element');
        resultTextTitle.textContent = "Rewritten text:";
        bottomBar.classList.remove('disable-element');
        translatorInputGrp.classList.add('disable-element');
        rewriterInputGrp.classList.remove('disable-element');
        promptInputGrp.classList.add('disable-element');

        submitBtn.classList.add("submit-btn-disabled");

        resultText.innerHTML = "<em><b>Make a selection below, then click the send button to start rewriting.</b></em>";

        let tone = "";
        let length = "";

        const toneDropdownContent = toneDropdown.children;
        for (const child of toneDropdownContent) {
            child.addEventListener("click", () => {
                tone = child.id;
                toneDropdownBtn.textContent = "Tone: " + child.textContent + " ⤴️";

                if (tone && length) {
                    submitBtn.classList.remove("submit-btn-disabled");
                }
            });
        }

        const lengthDropdownContent = lengthDropdown.children;
        for (const child of lengthDropdownContent) {
            child.addEventListener("click", () => {
                length = child.id;
                lengthDropdownBtn.textContent = "Length: " + child.textContent + " ⤴️";

                if (tone && length) {
                    submitBtn.classList.remove("submit-btn-disabled");
                }
            });
        }

        submitBtn.addEventListener("click", () => {
            injectAIResult(AIModels.REWRITER, selectedText, { _tone: tone, _length: length });
            submitBtn.classList.add("submit-btn-disabled");
        }, { submitBtnSignal });
    }
    else if (aiModel === AIModels.WRITER) {
        originalTextTitle.classList.add('disable-element');
        originalText.classList.add('disable-element');
        resultTextTitle.classList.add('disable-element');
        bottomBar.classList.remove('disable-element');
        translatorInputGrp.classList.add('disable-element');
        rewriterInputGrp.classList.add('disable-element');
        promptInputGrp.classList.remove('disable-element');

        submitBtn.classList.remove("submit-btn-disabled");
    }
    else if (aiModel === AIModels.PROMPT) {
        originalTextTitle.classList.add('disable-element');
        originalText.classList.add('disable-element');
        resultTextTitle.classList.add('disable-element');
        bottomBar.classList.remove('disable-element');
        translatorInputGrp.classList.add('disable-element');
        rewriterInputGrp.classList.add('disable-element');
        promptInputGrp.classList.remove('disable-element');

        submitBtn.classList.remove("submit-btn-disabled");
    }
}

function closeExtensionUI() {
    const extensionUI = document.getElementById("draggableIframeWrapper")

    extensionUI.style.display = 'none';
}

async function injectAIResult(aiModel, selectedText, additionalParams) {
    const injectedIframe = document.getElementById("injected-iframe");
    const aiResultTextArea = injectedIframe.contentDocument.getElementById("result-text");
    const submitBtn = injectedIframe.contentDocument.getElementById("submit-btn");

    aiResultTextArea.innerHTML = "Generating...";
    aiResultTextArea.classList.remove('disable-animations');

    if (aiModel === AIModels.SUMMARIZER) {
        aiResultTextArea.innerHTML = await marked.parse(await summarize(selectedText));
    }
    else if (aiModel === AIModels.PROOFREADER) {
        aiResultTextArea.innerHTML = await proofread(selectedText);
    }
    else if (aiModel === AIModels.TRANSLATOR) {
        try {
            aiResultTextArea.innerHTML = await translate(selectedText, additionalParams.sourceLang, additionalParams.targetedLang);
        }
        catch {
            aiResultTextArea.innerHTML = "The Translator is still downloading. Please try again.";
        }
        submitBtn.classList.remove("submit-btn-disabled");
    }
    else if (aiModel === AIModels.REWRITER) {
        try {
            aiResultTextArea.innerHTML = await rewrite(selectedText, additionalParams._tone, additionalParams._length);
        }
        catch {
            aiResultTextArea.innerHTML = "The Rewriter is still downloading. Please try again.";
        }
        submitBtn.classList.remove("submit-btn-disabled");
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