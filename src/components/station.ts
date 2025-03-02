import Terminal, {TerminalButtonAdd} from "./terminal.ts";
import ActionButton from "./actionButton.ts";
import "../styles/station.css";
import plusUrl from "../../public/plus.svg";
import chevronDownUrl from "../../public/chevron-down.svg";
import chevronRightUrl from "../../public/chevron-right.svg";
import minusUrl from "../../public/minus.svg";
import Group from "./group.ts";
import Link, {Relationship} from "./link.ts";
import {generateGUID} from "../common/utility.ts";

export class StationButtonAdd extends ActionButton {
    constructor(group: Group, self?: Station) {
        const plus = document.createElement("img");
        plus.src = plusUrl as string;
        plus.alt = "Plus";

        if (!self) {
            super("New Station", "new-station", ["button"], () => {
                group.addStation();
            }, true, undefined, "New Station");
        }
        else {
            const actionItems = document.createElement("ul");
            actionItems.classList.add("action_items");

            const siblingButton = new ActionButton("Sibling", "station-sibling", ["add_station_button"], () => {
                group.addStation(self);
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
        private _label?: string,
        private _nextTerminals: Terminal[] = [],
        private _links: Link[] = [],
        private _html: HTMLDivElement = document.createElement("div"),
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
        buttons.appendChild(buttonDelete);
        buttons.appendChild(buttonAdd);
        buttons.appendChild(buttonCollapse);
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
            this._html.appendChild(terminalElement);
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

    get groupOwner(): Group {
        return this._groupOwner;
    }

    get links(): Link[] {
        return this._links;
    }

    addTerminal(prevTerminal?: Terminal) {
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
        const siblingIndex = this._links.findIndex(l => l.relationship === Relationship.SIBLING);
        if (siblingIndex !== -1) {
            this._links.splice(siblingIndex, 0, link);
        } else {
            this._links.push(link);
        }
        this.rerender();
    }
}