import Terminal, {TerminalButtonAdd} from "./terminal.ts";
import ActionButton from "./actionButton.ts";
import "../styles/station.css";
import plusUrl from "../static/plus.svg";
import minusUrl from "../static/minus.svg";
import chevronDownUrl from "../static/chevron-down.svg";
import chevronRightUrl from "../static/chevron-right.svg";
import copyUrl from "../static/copy.svg";
import pasteUrl from "../static/paste.svg";
import Group from "./group.ts";
import Clipboard from "./clipboard.ts";
import Link, {Relationship} from "./link.ts";
import {generateGUID} from "../common/utility.ts";
import Oniform from "./oniform.ts";

export class StationButtonAdd extends ActionButton {
    constructor(group: Group, self?: Station) {
        const plus = document.createElement("img");
        plus.src = plusUrl as string;
        plus.alt = "Plus";

        if (!self) {
            super("New Station", "new-station", ["button"], () => {
                group.addEmptyStation();
            }, true, undefined, "New Station");
        }
        else {
            const actionItems = document.createElement("ul");
            actionItems.classList.add("action_items");

            const siblingButton = new ActionButton("Sibling", "station-sibling", ["add_station_button"], () => {
                group.addEmptyStation(self);
            }, true, undefined, "New Station").button;
            const dependantButton = new ActionButton("Dependant", "station-dependant", ["add_station_button"], () => {
                const newGroup = new Group(self);
                new Link(self, newGroup, Relationship.DEPENDANT);
            }, true, undefined, "New Dependant Group").button;

            actionItems.appendChild(createListItem(siblingButton));
            actionItems.appendChild(createListItem(dependantButton));


            super(plus, "new-station", ["icon"], () => {
                actionItems.classList.toggle("show");
            }, true, actionItems, "New Station");
        }
    }
}

export class StationButtonCollapse extends ActionButton {
    constructor(self: Station) {
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

            const terminals = self.html.getElementsByClassName("terminals");
            terminals[0].classList.toggle("collapse");

            if ((terminals.length > 0 && terminals[0].classList.contains("collapse")) ||
                (links.length > 0 && links[0].classList.contains("collapse"))) {
                this.button.replaceChild(chevronRight, this.button.firstChild!);
            }
            else {
                this.button.replaceChild(chevronDown, this.button.firstChild!);
            }
        }, true, undefined, "Collapse Dependants");
    }
}

export class StationButtonDelete extends ActionButton {
    constructor(self: Station) {
        const minus = document.createElement("img");
        minus.src = minusUrl as string;
        minus.alt = "Delete";

        super(minus, "delete-station", ["icon"], () => {
            if(self.html.parentElement && self.html.parentElement.classList.contains("link")) {
                const toDeleteLinkIndex = self.root.links.findIndex(link => link.id === self.html.parentElement?.id);
                if(toDeleteLinkIndex !== -1) {
                    self.root.links[toDeleteLinkIndex].html.remove();
                    self.root.links.splice(toDeleteLinkIndex, 1);
                    self.root.groupOwner.rerender();
                }
            }
            else {
                self.html.remove();
                self.groupOwner.deleteStation(self);
            }
        }, true, undefined, "Delete Station");
    }
}

export class StationButtonCopy extends ActionButton {
    constructor(self: Station) {
        const copy = document.createElement("img");
        copy.src = copyUrl as string;
        copy.alt = "Copy";

        super(copy, "copy-station", ["icon"], () => {
            Clipboard.instance.copiedObject = self.clone();
        }, true, undefined, "Copy Station");
    }
}

export class StationButtonPaste extends ActionButton {
    constructor(self: Station) {
        const paste = document.createElement("img");
        paste.src = pasteUrl as string;
        paste.alt = "Paste";

        super(paste, "paste-station", ["icon"], () => {
            self.paste();
        }, true, undefined, "Paste Station");
    }
}


function createListItem(button: HTMLButtonElement): HTMLLIElement {
    const listItem = document.createElement("li");
    listItem.appendChild(button);
    return listItem;
}

export default class Station {
    constructor(
        private _groupOwner: Group,
        private _root: Station = this,
        private _value: string = "",
        private _label: string = "",
        private _nextTerminals: Terminal[] = [],
        private _links: Link[] = [],
        private _html: HTMLDivElement = document.createElement("div"),
        private _editable: boolean = true,
        private _id: string = `station-${generateGUID()}`
    ) {
        this.render();
    }

    render() {
        this._html.innerHTML = "";
        this._html.classList.add("station_container");
        this._html.id = this._id;

        const station = document.createElement("div");
        station.classList.add("station");

        const labelElement = document.createElement("input");
        labelElement.disabled = true;
        const stationIndex = this.groupOwner.findStationIndex(this).toString();
        if(!this._label || this._label != `Station ${stationIndex}`)
            this._label = `Station ${stationIndex}`;
        labelElement.value = this._label;
        labelElement.classList.add("station_label");

        labelElement.addEventListener("input", (event) => {
            this._label = (event.target as HTMLInputElement).value;
        });

        // Buttons
        const buttons = document.createElement("div");
        buttons.classList.add("buttons");
        const buttonCollapse = new StationButtonCollapse(this).button;
        const buttonAdd = new StationButtonAdd(this._groupOwner, this).button;
        const buttonDelete = new StationButtonDelete(this).button;
        const buttonCopy = new StationButtonCopy(this).button;
        const buttonPaste = new StationButtonPaste(this).button;
        if(this._editable) {
            buttons.appendChild(buttonDelete);
            buttons.appendChild(buttonAdd);
            buttons.appendChild(buttonCollapse);
            buttons.appendChild(buttonCopy);
            buttons.appendChild(buttonPaste);
        }
            buttons.appendChild(labelElement);
        station.appendChild(buttons);

        const textareaElement = document.createElement("textarea");
        textareaElement.classList.add("station_textarea");
        textareaElement.value = this._value;
        textareaElement.addEventListener("input", (event) => {
            this._value = (event.target as HTMLTextAreaElement).value;
        });

        station.appendChild(textareaElement);

        this._html.appendChild(station);
        if(this._nextTerminals.length == 0)
        {
            const terminalElement = document.createElement("div");
            terminalElement.classList.add("terminal");
            terminalElement.appendChild(new TerminalButtonAdd(this).button);
            if(this._editable) {
                this._html.appendChild(terminalElement);
            }
        }
        else  {
            const terminals = document.createElement("div");
            terminals.classList.add("terminals");
            this._nextTerminals.forEach(terminal =>
            {
                terminal.rerender();
                terminals.appendChild(terminal.html);
            }
            );
            this._html.appendChild(terminals);
        }
        this._links.forEach(link => this._html.appendChild(link.html));
    }

    rerender() {
        this.render();
    }

    clone(editable: boolean = false): Station {
        const dumbGroupOwner = new Group(Oniform.instance);
        const stationClone = new Station(
            dumbGroupOwner,
            this._root, this._value, this._label,
            [], [], undefined, editable);

        this._nextTerminals.map(terminal => terminal.clone(editable, stationClone)).forEach(terminal => stationClone.addExistingTerminal(terminal));
        this._links.map(link => link.clone(stationClone, editable))
        return stationClone;
    }

    paste(): void {
        const copiedObject = Clipboard.instance.cloneCopiedObject();
        if(!copiedObject) {
            console.log("Nothing to paste");
            return;
        }

        if(copiedObject instanceof Station) {
            this.groupOwner.addStationAfterReference(this, copiedObject);
        }
        else if (copiedObject instanceof Group) {
            new Link(this, copiedObject, Relationship.DEPENDANT);
        }
        else {
            this.addExistingTerminal(copiedObject);
        }

        this.rerender();
    }

    get root(): Station {
        return this._root;
    }

    get label() {
        return this._label;
    }

    get html(): HTMLDivElement {
        return this._html;
    }

    get id(): string {
        return this._id;
    }

    get nextTerminals(): Terminal[] {
        return this._nextTerminals;
    }

    set nextTerminals(terminals: Terminal[]) {
        this._nextTerminals = terminals;
    }

    get groupOwner(): Group {
        return this._groupOwner;
    }

    get links(): Link[] {
        return this._links;
    }

    addEmptyTerminal(prevTerminal?: Terminal) {
        if(prevTerminal) {
            const terminalIndex = this.findTerminalIndex(prevTerminal);
            const terminal = new Terminal(this);
            this.nextTerminals.splice(terminalIndex, 0, terminal);
        }
        else {
            this.nextTerminals.push(new Terminal(this));
        }
        this.rerender();
    }

    addExistingTerminal(terminal: Terminal) {
        terminal.prevStation = this;
        this._nextTerminals.push(terminal);
        this.rerender();
    }

    deleteTerminal(terminal: Terminal) {
        const terminalIndex = this.findTerminalIndex(terminal)-1;
        this._nextTerminals.splice(terminalIndex, 1);
        this.rerender();
    }

    findTerminalIndex(terminal: Terminal): number {
        const terminalIndex = this._nextTerminals.findIndex(t => t.id === terminal.id);
        if (terminalIndex === -1) return 1;
        return (terminalIndex + 1);
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

    addLink(link: Link) {
        const linkIndex = this._links.findIndex(l => l.relationship === Relationship.DEPENDANT);
        this._links.splice(linkIndex, 0, link);
        this.rerender();
    }

    set groupOwner(group: Group) {
        this._groupOwner = group;
    }

    toJSON(): any {
        return {
            id: this._id,
            label: this._label,
            value: this._value,
            terminals: this._nextTerminals.map(terminal => terminal.toJSON()),
            links: this._links.map(link => link.toJSON())
        };
    }
}