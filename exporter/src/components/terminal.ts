import Station from "./station.ts";
import ActionButton from "./actionButton.ts";
import "../styles/terminal.css";
import plusUrl from "../static/plus.svg";
import minusUrl from "../static/minus.svg";
import copyUrl from "../static/copy.svg";
import pasteUrl from "../static/paste.svg";
import Link, {Relationship} from "./link.ts";
import Group from "./group.ts";
import Clipboard from "./clipboard.ts";
import chevronDownUrl from "../static/chevron-down.svg";
import chevronRightUrl from "../static/chevron-right.svg";
import {generateGUID, showErrorPopup} from "../common/utility.ts";
import Oniform from "./oniform.ts";

export class TerminalButtonAdd extends ActionButton {
    constructor(parent: Station, self?: Terminal) {
        const plus = createPlusIcon();
        if(!self) {
            super("New Terminal", "new-terminal", ["button"], () => {
                    parent.addEmptyTerminal();
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

        const chevronRight = document.createElement("img");
        chevronRight.src = chevronRightUrl as string;
        chevronRight.alt = "Expand All";

        super(chevronDown, "collapse-stations", ["icon"], () => {
            const links = self.html.getElementsByClassName(`link ${Relationship.DEPENDANT}`);
            for (let i = 0; i < links.length; i++) {
                links[i].classList.toggle("collapse");
            }

            if (links.length > 0 && links[0].classList.contains("collapse")) {
                this.button.replaceChild(chevronRight, this.button.firstChild!);
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

export class TerminalButtonCopy extends ActionButton {
    constructor(self: Terminal) {
        const copy = document.createElement("img");
        copy.src = copyUrl as string;
        copy.alt = "Copy";

        super(copy, "copy-terminal", ["icon"], () => {
            const previouslySelected = document.querySelector(".selected");
            if (previouslySelected) {
                previouslySelected.classList.remove("selected");
            }

            Clipboard.instance.copiedObject = self.clone();
            self.html.classList.add("selected");

            const removeSelection = (event: Event) => {
                if (event instanceof KeyboardEvent && event.key === "Escape") {
                    self.html.classList.remove("selected");
                    document.removeEventListener("keydown", removeSelection);
                }
            };

            document.addEventListener("keydown", removeSelection);
        }, true, undefined, "Copy Terminal");
    }
}

export class TerminalButtonPaste extends ActionButton {
    constructor(self: Terminal) {
        const paste = document.createElement("img");
        paste.src = pasteUrl as string;
        paste.alt = "Paste";

        super(paste, "paste-terminal", ["icon"], () => {
            self.paste();
        }, true, undefined, "Paste");
    }
}

function createActionItems(parent: Station, self: Terminal): HTMLUListElement {
    const actionItems = document.createElement("ul");
    actionItems.classList.add("action_items");

    const siblingButton = new ActionButton("New Terminal", "terminal-sibling", ["add_terminal_button"], () => {
        parent.addEmptyTerminal(self);
        parent.rerender();
    }).button;

    const dependantButton = new ActionButton("New Group", "terminal-dependant", ["add_terminal_button"], () => {
        const newGroup = new Group(self);
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
        private _label: string = `Terminal ${_prevStation.label}-1`,
        private _root: Terminal = this,
        private _value: string = "",
        private _links: Link[] = [],
        private _html: HTMLDivElement = document.createElement("div"),
        private _editable: boolean = true,
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

        this._links.forEach(link =>
        {
            link.right.rerender();
            this._html.appendChild(link.html);
        });
    }

    private createTerminalElement(): HTMLDivElement {
        const terminalElement = document.createElement("div");
        terminalElement.classList.add("terminal");

        const labelElement = this.createLabelElement();
        const inputElement = this.createInputElement();

        const buttons = document.createElement("div");
        buttons.classList.add("buttons");
        if (this._editable) {
            const deleteButton = new TerminalButtonDelete(this._prevStation, this).button;
            const collapseButton = new TerminalButtonCollapse(this).button;
            const addButton = new TerminalButtonAdd(this._prevStation, this).button;
            const copyButton = new TerminalButtonCopy(this).button;
            const pasteButton = new TerminalButtonPaste(this).button;
            buttons.appendChild(deleteButton);
            buttons.appendChild(addButton);
            buttons.appendChild(collapseButton);
            buttons.appendChild(copyButton);
            buttons.appendChild(pasteButton);
        }
        buttons.appendChild(labelElement);

        terminalElement.appendChild(buttons);
        terminalElement.appendChild(inputElement);

        return terminalElement;
    }

    private createLabelElement(): HTMLInputElement {
        const labelElement = document.createElement("input");
        labelElement.disabled = true;
        const stationLabelSplit = this._prevStation.label.split(" ");
        const stationIndex = stationLabelSplit[stationLabelSplit.length-1];
        labelElement.value = `Terminal ${stationIndex}-${this.prevStation.findTerminalIndex(this).toString()}`;
        labelElement.classList.add("terminal_label");
        return labelElement;
    }

    private createInputElement(): HTMLInputElement {
        const inputElement = document.createElement("input");
        inputElement.classList.add("terminal_input");
        inputElement.value = this._value;
        inputElement.placeholder = "Enter option here";
        inputElement.addEventListener("input", (event) => {
            this._value = (event.target as HTMLInputElement).value;
        });
        return inputElement;
    }

    public rerender() {
        this._html.innerHTML = "";
        this.render();
    }

    public clone(editable: boolean = false, dumbStation?: Station): Terminal {
        const terminalClone = new Terminal(dumbStation ?? new Station(new Group(Oniform.instance)), this._label, this._root, this._value, [], undefined, editable);
        this._links.forEach(link => link.clone(terminalClone, editable));
        return terminalClone;
    }

    public paste(): void {
        const copiedObject = Clipboard.instance.cloneCopiedObject();
        if(!copiedObject) {
            showErrorPopup("Clipboard is empty");
            return;
        }
        if(copiedObject instanceof Terminal) {
            const newTerminal = copiedObject.clone(true, this._prevStation);
            this._prevStation.addTerminalAfterReference(this, newTerminal);
        }
        else if(copiedObject instanceof Group) {
            copiedObject.parent = this;
            new Link(this, copiedObject, Relationship.DEPENDANT);
        }
        else {
            showErrorPopup("Only Group and Terminal can be pasted into Terminal.", 2000);
            return;
        }

        this.rerender();
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

    set prevStation(station: Station) {
        this._prevStation = station;
    }

    get id(): string {
        return this._id;
    }

    get links(): Link[] {
        return this._links;
    }

    deleteGroup(group: Group) {
        const linkIndex = this.links.findIndex(g => g.right.id === group.id);
        this.links[linkIndex].html.remove();
        this.links.splice(linkIndex, 1);
        this.rerender();
    }

    findGroupIndex(group: Group): number {
        const index = this.links.findIndex(g => g.right.id === group.id);
        if (index == -1) return 1;
        return (index+1);
    }

    public addLink(link: Link) {
        link.left = this;
        this._links.push(link);
        this.rerender();
        this.prevStation.groupOwner.rerender();
    }

    toJSON(): any {
        return {
            id: this._id,
            label: this._label,
            value: this._value,
            links: this._links.map(link => link.toJSON())
        }
    }
}