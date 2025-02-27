import Station from "./station.ts";
import ActionButton from "./actionButton.ts";
import "../styles/terminal.css";
import plusUrl from "../../public/plus.svg";
import Link, {Relationship} from "./link.ts";
import Group from "./group.ts";

export class TerminalButtonAdd extends ActionButton {
    constructor(parent: Station, self: Terminal) {
        const actionItems = createActionItems(parent, self);
        const plus = createPlusIcon();
        super(plus, "new-terminal", ["rounded"], () => {
            actionItems.classList.toggle("show");
        }, true, actionItems);
    }
}

function createActionItems(parent: Station, self: Terminal): HTMLUListElement {
    const actionItems = document.createElement("ul");
    actionItems.classList.add("action_items", "left");

    const siblingButton = new ActionButton("Sibling", "terminal-sibling", ["add_terminal_button"], () => {
        parent.addTerminal(new Terminal(parent));
        parent.rerender();
    }).button;

    const dependantButton = new ActionButton("Dependant", "terminal-dependant", ["add_terminal_button"], () => {
        const newGroup = new Group(`group-${parent.label}`, "New Group");
        new Link(self, newGroup, Relationship.DEPENDANT);
    }).button;

    actionItems.appendChild(createListItem(siblingButton));
    actionItems.appendChild(createListItem(dependantButton));

    return actionItems;
}

function createListItem(button: HTMLButtonElement): HTMLLIElement {
    const listItem = document.createElement("li");
    listItem.appendChild(button);
    return listItem;
}

function createPlusIcon(): HTMLImageElement {
    const plus = document.createElement("img");
    plus.src = plusUrl as string;
    plus.alt = "Plus";
    return plus;
}

export default class Terminal {
    constructor(
        private _prevStation: Station,
        private _label: string = "New Terminal",
        private _root: Terminal = this,
        private _links: Link[] = [],
        private _html: HTMLDivElement = document.createElement("div")
    ) {
        this.render();
    }

    public render() {
        this._html.innerHTML = "";
        this._html.classList.add("terminal_container");

        const terminalElement = this.createTerminalElement();
        this._html.appendChild(terminalElement);

        this._links.forEach(link => this._html.appendChild(link.html));
    }

    private createTerminalElement(): HTMLDivElement {
        const terminalElement = document.createElement("div");
        terminalElement.classList.add("terminal");

        const labelElement = this.createLabelElement();
        const inputElement = this.createInputElement();
        const addButton = new TerminalButtonAdd(this._prevStation, this).button;

        terminalElement.appendChild(labelElement);
        terminalElement.appendChild(addButton);
        terminalElement.appendChild(inputElement);

        return terminalElement;
    }

    private createLabelElement(): HTMLInputElement {
        const labelElement = document.createElement("input");
        labelElement.value = this.label;
        labelElement.classList.add("terminal_label");
        return labelElement;
    }

    private createInputElement(): HTMLInputElement {
        const inputElement = document.createElement("input");
        inputElement.classList.add("terminal_input");
        return inputElement;
    }

    public rerender() {
        this._html.innerHTML = "";
        this.render();
    }

    get label(): string {
        return this._label;
    }

    get html(): HTMLDivElement {
        return this._html;
    }

    get root(): Terminal {
        return this._root;
    }

    get prevStation(): Station {
        return this._prevStation;
    }

    public addLink(link: Link) {
        if (link.relationship === Relationship.DEPENDANT) {
            const siblingIndex = this._links.findIndex(l => l.relationship === Relationship.SIBLING);
            if (siblingIndex !== -1) {
                this._links.splice(siblingIndex, 0, link);
            } else {
                this._links.push(link);
            }
        } else {
            this._links.push(link);
        }
        this.rerender();
        this.prevStation.groupOwner.rerender();
    }
}