import Station from "./station.ts";
import Terminal from "./terminal.ts";
import Group from "./group.ts";
import "../styles/link.css";

export enum Relationship {
    SIBLING = "sibling",
    DEPENDANT = "dependant"
}

export default class Link {
    constructor(
        private _left: Station,
        private _right: Station | Group,
        private _relationship: Relationship,
        private _html: HTMLDivElement = document.createElement("div")
    ) {
        this.render();
    }

    render() {
        this._html = document.createElement("div");
        this._html.classList.add("link", this._relationship);
        this._html.appendChild(this._right.html);
        if(this._relationship == Relationship.SIBLING) {
            this._left.root.addLink(this);
        }
        if(this._relationship == Relationship.DEPENDANT) {
            this._left.addLink(this);
        }
    }

    get left(): Terminal | Station | Group {
        return this._left;
    }

    get right(): Group | Station {
        return this._right;
    }

    get relationship(): Relationship {
        return this._relationship;
    }

    get html(): HTMLDivElement {
        return this._html;
}
    }
