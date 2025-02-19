import Connector from "./connector.ts";
import ActionButton from "./actionButton.ts";

export class TerminalButtonAdd extends ActionButton {
    private newTerminalActionItems: HTMLUListElement;

    constructor() {
        super("New Terminal", "new-terminal", ["button"], () => {});
        this.newTerminalActionItems = document.createElement("ul");
        this.addButton("Sibling", "terminal-sibling");
        this.addButton("Children", "terminal-children");
        this.addButton("Dependant", "terminal-dependant");
    }

    private addButton(label: string, id: string): void {
        const item = document.createElement("li");
        item.appendChild(new ActionButton(label, id, ["add_terminal_button"],() => {}).button);
        this.newTerminalActionItems.appendChild(item);
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
