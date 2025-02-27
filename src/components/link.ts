import Station from "./station.ts";
import Terminal from "./terminal.ts";
import Group from "./group.ts";
import "../styles/link.css";

export enum Relationship {
    SIBLING = "sibling",
    DEPENDANT = "dependant"
}

export default class Link {
    private readonly _html: HTMLDivElement = document.createElement("div");

    constructor(
        private readonly _left: Station | Terminal,
        private readonly _right: Station | Group,
        private readonly _relationship: Relationship
    ) {
        this.render();
    }

    private render() {
        this._html.classList.add("link", this._relationship);
        this._html.appendChild(this._right.html);
        if (this._relationship === Relationship.SIBLING) {
            this._left.root.addLink(this);
        } else if (this._relationship === Relationship.DEPENDANT) {
            this._left.addLink(this);
        }
    }

    get left(): Station | Terminal {
        return this._left;
    }

    get right(): Station | Group {
        return this._right;
    }

    get relationship(): Relationship {
        return this._relationship;
    }

    get html(): HTMLDivElement {
        return this._html;
    }
}