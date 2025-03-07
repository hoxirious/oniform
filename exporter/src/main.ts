import Oniform from "./components/oniform.ts";
import Clipboard from "./components/clipboard.ts";
import clipboard from "./static/paste.svg";
import ActionButton from "./components/actionButton.ts";
import "./styles/clipboard.css";

declare global {
    interface Window {
        oniformInstance: Oniform;
        clipboardInstance: Clipboard;
    }
}

const initPage = () => {
    initForm();
    const toolbar = document.getElementById("toolbar");
    if (!toolbar) {
        console.error("Toolbar element not found");
        return;
    }

    const clipboardIcon = document.createElement("img");
    clipboardIcon.src = clipboard as string;
    clipboardIcon.alt = "Toggle Clipboard";

    const clipboardButton = new ActionButton(clipboardIcon, "toggle-clipboard", ["icon"], () => {
        const clipboardElement = document.getElementById("clipboard");
        if (!clipboardElement) {
            console.error("Clipboard element not found");
            return;
        }
        clipboardElement.classList.toggle("show");
    }, true, undefined, "Copy to Clipboard");
    toolbar.appendChild(clipboardButton.button);

}

const initForm = () => {
    const form = Oniform.instance;
    form.render();
    const oniformElement = document.getElementById("oniform");
    if (!oniformElement) {
        console.error("Oniform element not found");
        return;
    }

    if(oniformElement.firstChild)
        oniformElement.replaceChild(form.html, oniformElement.firstChild)
    else
        oniformElement.appendChild(form.html);


    const clipboardElement = document.getElementById("clipboard");
    if (!clipboardElement) {
        console.error("Clipboard element not found");
        return;
    }

    const clipboard = Clipboard.instance;
    clipboard.render();

    if(clipboardElement.firstChild)
        clipboardElement.replaceChild(clipboard.html, clipboardElement.firstChild)
    else
        clipboardElement.appendChild(clipboard.html);

    window.oniformInstance = form; // Attach the instance to the window object
}

document.addEventListener("DOMContentLoaded", initPage);