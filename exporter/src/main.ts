import {h, VNode} from "snabbdom";
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

let isPageInitialized = false;
let vnode: VNode = h("div#oniform");
// let toolbar: VNode = h("div#toolbar");

const initPage = () => {
    if (isPageInitialized) return;
    isPageInitialized = true;
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
    }, undefined, ["icon"], "Toggle Clipboard").render();

    patch(toolbar, h("div#toolbar", clipboardButton));
}

const initForm = () => {
    let form: Oniform;
    form = Oniform.instance;

    const oniformElement = document.getElementById("oniform");
    if (!oniformElement) {
        console.error("Oniform element not found");
        return;
    }
    vnode = patch(oniformElement, form.render());
    renderView();
    window.oniformInstance = form; // Attach the instance to the window object
}

export const renderView = () => {
    const newNode = Oniform.instance.render();
    vnode = patch(vnode, newNode);
}

document.addEventListener("DOMContentLoaded", initPage, {once: true});
