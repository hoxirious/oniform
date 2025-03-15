import Group from "./group.ts";
import Station from "./station.ts";
import Terminal from "./terminal.ts";
import "../styles/clipboard.css";
import {h, VNode} from "snabbdom";
import {patch} from "../common/snabbdom.setup.ts";

export default class Clipboard {
    static instance = new Clipboard();
    vnode: VNode;
    constructor(
        private _copiedObject?: Group|Station|Terminal
    )
    {
        this.vnode = h("div.clipboard_container", [
            h("h2", "Clipboard"),
            this._copiedObject ? this._copiedObject.render : null
        ]);
        this.render();
    }

    public render() {
        if(this._copiedObject) {
            this.vnode = patch(this.vnode, this._copiedObject.render());
        }
    }

    public rerender() {
        this.render();
    }

    get copiedObject(): Group|Station|Terminal|undefined {
        return this._copiedObject;
    }

    set copiedObject(copiedObject: Group|Station|Terminal) {
        this._copiedObject = copiedObject;
        this.rerender();
    }

     cloneCopiedObject(): Group|Station|Terminal|undefined {
        if(this._copiedObject) {
            return this._copiedObject.clone(true);
        }

        return undefined;
     }
}