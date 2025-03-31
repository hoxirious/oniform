import {Library} from "./components/library";
import Clipboard from "./components/clipboard";
import {h, VNode} from "snabbdom";
import ActionButton from "./components/actionButton";
import {patch} from "./common/snabbdom.setup";
import {Preview} from "./components/preview";
import Oniform from "./components/oniform";
import Tree from "./components/tree";

declare global {
    interface Window {
        oniformInstance: Oniform;
        clipboardInstance: Clipboard;
    }
}
let isPageInitialized = false;
let vnode: VNode = h("form#oniform.oniform");
let reviewWindowVnode: VNode = h("div#preview-window");
let clipboardWindowVnode: VNode = h("div#clipboard-window");
let libraryWindowVnode: VNode = h("div#library-window");
let toolbarVnode: VNode = h("div#toolbar");

const initToolbar = () => {
    const clipboardButton = new ActionButton("Clipboard", () => {
        const reviewElement = document.getElementById("preview-window");
        const clipboardElement = document.getElementById("clipboard-window");
        const libraryElement = document.getElementById("library-window");
        if (!reviewElement || !clipboardElement || !libraryElement) {
            console.error("Clipboard element not found");
            return;
        }
        const newClipboardVnode = Clipboard.instance.render();
        const tempVnode = patch(clipboardWindowVnode, newClipboardVnode);
        clipboardElement.classList.toggle("show");

        if (reviewElement.classList.contains("show"))
            reviewElement.classList.remove("show");
        if (libraryElement.classList.contains("show"))
            libraryElement.classList.remove("show");
        clipboardWindowVnode = tempVnode;

    }, undefined, ["button"], "Toggle Clipboard").render();

    const reviewButton = new ActionButton("Preview", () => {
        const reviewElement = document.getElementById("preview-window");
        const clipboardElement = document.getElementById("clipboard-window");
        const libraryElement = document.getElementById("library-window");
        if (!reviewElement || !clipboardElement || !libraryElement) {
            console.error("Clipboard element not found");
            return;
        }
        const newReviewVnode = Preview.instance.render();
        const tempVnode = patch(reviewWindowVnode, newReviewVnode);

        reviewElement.classList.toggle("show");
        if (clipboardElement.classList.contains("show"))
            clipboardElement.classList.remove("show");
        if (libraryElement.classList.contains("show"))
            libraryElement.classList.remove("show");
        reviewWindowVnode = tempVnode;

    }, undefined, ["button"], "Toggle Preview").render();

    const libraryButton = new ActionButton("Library", () => {
        const reviewElement = document.getElementById("preview-window");
        const clipboardElement = document.getElementById("clipboard-window");
        const libraryElement = document.getElementById("library-window");
        if (!reviewElement || !clipboardElement || !libraryElement) {
            console.error("Clipboard element not found");
            return;
        }
        const newLibraryVnode = Library.instance.render();
        const tempVnode = patch(libraryWindowVnode, newLibraryVnode);

        libraryElement.classList.toggle("show");
        if (clipboardElement.classList.contains("show"))
            clipboardElement.classList.remove("show");
        if (reviewElement.classList.contains("show"))
            reviewElement.classList.remove("show");
        libraryWindowVnode = tempVnode;
    }, undefined, ["button"], "Toggle Library").render();

    return [clipboardButton, reviewButton, libraryButton];
}

const initPage = () => {
    if (isPageInitialized) return;
    isPageInitialized = true;
    const toolbar = document.getElementById("toolbar");
    if (!toolbar) {
        console.error("Toolbar element not found");
        return;
    }
    Tree.instance = new Tree(Oniform.instance.groups);
    toolbarVnode = patch(toolbar, h("div#toolbar", [...initToolbar(), Tree.instance.render()]));
    initForm();
}

const initForm = () => {
    const clipboardElement = document.getElementById("clipboard-window");
    if (!clipboardElement) {
        console.error("Clipboard element not found");
        return;
    }
    clipboardWindowVnode = patch(clipboardElement, h("div#clipboard-window", []));

    const reviewElement = document.getElementById("preview-window");
    if (!reviewElement) {
        console.error("Preview element not found");
        return;
    }
    reviewWindowVnode = patch(reviewElement, h("div#preview-window", []));

    const libraryElement = document.getElementById("library-window");
    if (!libraryElement) {
        console.error("Library element not found");
        return;
    }
    libraryWindowVnode = patch(libraryElement, h("div#library-window", []));

    let form: Oniform;
    // initialize empty form
    const serializedForm = localStorage.getItem("oniformInstance");
    if (serializedForm) {
        Oniform.instance = Oniform.deserialize(serializedForm);
    }
    form = Oniform.instance;
    const oniformElement = document.getElementById("oniform");

    if (!oniformElement) {
        console.error("Oniform element not found");
        return;
    }
    vnode = patch(oniformElement, h(`form#oniform.oniform`, []));
    window.oniformInstance = form; // Attach the instance to the window object
    renderView();
}

export const renderView = () => {
    const newNode = Oniform.instance.render();
    vnode = patch(vnode, newNode);

    Preview.instance = new Preview(Oniform.instance.groups);
    renderReview();
    renderClipboard();
    renderLibrary();
    renderToolbar();
}

export const renderReview = () => {
    const newReviewVnode = Preview.instance.render();
    reviewWindowVnode = patch(reviewWindowVnode, newReviewVnode);
}

export const renderClipboard = () => {
    const newClipboardVnode = Clipboard.instance.render();
    clipboardWindowVnode = patch(clipboardWindowVnode, newClipboardVnode);
}

export const renderLibrary = () => {
    const newLibraryVnode = Library.instance.render();
    libraryWindowVnode = patch(libraryWindowVnode, newLibraryVnode);
}

export const renderToolbar = () => {
    Tree.instance = new Tree(Oniform.instance.groups);
    toolbarVnode = patch(toolbarVnode, h("div#toolbar", [...initToolbar(), Tree.instance.render()]));
}

document.addEventListener("DOMContentLoaded", initPage);
