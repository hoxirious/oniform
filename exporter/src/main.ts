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
let sidebarVnode: VNode = h("div#sidebar");

const clipboardButton = new ActionButton("Clipboard", () => {
    const sidebarElement = document.getElementById("sidebar");
    if (!sidebarElement) {
        console.error("Clipboard element not found");
        return;
    }
    const newClipboardVnode= Clipboard.instance.render();
    const tempSidebarVnode = patch(sidebarVnode, newClipboardVnode);

    sidebarElement.classList.toggle("show");
    sidebarVnode = tempSidebarVnode;

}, undefined, ["button"], "Toggle Clipboard").render();

const reviewButton = new ActionButton("Review", () => {
    const sidebarElement = document.getElementById("sidebar");
    if (!sidebarElement) {
        console.error("Clipboard element not found");
        return;
    }
    const newReviewVnode = Review.instance.render();
    const tempSidebarVnode = patch(sidebarVnode, newReviewVnode);

    sidebarElement.classList.toggle("show");
    sidebarVnode = tempSidebarVnode;

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
    const sidebarElement = document.getElementById("sidebar");
    if (!sidebarElement) {
        console.error("Clipboard element not found");
        return;
    }
    sidebarVnode = patch(sidebarElement, h("div#sidebar", []));
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
    const newReviewVnode = Review.instance.render();
    sidebarVnode = patch(sidebarVnode, newReviewVnode);
}

export const renderReview = () => {
    const newReviewVnode = Review.instance.render();
    sidebarVnode = patch(sidebarVnode, newReviewVnode);
}

document.addEventListener("DOMContentLoaded", initPage);
