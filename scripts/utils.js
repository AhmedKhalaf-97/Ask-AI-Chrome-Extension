// Re-opens the extension, if it has been already created.  
function openExtensionUI(extensionUI, aiModel) {
    extensionUI.style.display = 'block';
    extensionUI.style.bottom = "0%";
    extensionUI.style.left = "40%";
}

// Close the extension.
function closeExtensionUI() {
    const extensionUI = document.getElementById("draggableIframeWrapper");

    extensionUI.style.display = 'none';
}

// Make the extension or any element draggable. 
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

// It will create a copy button that can be added to the AI generated reponses. 
function createCopyButton() {
    const copyGroup = document.createElement("div");
    copyGroup.classList.add("copy-group");

    const copyBtn = document.createElement("button");
    copyBtn.classList.add("copy-btn");
    copyBtn.textContent = "📄Copy";

    const copyBtnTooltip = document.createElement("span");
    copyBtnTooltip.classList.add("copy-btn-tooltip");
    copyBtnTooltip.classList.add("disable-element");
    copyBtnTooltip.textContent = "Copied!";

    copyGroup.appendChild(copyBtn);
    copyGroup.appendChild(copyBtnTooltip);

    copyBtn.addEventListener("click", () => {

        navigator.clipboard.writeText(copyGroup.parentElement.innerText.slice(0, -7));
        copyBtnTooltip.classList.remove("disable-element");
        setTimeout(() => { copyBtnTooltip.classList.add("disable-element"); }, 1000);
    })
    return copyGroup;
}