import Group from "./group.ts";
import Station from "./station.ts";
import Terminal from "./terminal.ts";
import "../styles/clipboard.css";
import {h} from "snabbdom";
import {renderClipboard} from "../main.ts";

export default class Clipboard {
    static instance = new Clipboard();
    constructor(
        private _copiedObject?: Group|Station|Terminal
    )
    {}

    render() {
        return h("div#clipboard-window", {key: "clipboard"}, [
            h("div.clipboard_container", [
                h("h2", "Clipboard"),
                this._copiedObject ? this._copiedObject.render() : null
            ])
        ]);
    }

    get copiedObject(): Group|Station|Terminal|undefined {
        return this._copiedObject;
    }

    set copiedObject(copiedObject: Group|Station|Terminal) {
        this._copiedObject = copiedObject;
        renderClipboard();
    }

     cloneCopiedObject(): Group|Station|Terminal|undefined {
        if(this._copiedObject) {
            return this._copiedObject.clone(true);
        }
        return undefined;
     }
}