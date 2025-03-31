import Group from "./group";
import Station from "./station";
import Terminal from "./terminal";
import "../styles/clipboard.css";
import { h } from "snabbdom";
import { renderClipboard } from "../main";
const copyUrl = "/copy.svg";
const pasteUrl = "/paste.svg";


export default class Clipboard {
    static instance = new Clipboard();
    private constructor(
        private _copiedObject?: Group | Station | Terminal
    ) {}

    render() {
        return h("div#clipboard-window", { key: "clipboard" }, [
            h("div.clipboard_container", [
                h("h2", "Clipboard"),
                h("p", ["> Use the ", h("img", { props: { src: copyUrl, alt: "Copy" } }), " button to copy a group, question, or option to this clipboard."]),
                h("p", ["> Then use the ", h("img", { props: { src: pasteUrl, alt: "Paste" } }), " button to paste the current copied object."]),
                this._copiedObject ? h("div.copy_object", this._copiedObject.render()) : h("div.copy_object", h("h3", "Clipboard is empty"))
            ])
        ]);
    }

    get copiedObject(): Group | Station | Terminal | undefined {
        return this._copiedObject;
    }

    set copiedObject(copiedObject: Group | Station | Terminal) {
        this._copiedObject = copiedObject;
        renderClipboard();
    }

    cloneCopiedObject(): Group | Station | Terminal | undefined {
        if (this._copiedObject) {
            return this._copiedObject.clone(true);
        }
        return undefined;
    }
}