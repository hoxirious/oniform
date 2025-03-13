import { h } from "snabbdom";
import { patch } from "./common/snabbdom.setup.ts";
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

    const clipboardIcon = h("img", { props: { src: clipboard, alt: "Toggle Clipboard" } });
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

    const clipboardButton = new ActionButton(clipboardIcon, () => {
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
    }, undefined, ["icon"], "Toggle Clipboard");
    toolbar.appendChild(clipboardButton.render().elm);
}

const initForm = () => {
    let form: Oniform;

    // const serializedForm = localStorage.getItem("oniformInstance");
    // if (serializedForm) {
    //     Oniform.deserialize(serializedForm);
    //     form = Oniform.instance;
    // } else {
    //     form = Oniform.instance;
    //
    //     // default form
    //     form.addGroup();
    //     form.groups[0].addEmptyStation();
    //     form.groups[0].stations[0].addEmptyTerminal();
    // }

    const oniformElement = document.getElementById("oniform");
    if (!oniformElement) {
        console.error("Oniform element not found");
        return;
    }

    const newVnode = h('div#oniform', [Oniform.instance.rerender()]);
    patch(oniformElement, newVnode);

    const clipboardElement = document.getElementById("clipboard");
    if (!clipboardElement) {
        console.error("Clipboard element not found");
        return;
    }

    const clipboard = Clipboard.instance;
    clipboard.render();

    const clipboardVnode = h('div#clipboard', [clipboard.html]);
    patch(clipboardElement, clipboardVnode);

    window.oniformInstance = form; // Attach the instance to the window object
}

document.addEventListener("DOMContentLoaded", initPage);
