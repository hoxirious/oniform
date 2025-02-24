import Connector from "./connector.ts";
import ActionButton from "./actionButton.ts";

class SubActionButton extends ActionButton {

    constructor(_label: string, _id: string, _classes: string[]) {
        super(_label, _id, _classes, undefined, false);
        const subActionItems = document.createElement("ul");
        subActionItems.classList.add("sub_action_items");
        subActionItems.appendChild(document.createElement("li").appendChild(new ActionButton("New Group", "new-group", ["new-group"], () => {}).button));
        subActionItems.appendChild(document.createElement("li").appendChild(new ActionButton("New Terminal", "new-terminal", ["new-terminal"], () => {}).button));
        this.actionItems = subActionItems;
    }

}

export class TerminalButtonAdd extends ActionButton {

    constructor() {
        const actionItems = document.createElement("ul");
        actionItems.classList.add("action_items");
        actionItems.appendChild(document.createElement("li").appendChild(new SubActionButton("Sibling", "terminal-sibling", ["add_terminal_button"]).button));
        actionItems.appendChild(document.createElement("li").appendChild(new SubActionButton("Children", "terminal-children", ["add_terminal_button"]).button));
        actionItems.appendChild(document.createElement("li").appendChild(new SubActionButton("Dependant", "terminal-dependant", ["add_terminal_button"]).button));
        super("New Terminal", "new-terminal", ["button"], () => {
            actionItems.classList.toggle("show");
        }, true, actionItems);
    }
}

export default class Terminal {
    public constructor(
        private _label: string,
        private _nextConnectors: Connector[] = [],
    ) {}

    get label(): string {
        return this._label;
    }

    get nextConnectors(): Connector[] {
        return this._nextConnectors;
    }

    addConnector(connector: Connector) {
        this.nextConnectors.push(connector);
    }
}