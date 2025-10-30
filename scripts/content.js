// Enum for all built-in APIs used in this extension.
const AIModels = {
    SUMMARIZER: "Summary",
    PROOFREADER: "Proofread",
    TRANSLATOR: "Translator",
    REWRITER: "Rewriter",
    WRITER: "Writer",
    PROMPT: "Prompt"
};

// When message receivd from background.js, proceed initiating the extension.
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

// Create the extension UI.
async function initiateExtension(aiModel, inputText) {
    let extensionUI = document.getElementById("draggableIframeWrapper") || null;

    // Re-opens the extension if it has been already created.
    if (extensionUI) {
        openExtensionUI(extensionUI, aiModel);
    }
    else {
        // Create the extension if it has not been yet. 
        extensionUI = await injectExtensionUI(aiModel);
    }

    // Configure the extension UI based on the selected AI model. 
    setExtensionUI(extensionUI, aiModel, inputText);
}

// Inject the extension UI into the current active page.
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

    // Inject the layout of the extension.
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

    // Make the extension draggable.
    DragElement(draggableIframeWrapper);

    // Register a close button.
    aiIcon.src = aiIconURL;
    dragIconImg.src = dragIconURL;
    closeBtn.addEventListener("click", () => {
        closeExtensionUI();
    });

    document.head.appendChild(cssLink);
    injectedIframe.contentDocument.head.appendChild(cssLink.cloneNode(false));
    injectedIframe.contentDocument.head.appendChild(metaTagElement);

    // Inject an iFrame of the extension, which will be the main UI.
    await fetch(iframeCompURL).then(res => res.text()).then(async data => {
        injectedIframe.contentDocument.body.innerHTML = data;
    });

    return draggableIframeWrapper;
}

// Configure the extension UI based on the selected AI model.
async function setExtensionUI(extensionUI, aiModel, inputText) {
    const injectedIframe = document.getElementById("injected-iframe");
    const extensionTitleHeader = injectedIframe.contentDocument.getElementById("title-header");
    const originalTextTitle = injectedIframe.contentDocument.getElementById("original-text-title");
    const originalText = injectedIframe.contentDocument.getElementById("original-text");
    const resultTextTitle = injectedIframe.contentDocument.getElementById("result-text-title");
    const resultText = injectedIframe.contentDocument.getElementById("result-text");
    const bottomBar = injectedIframe.contentDocument.getElementById("bottom-bar");
    const translatorInputGrp = injectedIframe.contentDocument.getElementById("translator-input-gp");
    const rewriterInputGrp = injectedIframe.contentDocument.getElementById("rewriter-input-gp");
    const writerInputGrp = injectedIframe.contentDocument.getElementById("writer-input-gp");
    const promptInputGrp = injectedIframe.contentDocument.getElementById("prompt-input-gp");
    const translatorInputtedLang = injectedIframe.contentDocument.getElementById("translator-inputted-lang");
    const resultAreaBlock = injectedIframe.contentDocument.getElementById("result-block");
    const promptAreaBlock = injectedIframe.contentDocument.getElementById("prompt-results-area");
    let submitBtn = injectedIframe.contentDocument.getElementById("submit-btn");

    extensionTitleHeader.textContent = "🤖" + aiModel;

    resultText.textContent = "";
    resultText.classList.add('disable-animations');


    // Reset all event listeners associated with the submit button.
    const clonedSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.replaceWith(clonedSubmitBtn);
    submitBtn = injectedIframe.contentDocument.getElementById("submit-btn");

    // If/else statements to adjust the UI based on the selected AI model.
    // injectAIResult() will be called to populate the UI with the AI reponse. 
    if (aiModel === AIModels.SUMMARIZER) {
        resultAreaBlock.classList.remove("disable-element");
        promptAreaBlock.classList.add("disable-element");
        originalTextTitle.classList.add('disable-element');
        originalText.classList.add('disable-element');
        resultTextTitle.classList.remove('disable-element');
        resultTextTitle.textContent = "Key points:";
        bottomBar.classList.add('disable-element');

        injectAIResult(aiModel, inputText);
    }
    else if (aiModel === AIModels.PROOFREADER) {
        resultAreaBlock.classList.remove("disable-element");
        promptAreaBlock.classList.add("disable-element");
        originalTextTitle.classList.add('disable-element');
        originalText.classList.add('disable-element');
        resultTextTitle.classList.remove('disable-element');
        resultTextTitle.textContent = "Corrections:";
        bottomBar.classList.add('disable-element');

        injectAIResult(aiModel, inputText);
    }
    else if (aiModel === AIModels.TRANSLATOR) {
        const langDropdownBtn = injectedIframe.contentDocument.getElementById("lang-dropdown-btn");
        const langDropdown = injectedIframe.contentDocument.getElementById("lang-dropdown-content");

        langDropdownBtn.textContent = "Select a Language ⤴️";

        resultAreaBlock.classList.remove("disable-element");
        promptAreaBlock.classList.add("disable-element");
        originalTextTitle.classList.remove('disable-element');
        originalText.classList.remove('disable-element');
        originalText.textContent = inputText;
        resultTextTitle.classList.remove('disable-element');
        resultTextTitle.textContent = "Translation:";
        bottomBar.classList.remove('disable-element');
        translatorInputGrp.classList.remove('disable-element');
        rewriterInputGrp.classList.add('disable-element');
        writerInputGrp.classList.add('disable-element');
        promptInputGrp.classList.add('disable-element');

        submitBtn.classList.add("submit-btn-disabled");

        resultText.innerHTML = "<em><b>Select a language from the dropdown menu below, then click the send button to start translating.</b></em>";

        const displayLangName = new Intl.DisplayNames(['en'], { type: 'language' });
        const detectedLang = await detectLanguage(inputText);
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
            resultText.innerHTML = "";
            injectAIResult(AIModels.TRANSLATOR, inputText, { sourceLang: detectedLang, targetedLang: targetLang });
            submitBtn.classList.add("submit-btn-disabled");
        });
    }
    else if (aiModel === AIModels.REWRITER) {
        const toneDropdownBtn = injectedIframe.contentDocument.getElementById("tone-dropdown-btn");
        const toneDropdown = injectedIframe.contentDocument.getElementById("tone-dropdown-content");
        const lengthDropdownBtn = injectedIframe.contentDocument.getElementById("length-dropdown-btn");
        const lengthDropdown = injectedIframe.contentDocument.getElementById("length-dropdown-content");

        toneDropdownBtn.textContent = "Select the Tone: ⤴️";
        lengthDropdownBtn.textContent = "Select the Length: ⤴️";

        resultAreaBlock.classList.remove("disable-element");
        promptAreaBlock.classList.add("disable-element");
        originalTextTitle.classList.remove('disable-element');
        originalText.classList.remove('disable-element');
        originalText.textContent = inputText;
        resultTextTitle.classList.remove('disable-element');
        resultTextTitle.textContent = "Rewritten text:";
        bottomBar.classList.remove('disable-element');
        translatorInputGrp.classList.add('disable-element');
        rewriterInputGrp.classList.remove('disable-element');
        promptInputGrp.classList.add('disable-element');
        writerInputGrp.classList.add('disable-element');

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
            resultText.innerHTML = "";
            injectAIResult(AIModels.REWRITER, inputText, { _tone: tone, _length: length });
            submitBtn.classList.add("submit-btn-disabled");
        });
    }
    else if (aiModel === AIModels.WRITER) {
        const toneDropdownBtn = injectedIframe.contentDocument.getElementById("w-tone-dropdown-btn");
        const toneDropdown = injectedIframe.contentDocument.getElementById("w-tone-dropdown-content");
        const lengthDropdownBtn = injectedIframe.contentDocument.getElementById("w-length-dropdown-btn");
        const lengthDropdown = injectedIframe.contentDocument.getElementById("w-length-dropdown-content");
        const writerPromptInput = injectedIframe.contentDocument.getElementById("w-prompt-input");

        toneDropdownBtn.textContent = "Select the Tone: ⤴️";
        lengthDropdownBtn.textContent = "Select the Length: ⤴️";
        writerPromptInput.disabled = false;

        resultAreaBlock.classList.add("disable-element");
        promptAreaBlock.classList.remove("disable-element");
        originalTextTitle.classList.add('disable-element');
        originalText.classList.add('disable-element');
        resultTextTitle.classList.add('disable-element');
        bottomBar.classList.remove('disable-element');
        translatorInputGrp.classList.add('disable-element');
        rewriterInputGrp.classList.add('disable-element');
        promptInputGrp.classList.add('disable-element');
        writerInputGrp.classList.remove('disable-element');

        submitBtn.classList.add("submit-btn-disabled");

        resultText.innerHTML = "<em><b>Make a selection below, ask the writer, then click the send button to start writing.</b></em>";

        let tone = "";
        let length = "";

        const toneDropdownContent = toneDropdown.children;
        for (const child of toneDropdownContent) {
            child.addEventListener("click", () => {
                tone = child.id;
                toneDropdownBtn.textContent = "Tone: " + child.textContent + " ⤴️";

                if (writerPromptInput.value && tone && length) {
                    submitBtn.classList.remove("submit-btn-disabled");
                }
                else {
                    submitBtn.classList.add("submit-btn-disabled");
                }
            });
        }

        const lengthDropdownContent = lengthDropdown.children;
        for (const child of lengthDropdownContent) {
            child.addEventListener("click", () => {
                length = child.id;
                lengthDropdownBtn.textContent = "Length: " + child.textContent + " ⤴️";

                if (writerPromptInput.value && tone && length) {
                    submitBtn.classList.remove("submit-btn-disabled");
                }
                else {
                    submitBtn.classList.add("submit-btn-disabled");
                }
            });
        }

        writerPromptInput.addEventListener('input', () => {
            if (writerPromptInput.value && tone && length) {
                submitBtn.classList.remove("submit-btn-disabled");
            }
            else {
                submitBtn.classList.add("submit-btn-disabled");
            }
        });

        writerPromptInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                if (writerPromptInput.value && tone && length) {
                    injectAIResult(AIModels.WRITER, writerPromptInput.value, { _tone: tone, _length: length });
                    writerPromptInput.value = "";
                    writerPromptInput.disabled = true;
                    submitBtn.classList.add("submit-btn-disabled");
                }
            }
        });

        submitBtn.addEventListener("click", () => {
            injectAIResult(AIModels.WRITER, writerPromptInput.value, { _tone: tone, _length: length });
            writerPromptInput.value = "";
            writerPromptInput.disabled = true;
            submitBtn.classList.add("submit-btn-disabled");
        });

        injectedIframe.contentWindow.scrollTo(0, 99999);
    }
    else if (aiModel === AIModels.PROMPT) {
        const promptInput = injectedIframe.contentDocument.getElementById("prompt-input");

        promptInput.disabled = false;

        resultAreaBlock.classList.add("disable-element");
        promptAreaBlock.classList.remove("disable-element");
        originalTextTitle.classList.add('disable-element');
        originalText.classList.add('disable-element');
        resultTextTitle.classList.add('disable-element');
        bottomBar.classList.remove('disable-element');
        translatorInputGrp.classList.add('disable-element');
        rewriterInputGrp.classList.add('disable-element');
        promptInputGrp.classList.remove('disable-element');
        writerInputGrp.classList.add('disable-element');

        submitBtn.classList.add("submit-btn-disabled");

        promptInput.addEventListener('input', () => {
            if (promptInput.value) {
                submitBtn.classList.remove("submit-btn-disabled");
            }
            else {
                submitBtn.classList.add("submit-btn-disabled");
            }
        });

        promptInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                if (promptInput.value) {
                    injectAIResult(AIModels.PROMPT, promptInput.value);
                    promptInput.value = "";
                    promptInput.disabled = true;
                    submitBtn.classList.add("submit-btn-disabled");
                }
            }
        });

        submitBtn.addEventListener("click", () => {
            injectAIResult(AIModels.PROMPT, promptInput.value);
            promptInput.value = "";
            promptInput.disabled = true;
            submitBtn.classList.add("submit-btn-disabled");
        });

        injectedIframe.contentWindow.scrollTo(0, 99999);
    }
}

// Call the AI APIs, then populate the response to the user. 
async function injectAIResult(aiModel, inputText, additionalParams) {
    const injectedIframe = document.getElementById("injected-iframe");
    const aiResultTextArea = injectedIframe.contentDocument.getElementById("result-text");
    const submitBtn = injectedIframe.contentDocument.getElementById("submit-btn");
    const promptResultsArea = injectedIframe.contentDocument.getElementById("prompt-results-area");
    const writerPromptInput = injectedIframe.contentDocument.getElementById("w-prompt-input");
    const promptInput = injectedIframe.contentDocument.getElementById("prompt-input");

    aiResultTextArea.classList.remove('disable-animations');

    // Try/Catch statements in case of the apis are not available. 
    if (aiModel === AIModels.SUMMARIZER) {
        try {
            for await (chunk of await summarize(inputText)) {
                aiResultTextArea.innerHTML += chunk;
            }
        }
        catch {
            aiResultTextArea.innerHTML = "The Summarizer is still downloading. Please try again.";
        }
        aiResultTextArea.innerHTML = await marked.parse(aiResultTextArea.innerHTML);
        aiResultTextArea.append(createCopyButton());
    }
    else if (aiModel === AIModels.PROOFREADER) {
        try {
            aiResultTextArea.innerHTML = await proofread(inputText);
        }
        catch {
            aiResultTextArea.innerHTML = "The Proofreader is still downloading. Please try again.";
        }
    }
    else if (aiModel === AIModels.TRANSLATOR) {
        try {
            for await (chunk of await translate(inputText, additionalParams.sourceLang, additionalParams.targetedLang)) {
                aiResultTextArea.innerHTML += chunk;
            }
            aiResultTextArea.appendChild(createCopyButton());
        }
        catch {
            aiResultTextArea.innerHTML = "The Translator is still downloading. Please try again.";
        }
        submitBtn.classList.remove("submit-btn-disabled");
    }
    else if (aiModel === AIModels.REWRITER) {
        try {
            for await (chunk of await rewrite(inputText, additionalParams._tone, additionalParams._length)) {
                aiResultTextArea.innerHTML += chunk;
            }
            aiResultTextArea.appendChild(createCopyButton());
        }
        catch {
            aiResultTextArea.innerHTML = "The Rewriter is still downloading. Please try again.";
        }
        submitBtn.classList.remove("submit-btn-disabled");
    }
    else if (aiModel === AIModels.WRITER) {
        const newInputElement = document.createElement("div");
        const newOutputElement = document.createElement("div");

        newInputElement.classList.add("user-input-prompt");
        newOutputElement.classList.add("prompt-output");

        promptResultsArea.appendChild(newInputElement);
        promptResultsArea.appendChild(newOutputElement);

        newInputElement.textContent = inputText;


        try {
            for await (chunk of await writer(inputText, additionalParams._tone, additionalParams._length)) {
                newOutputElement.innerHTML += chunk;
                injectedIframe.contentWindow.scrollTo(0, 99999);
            }
            newOutputElement.innerHTML = await marked.parse(newOutputElement.innerHTML);
            newOutputElement.appendChild(createCopyButton());
        }
        catch {
            newOutputElement.innerHTML = "The Writer is still downloading. Please try again.";
        }
        writerPromptInput.disabled = false;
        newOutputElement.classList.add('disable-animations');

        injectedIframe.contentWindow.scrollTo(0, 99999);
    }
    else if (aiModel === AIModels.PROMPT) {
        const newInputElement = document.createElement("div");
        const newOutputElement = document.createElement("div");

        newInputElement.classList.add("user-input-prompt");
        newOutputElement.classList.add("prompt-output");

        promptResultsArea.appendChild(newInputElement);
        promptResultsArea.appendChild(newOutputElement);

        newInputElement.textContent = inputText;


        try {
            for await (chunk of await prompt(inputText)) {
                newOutputElement.innerHTML += chunk;
                injectedIframe.contentWindow.scrollTo(0, 99999);
            }
            newOutputElement.innerHTML = await marked.parse(newOutputElement.innerHTML);
            newOutputElement.appendChild(createCopyButton());
        }
        catch {
            newOutputElement.innerHTML = "The Writer is still downloading. Please try again.";
        }
        promptInput.disabled = false;
        newOutputElement.classList.add('disable-animations');

        injectedIframe.contentWindow.scrollTo(0, 99999);
    }


    aiResultTextArea.classList.add('disable-animations');
}