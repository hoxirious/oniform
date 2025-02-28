import Station from "./station.ts";
import Terminal from "./terminal.ts";
import Group from "./group.ts";
import "../styles/link.css";
import {generateGUID} from "../common/utility.ts";

export enum Relationship {
    SIBLING = "sibling",
    DEPENDANT = "dependant"
}

export default class Link {
    private readonly _html: HTMLDivElement = document.createElement("div");

    constructor(
        private readonly _left: Station | Terminal,
        private readonly _right: Station | Group,
        private readonly _relationship: Relationship,
        private readonly _id: string = `link-${generateGUID()}`
    ) {
        this.render();
    }

    private render() {
        this._html.classList.add("link", this._relationship);
        this._html.id = this._id;

        this._html.appendChild(this._right.html);
        if (this._relationship === Relationship.DEPENDANT) {
            this._left.addLink(this);
            this._right.rerender();
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

    get id(): string {
        return this._id;
    }
}