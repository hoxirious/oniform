import Group from "./group.ts";
import Terminal from "./terminal.ts";

type Relationship = "dependant" | "children" | "sibling";

export default class Connector {
    constructor(
        private _label: string,
        private _relationship: Relationship,
        private _nextGroup: Group[],
        private _prevTerminal: Terminal
    ) {}

    get label(): string {
        return this._label;
    }

    get relationship(): Relationship {
        return this._relationship;
    }

    get nextGroup(): Group[] {
        return this._nextGroup;
    }

    get prevTerminal(): Terminal {
        return this._prevTerminal;
    }

    public addGroup(group: Group) {
        this.nextGroup.push(group);
    }
}
