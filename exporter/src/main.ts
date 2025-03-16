import {h, VNode} from "snabbdom";
import { patch } from "./common/snabbdom.setup.ts";
import Oniform from "./components/oniform.ts";
import Clipboard from "./components/clipboard.ts";
import ActionButton from "./components/actionButton.ts";
import "./styles/clipboard.css";

declare global {
    interface Window {
        oniformInstance: Oniform;
        clipboardInstance: Clipboard;
    }
}

let isPageInitialized = false;
let vnode: VNode = h("div#oniform");

const initPage = () => {
    if (isPageInitialized) return;
    isPageInitialized = true;
    initForm();
    const toolbar = document.getElementById("toolbar");
    if (!toolbar) {
        console.error("Toolbar element not found");
        return;
    }

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

    const clipboardButton = new ActionButton("Clipboard", () => {
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
    }, undefined, ["button"], "Toggle Clipboard").render();

    const reviewButton = new ActionButton("Review", () => {
        console.log("Playground button clicked");
    }, undefined, ["button"], "Toggle Review").render();

    const libraryButton = new ActionButton("Library", () => {
        console.log("Library button clicked");
    }, undefined, ["button"], "Toggle Library").render();

    patch(toolbar, h("div#toolbar", [clipboardButton, reviewButton, libraryButton]));
}

const initForm = () => {
    let form: Oniform;
    // initialize empty form
    form = Oniform.instance;
    const oniformElement = document.getElementById("oniform");
    if (!oniformElement) {
        console.error("Oniform element not found");
        return;
    }
    vnode = patch(oniformElement, form.render());
    renderView();

    // initialize cache if available
    const serializedForm = localStorage.getItem("oniformInstance");
    if (serializedForm) {
        Oniform.deserialize(serializedForm);
    }
    renderView();
    const clipboard = Clipboard.instance;
    const clipboardElement = document.getElementById("clipboard");
    if (!clipboardElement) {
        console.error("Clipboard element not found");
        return;
    }
    patch(clipboardElement, h("div#clipboard", clipboard.vnode));
    window.oniformInstance = form; // Attach the instance to the window object
}

export const renderView = () => {
    const newNode = Oniform.instance.render();
    vnode = patch(vnode, newNode);
}

document.addEventListener("DOMContentLoaded", initPage);
