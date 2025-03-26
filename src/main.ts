import {h, VNode} from "snabbdom";
import {patch} from "./common/snabbdom.setup.ts";
import Oniform from "./components/oniform.ts";
import Clipboard from "./components/clipboard.ts";
import ActionButton from "./components/actionButton.ts";
import "./styles/clipboard.css";
import {Review} from "./components/review.ts";

declare global {
    interface Window {
        oniformInstance: Oniform;
        clipboardInstance: Clipboard;
    }
}

let isPageInitialized = false;
let vnode: VNode = h("div#oniform");
let reviewWindowVnode: VNode = h("div#review-window");
let clipboardWindowVnode: VNode = h("div#clipboard-window");

const clipboardButton = new ActionButton("Clipboard", () => {
    const reviewElement = document.getElementById("review-window");
    const clipboardElement = document.getElementById("clipboard-window");
    if (!clipboardElement || !reviewElement) {
        console.error("Clipboard element not found");
        return;
    }
    const newClipboardVnode= Clipboard.instance.render();
    const tempVnode = patch(clipboardWindowVnode, newClipboardVnode);
    clipboardElement.classList.toggle("show");

    if(reviewElement.classList.contains("show"))
        reviewElement.classList.remove("show");
    clipboardWindowVnode = tempVnode;

}, undefined, ["button"], "Toggle Clipboard").render();

const reviewButton = new ActionButton("Review", () => {
    const reviewElement = document.getElementById("review-window");
    const clipboardElement = document.getElementById("clipboard-window");
    if (!reviewElement || !clipboardElement) {
        console.error("Clipboard element not found");
        return;
    }
    const newReviewVnode = Review.instance.render();
    const tempVnode = patch(reviewWindowVnode, newReviewVnode);

    reviewElement.classList.toggle("show");
    if(clipboardElement.classList.contains("show"))
        clipboardElement.classList.remove("show");
    reviewWindowVnode = tempVnode;

}, undefined, ["button"], "Toggle Review").render();

const libraryButton = new ActionButton("Library", () => {
    console.log("Library button clicked");
}, undefined, ["button"], "Toggle Library").render();
const initPage = () => {
    if (isPageInitialized) return;
    isPageInitialized = true;
    initForm();
    const toolbar = document.getElementById("toolbar");
    if (!toolbar) {
        console.error("Toolbar element not found");
        return;
    }
    patch(toolbar, h("div#toolbar", [clipboardButton, reviewButton, libraryButton]));
}

const initForm = () => {
    const clipboardElement = document.getElementById("clipboard-window");
    if (!clipboardElement) {
        console.error("Clipboard element not found");
        return;
    }
    clipboardWindowVnode = patch(clipboardElement, h("div#clipboard-window", []));
    const reviewElement = document.getElementById("review-window");
    if (!reviewElement) {
        console.error("Review element not found");
        return;
    }
    reviewWindowVnode = patch(reviewElement, h("div#review-window", []));
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
    window.oniformInstance = form; // Attach the instance to the window object
}

export const renderView = () => {
    const newNode = Oniform.instance.render();
    vnode = patch(vnode, newNode);

    Review.instance = new Review(Oniform.instance.groups);
    renderReview();
    renderClipboard();
}

export const renderReview = () => {
    const newReviewVnode = Review.instance.render();
    reviewWindowVnode = patch(reviewWindowVnode, newReviewVnode);
}

export const renderClipboard = () => {
    const newClipboardVnode = Clipboard.instance.render();
    clipboardWindowVnode = patch(clipboardWindowVnode, newClipboardVnode);
}

document.addEventListener("DOMContentLoaded", initPage);
