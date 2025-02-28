import Station from "./station.ts";
import ActionButton from "./actionButton.ts";
import "../styles/terminal.css";
import plusUrl from "../../public/plus.svg";
import minusUrl from "../../public/minus.svg";
import Link, {Relationship} from "./link.ts";
import Group from "./group.ts";
import chevronDownUrl from "../../public/chevron-down.svg";
import chevronUpUrl from "../../public/chevron-up.svg";
import {generateGUID} from "../common/utility.ts";

export class TerminalButtonAdd extends ActionButton {
    constructor(parent: Station, self?: Terminal) {
        const plus = createPlusIcon();
        if(!self) {
            super("New Terminal", "new-terminal", ["button"], () => {
                    parent.addTerminal(new Terminal(parent));
                    parent.rerender();
                },
                true,
                undefined,
                "New Terminal"
            );
        }
        else
        {
            const actionItems = createActionItems(parent, self);
            super(plus, "new-terminal", ["icon"], () => {
                actionItems.classList.toggle("show");
            }, true, actionItems, "New Terminal");
        }
    }
}

export class TerminalButtonCollapse extends ActionButton {
    constructor(self: Terminal) {
        const chevronDown = document.createElement("img");
        chevronDown.src = chevronDownUrl as string;
        chevronDown.alt = "Collapse All";

        const chevronUp = document.createElement("img");
        chevronUp.src = chevronUpUrl as string;
        chevronUp.alt = "Expand All";

        super(chevronDown, "collapse-stations", ["icon"], () => {
            const links = self.html.getElementsByClassName(`link ${Relationship.DEPENDANT}`);
            for (let i = 0; i < links.length; i++) {
                links[i].classList.toggle("collapse");
            }

            if (links.length > 0 && links[0].classList.contains("collapse")) {
                this.button.replaceChild(chevronUp, this.button.firstChild!);
            }
            else {
                this.button.replaceChild(chevronDown, this.button.firstChild!);
            }
        }, true, undefined, "Collapse Dependants");
    }
}

export class TerminalButtonDelete extends ActionButton {
    constructor(parent: Station, self: Terminal) {
        const minus = document.createElement("img");
        minus.src = minusUrl as string;
        minus.alt = "Delete";

        super(minus, "delete-terminal", ["icon"], () => {
            parent.deleteTerminal(self);
        }, true, undefined, "Delete Terminal");
    }
}

function createActionItems(parent: Station, self: Terminal): HTMLUListElement {
    const actionItems = document.createElement("ul");
    actionItems.classList.add("action_items");

    const siblingButton = new ActionButton("Sibling", "terminal-sibling", ["add_terminal_button"], () => {
        parent.addTerminal(new Terminal(parent));
        parent.rerender();
    }).button;

    const dependantButton = new ActionButton("Dependant", "terminal-dependant", ["add_terminal_button"], () => {
        const newGroup = new Group("New Group");
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
        private _html: HTMLDivElement = document.createElement("div"),
        private _id: string = `terminal-${generateGUID()}`
    ) {
        this.render();
    }

    public render() {
        this._html.innerHTML = "";
        this._html.classList.add("terminal_container");
        this._html.id = this._id;

        const terminalElement = this.createTerminalElement();
        this._html.appendChild(terminalElement);

        this._links.forEach(link => this._html.appendChild(link.html));
    }

    private createTerminalElement(): HTMLDivElement {
        const terminalElement = document.createElement("div");
        terminalElement.classList.add("terminal");

        const labelElement = this.createLabelElement();
        const inputElement = this.createInputElement();

        const buttons = document.createElement("div");
        buttons.classList.add("buttons");
        const deleteButton = new TerminalButtonDelete(this._prevStation, this).button;
        const collapseButton = new TerminalButtonCollapse(this).button;
        const addButton = new TerminalButtonAdd(this._prevStation, this).button;
        buttons.appendChild(deleteButton);
        buttons.appendChild(addButton);
        buttons.appendChild(collapseButton);

        terminalElement.appendChild(labelElement);
        terminalElement.appendChild(buttons);
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

    get id(): string {
        return this._id;
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