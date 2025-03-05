import Oniform from "./components/oniform.ts";
import Clipboard from "./components/clipboard.ts";

declare global {
    interface Window {
        oniformInstance: Oniform;
        clipboardInstance: Clipboard;
    }
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

document.addEventListener("DOMContentLoaded", initForm);