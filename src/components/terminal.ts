import Connector from "./connector.ts";
import ActionButton from "./actionButton.ts";
import "../styles/terminal.css";

import plusUrl from "../../public/plus.svg";

export class TerminalButtonAdd extends ActionButton {
    constructor() {
        const actionItems = document.createElement("ul");
        actionItems.classList.add("action_items");
        actionItems.appendChild(document.createElement("li").appendChild(new ActionButton("Sibling", "terminal-sibling", ["add_terminal_button"]).button));
        actionItems.appendChild(document.createElement("li").appendChild(new ActionButton("Dependant", "terminal-dependant", ["add_terminal_button"]).button));

        const plus = document.createElement("img");
        plus.src = plusUrl as string;
        plus.alt = "Plus";

        super(plus, "new-terminal", ["rounded"], () => {
            actionItems.classList.toggle("show");
        }, true, actionItems);
    }
}

export default class Terminal {
    public constructor(
        private _label: string = "",
        private _nextConnectors: Connector[] = [new Connector("", this)],
        private _html: HTMLDivElement = document.createElement("div")
    ) {
        const terminal = document.createElement("div");
        terminal.classList.add("terminal");
        terminal.appendChild(new TerminalButtonAdd().button);
        const textareaElement = document.createElement("textarea");
        textareaElement.classList.add("terminal_textarea");
        textareaElement.setAttribute("value", this.label);

        terminal.appendChild(textareaElement);


        const connectors = document.createElement("div");
        connectors.classList.add("connectors");
        this.nextConnectors.forEach(connector => connectors.appendChild(connector.html));
        this._html.classList.add("container");

        this._html.appendChild(terminal);
        this._html.appendChild(connectors);
    }

    get label(): string {
        return this._label;
    }

    get html(): HTMLDivElement {
        return this._html;
    }

    get nextConnectors(): Connector[] {
        return this._nextConnectors;
    }

    addConnector(connector: Connector) {
        this.nextConnectors.push(connector);
    }
}