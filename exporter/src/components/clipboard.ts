import Group from "./group.ts";
import Station from "./station.ts";
import Terminal from "./terminal.ts";

export default class Clipboard {
    static instance = new Clipboard();
    constructor(
        private _html = document.createElement("div"),
        private _copiedObject?: Group|Station|Terminal
    )
    {
        this.render();
    }

    public render() {
        this._html.innerHTML = "";
        this._html.classList.add("clipboard_container");
        this._html.id = "clipboard";
        if(this._copiedObject)
            this._html.appendChild(this._copiedObject.html);
    }

    public rerender() {
        this.render();
    }

    get html(): HTMLDivElement {
        return this._html;
    }

    set copiedObject(copiedObject: Group|Station|Terminal) {
        this._copiedObject = copiedObject;
        this.rerender();
    }
}