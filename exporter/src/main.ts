import Oniform from "./components/oniform.ts";
import Clipboard from "./components/clipboard.ts";
import clipboard from "./static/clipboard.svg";
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
    const clipboardElement = document.getElementById("clipboard");
    if (!clipboardElement) {
        console.error("Clipboard element not found");
        return;
    }
    // Check cache for clipboard status
    const clipboardStatus = localStorage.getItem("clipboardStatus");
    if (clipboardStatus === "closed") {
        clipboardElement.classList.remove("show");
    } else {
        clipboardElement.classList.add("show");
    }

    const clipboardButton = new ActionButton(clipboardIcon, "toggle-clipboard", ["icon"], () => {
        const clipboardElement = document.getElementById("clipboard");
        if (!clipboardElement) {
            console.error("Clipboard element not found");
            return;
        }
        clipboardElement.classList.toggle("show");

        // Save the status to cache
        if (clipboardElement.classList.contains("show")) {
            localStorage.setItem("clipboardStatus", "open");
        } else {
            localStorage.setItem("clipboardStatus", "closed");
        }
    }, true, undefined, "Toggle Clipboard");
    toolbar.appendChild(clipboardButton.button);
}

const initForm = () => {
    let form: Oniform;

    const serializedForm = localStorage.getItem("oniformInstance");
    if (serializedForm) {
        Oniform.deserialize(serializedForm);
        form = Oniform.instance;
        form.render();
    } else {
        form = Oniform.instance;
        form.render();

        // default form
        form.addGroup();
        form.groups[0].addEmptyStation();
        form.groups[0].stations[0].addEmptyTerminal();
    }

    const oniformElement = document.getElementById("oniform");
    if (!oniformElement) {
        console.error("Oniform element not found");
        return;
    }

    if (oniformElement.firstChild)
        oniformElement.replaceChild(form.html, oniformElement.firstChild);
    else
        oniformElement.appendChild(form.html);

    const clipboardElement = document.getElementById("clipboard");
    if (!clipboardElement) {
        console.error("Clipboard element not found");
        return;
    }

    const clipboard = Clipboard.instance;
    clipboard.render();

    if (clipboardElement.firstChild)
        clipboardElement.replaceChild(clipboard.html, clipboardElement.firstChild);
    else
        clipboardElement.appendChild(clipboard.html);

    window.oniformInstance = form; // Attach the instance to the window object
}
document.addEventListener("DOMContentLoaded", initPage);