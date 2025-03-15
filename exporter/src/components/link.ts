import Station from "./station.ts";
import Terminal from "./terminal.ts";
import Group from "./group.ts";
import "../styles/link.css";
import {generateGUID} from "../common/utility.ts";
import {h, VNode} from "snabbdom";

export enum Relationship {
    DEPENDANT = "dependant"
}

export default class Link {
    private readonly _html: HTMLDivElement = document.createElement("div");

    constructor(
        private _parent: Station | Terminal,
        private readonly _right: Group | Station,
        private readonly _relationship: Relationship,
        private readonly _editable: boolean = true,
        private readonly _rightType: string = _right.constructor.name,
        private readonly _id: string = `link-${generateGUID()}`
    ) {
        this.render();
    }

    private render():VNode {
        this.parent.addLink(this);
        return h(`div.link.${this.relationship}`, { props: { id: this.id }, key: this._id }, [this.right.render()]);
    }

    rerender() {
        return h(`div.link.${this.relationship}`, { props: { id: this.id }, key: this._id }, [this.right.render()]);
    }

    clone(leftClone: Station|Terminal, editable: boolean = false): Link {
        const rightClone = this._right.clone(editable, leftClone);
        return new Link(leftClone, rightClone, this._relationship, editable);
    }


    get parent(): Station | Terminal {
        return this._parent;
    }

    set parent(parent: Station | Terminal) {
        this._parent = parent;
    }

    get right(): Station | Group {
        return this._right;
    }

    get rightType(): string {
        return this._rightType;
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

    toObj() {
        const {right, relationship, rightType, id} = this;
        return {
            id,
            relationship,
            rightType,
            right: right.toObj()
        }
    }

    static from (obj: any, parent: Station | Terminal): Link {
        const {right, relationship, rightType, id} = obj;
        if(rightType === "Group") {
            return new Link(parent, Group.from(right, parent), relationship, true, "Group", id);
        }
        else {
            return new Link(parent, Station.from(right, parent), relationship, true, "Station", id);
        }
    }
}
