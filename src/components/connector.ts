import Group from "./group.ts";
import Terminal from "./terminal.ts";
import ActionButton, {SubActionButton} from "./actionButton.ts";
import "../styles/connector.css";
import plusUrl from "../../public/plus.svg";
import arrowRightUrl from "../../public/arrow-right.svg";

type Relationship = "dependant" | "children" | "sibling";

export class ConnectorButtonAdd extends ActionButton {
    constructor() {
        const plus = document.createElement("img");
        plus.src = plusUrl as string;
        plus.alt = "Plus";
        super(plus, "new-connector", ["success", "rounded"], () => {});
    }
}

function createSubActionItems(): HTMLUListElement {
    const subActionItems = document.createElement("ul");
    subActionItems.classList.add("sub_action_items");
    subActionItems.appendChild(document.createElement("li").appendChild(new ActionButton("New Terminal", "new-terminal", ["new-terminal"], () => {}).button));
    subActionItems.appendChild(document.createElement("li").appendChild(new ActionButton("New Group", "new-group", ["new-group"], () => {}).button));
    return subActionItems;
}

export class ConnectorButtonNext extends ActionButton {
    constructor() {
        const actionItems = document.createElement("ul");
        actionItems.classList.add("action_items");

        actionItems.appendChild(document.createElement("li").appendChild(new SubActionButton("Sibling", "connector-sibling", ["add_connector_button"], createSubActionItems()).button));
        actionItems.appendChild(document.createElement("li").appendChild(new SubActionButton("Children", "connector-children", ["add_connector_button"], createSubActionItems()).button));
        actionItems.appendChild(document.createElement("li").appendChild(new SubActionButton("Dependant", "connector-dependant", ["add_connector_button"], createSubActionItems()).button));

        const arrowRight = document.createElement("img");
        arrowRight.src = arrowRightUrl as string;
        arrowRight.alt = "Arrow Right";

        super(arrowRight, "next-connector", ["rounded"], () => {
            actionItems.classList.toggle("show");
        }, true, actionItems);
    }
}

export default class Connector {
    constructor(
        private _label: string,
        private _prevTerminal: Terminal,
        private _relationship?: Relationship,
        private _nextGroup: Group[] = [],
        private _html: HTMLDivElement = document.createElement("div")
    ) {
        this._html.classList.add("connector");
        const inputElement = document.createElement("input");
        inputElement.value = this.label;
        inputElement.classList.add("connector_input");

        this._html.appendChild(new ConnectorButtonAdd().button);
        this._html.appendChild(inputElement);
        this._html.appendChild(new ConnectorButtonNext().button);
    }

    get label(): string {
        return this._label;
    }

    get html(): HTMLDivElement {
        return this._html;
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
