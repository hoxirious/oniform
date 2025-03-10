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
import {animateHighlight, createListItem, generateGUID, showErrorPopup, showSuccessPopup} from "../common/utility.ts";
import Oniform from "./oniform.ts";

export class StationButtonAdd extends ActionButton {
    constructor(parent: Group | Station | Terminal, self?: Station) {
        const plus = document.createElement("img");
        plus.src = plusUrl as string;
        plus.alt = "Plus";

        if (!self) {
            super("New Question", "new-station", ["button"], () => {
                parent.addEmptyStation();
            }, true, undefined, "New Question");
        }
        else {
            const actionItems = document.createElement("ul");
            actionItems.classList.add("action_items");

            const siblingButton = new ActionButton("New question", "station-sibling", ["add_station_button"], () => {
                parent.addEmptyStation(self);
            }, true, undefined, "New Question").button;
            const dependantGroup = new ActionButton("New sub-group", "group-dependant", ["add_station_button"], () => {
                const newGroup = new Group(self);
                newGroup.addEmptyStation();
                newGroup.stations[0].addEmptyTerminal();
                new Link(self, newGroup, Relationship.DEPENDANT);
            }, true, undefined, "New Dependant Group").button;
            const dependantStation = new ActionButton("New sub-question", "station-dependant", ["add_station_button"], () => {
                const newStation = new Station(self);
                newStation.addEmptyTerminal();
                new Link(self, newStation, Relationship.DEPENDANT);
            }).button;
            const terminalButton = new ActionButton("New option", "terminal-sibling", ["add_terminal_button"], () => {
                self.addEmptyTerminal();
            }, true, undefined, "New Option").button;

            actionItems.appendChild(createListItem(terminalButton));
            actionItems.appendChild(createListItem(siblingButton));
            actionItems.appendChild(createListItem(dependantStation));
            actionItems.appendChild(createListItem(dependantGroup));


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

        const collapseCallback = () => {
            const links = self.html.getElementsByClassName(`link ${Relationship.DEPENDANT}`);
            const terminals = self.html.getElementsByClassName("terminals");
            if(links.length != 0 || terminals.length != 0) {
                for (let i = 0; i < links.length; i++) {
                    links[i].classList.toggle("collapse");
                }
                terminals[0].classList.toggle("collapse");
                self.html.getElementsByClassName("station_textarea")[0].classList.toggle("folded");
            }

            if ((terminals.length > 0 && terminals[0].classList.contains("collapse")) ||
                (links.length > 0 && links[0].classList.contains("collapse"))) {
                this.button.replaceChild(chevronRight, this.button.firstChild!);
            }
            else {
                this.button.replaceChild(chevronDown, this.button.firstChild!);
            }
            self.isCollapsed = !self.isCollapsed;
        }

        if (self.isCollapsed) {
            super(chevronRight, "collapse-stations", ["icon"], collapseCallback, true, undefined, "Collapse Dependants");
        }
        else {
            super(chevronDown, "collapse-stations", ["icon"], collapseCallback, true, undefined, "Collapse Dependants");
        }
    }
}

export class StationButtonDelete extends ActionButton {
    constructor(self: Station) {
        const minus = document.createElement("img");
        minus.src = minusUrl as string;
        minus.alt = "Delete";

        super(minus, "delete-station", ["icon"], () => {
            self.html.remove();
            self.parent.deleteStation(self);
        }, true, undefined, "Delete Station");
    }
}

export class StationButtonCopy extends ActionButton {
    constructor(self: Station) {
        const copy = document.createElement("img");
        copy.src = copyUrl as string;
        copy.alt = "Copy";

        super(copy, "copy-station", ["icon"], () => {
            const previouslySelected = document.querySelector(".selected");
            if (previouslySelected) {
                previouslySelected.classList.remove("selected");
            }
            Clipboard.instance.copiedObject = self.clone();
            showSuccessPopup("Question copied to clipboard", 1500);
            self.html.classList.add("selected");

            const removeSelection = (event: Event) => {
                if (event instanceof KeyboardEvent && event.key === "Escape") {
                    self.html.classList.remove("selected");
                    document.removeEventListener("keydown", removeSelection);
                }
            };

            document.addEventListener("keydown", removeSelection);
        }, true, undefined, "Copy Station");
    }
}

export class StationButtonPaste extends ActionButton {
    constructor(self: Station) {
        const paste = document.createElement("img");

        paste.src = pasteUrl as string;
        paste.alt = "Paste";

        const actionItems = document.createElement("ul");
        actionItems.classList.add("action_items");

        const siblingButton = new ActionButton("Paste as question", "station-sibling", ["add_station_button"], () => {
            if(self.parent instanceof Group || self.parent instanceof Station)
                self.parent.addStationAfterReference(self, <Station>Clipboard.instance.cloneCopiedObject());
        }, true, undefined, "New Question").button;
        const dependantStation = new ActionButton("Paste as sub-question", "station-dependant", ["add_station_button"], () => {
            const cloneObject = <Station>Clipboard.instance.cloneCopiedObject();
            cloneObject.parent = self;
            new Link(self, cloneObject, Relationship.DEPENDANT);
        }).button;
        actionItems.appendChild(createListItem(siblingButton));
        actionItems.appendChild(createListItem(dependantStation));

        super(paste, "paste-station", ["icon"], () => {
            self.paste(this);
        }, true, actionItems, "Paste");
    }
}

export default class Station {
    isCollapsed: boolean = false;
    constructor(
        private _parent: Group | Station | Terminal,
        private _root: Station = this,
        private _value: string = "",
        private _label: string = "",
        private _terminals: Terminal[] = [],
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
        const stationIndex = this._parent.findStationIndex(this).toString();
        if(!this._label || this._label != `Station ${stationIndex}`)
            this._label = `Question ${stationIndex}`;
        labelElement.value = this._label;
        labelElement.classList.add("station_label");

        labelElement.addEventListener("input", (event) => {
            this._label = (event.target as HTMLInputElement).value;
        });

        // Buttons
        const buttons = document.createElement("div");
        buttons.classList.add("buttons");
        const buttonCollapse = new StationButtonCollapse(this).button;
        const buttonAdd = new StationButtonAdd(this._parent, this).button;
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
        textareaElement.placeholder = "Enter question here";
        textareaElement.addEventListener("input", (event) => {
            this._value = (event.target as HTMLTextAreaElement).value;
        });

        station.appendChild(textareaElement);

        this._html.appendChild(station);
        if(this._terminals.length == 0)
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
            this._terminals.forEach(terminal =>
            {
                terminal.rerender();
                terminals.appendChild(terminal.html);
            }
            );
            this._html.appendChild(terminals);
        }
        this._links.forEach(link => {
            link.html.classList.remove("collapse");
            link.right.rerender();
            this._html.appendChild(link.html)
        });
        this._html.scrollIntoView({behavior: "smooth", block: "center"});
    }

    rerender() {
        this.render();
    }

    clone(editable: boolean = false, parentClone?: Group | Station | Terminal): Station {
        const stationClone = new Station(
            parentClone ?? new Group(Oniform.instance),
            this._root, this._value, this._label,
            [], [], undefined, editable);

        this._terminals.map(terminal => terminal.clone(editable, stationClone)).forEach(terminal => stationClone.appendExistingTerminal(terminal));
        this._links.forEach(link => link.clone(stationClone, editable))
        return stationClone;
    }

    paste(pasteButton: ActionButton): void {
        const copiedObject = Clipboard.instance.cloneCopiedObject();
        if(!copiedObject) {
            showErrorPopup("Clipboard is empty");
            return;
        }

        if(copiedObject instanceof Station) {
            pasteButton.actionItems?.classList.toggle("show");
            return;
        }
        else if (copiedObject instanceof Group) {
            copiedObject.parent = this;
            new Link(this, copiedObject, Relationship.DEPENDANT);
        }
        else {
            this.appendExistingTerminal(copiedObject);
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

    get terminals(): Terminal[] {
        return this._terminals;
    }

    set terminals(terminals: Terminal[]) {
        this._terminals = terminals;
    }

    get parent(): Group | Station | Terminal {
        return this._parent;
    }

    get links(): Link[] {
        return this._links;
    }

    set links(links: Link[]) {
        this._links = links;
    }

    get value(): string {
        return this._value;
    }
    set value(value: string) {
        this._value = value;
    }

    addEmptyTerminal(prevTerminal?: Terminal) {
        if(prevTerminal) {
            const terminalIndex = this.findTerminalIndex(prevTerminal);
            const terminal = new Terminal(this);
            this.terminals.splice(terminalIndex, 0, terminal);
            animateHighlight(terminal.html);
        }
        else {
            const terminal = new Terminal(this);
            this.terminals.push(terminal);
            animateHighlight(terminal.html);
        }

        this.rerender();
    }

    appendExistingTerminal(terminal: Terminal) {
        terminal.parent = this;
        this._terminals.push(terminal);
        animateHighlight(terminal.html);
        this.rerender();
    }

    addTerminalAfterReference(refTerminal: Terminal, newTerminal: Terminal) {
        newTerminal.parent = this;
        const prevTerminalIndex = this.findTerminalIndex(refTerminal);
        this._terminals.splice(prevTerminalIndex, 0, newTerminal);
        animateHighlight(newTerminal.html);
        this.rerender();
    }

    deleteTerminal(terminal: Terminal) {
        const terminalIndex = this.findTerminalIndex(terminal)-1;
        this._terminals.splice(terminalIndex, 1);
        this.rerender();
    }

    findTerminalIndex(terminal: Terminal): number {
        const terminalIndex = this._terminals.findIndex(t => t.id === terminal.id);
        if (terminalIndex === -1) return 1;
        return (terminalIndex + 1);
    }

    addEmptyStation() {
        const newStation = new Station(this);
        animateHighlight(newStation.html);
        new Link(this, newStation, Relationship.DEPENDANT);
    }

    addStationAfterReference(refStation: Station, newStation: Station) {
        animateHighlight(newStation.html);
        new Link(this, newStation, Relationship.DEPENDANT);
    }

    deleteStation(station: Station) {
        const linkIndex = this.links.findIndex(g => g.right.id === station.id);
        this.links[linkIndex].html.remove();
        this.links.splice(linkIndex, 1);
        this.rerender();
    }

    deleteGroup(group: Group) {
        this.links.forEach(link => console.log(link.right.id));
        console.log(group.id);
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

    findStationIndex(station: Station): number {
        const index = this.links.findIndex(g => g.right.id === station.id);
        if (index == -1) return 1;
        return (index+1);
    }

    addLink(link: Link) {
        this.links.push(link);
        this.rerender();
    }


    set parent(parent: Group | Station | Terminal) {
        this._parent = parent;
    }


    toObj() {
        const {id, value, label, terminals, links} = this;
        return {
            id,
            value,
            label,
            terminals: terminals.map(terminal => terminal.toObj()),
            links: links.map(link => link.toObj())
        }
    }

    static from(obj: any, parent: Group|Station|Terminal): Station {
        const {id, value, label, terminals, links} = obj;
        const station = new Station(parent, undefined, value, label, [], [], undefined, true, id);
        station.terminals =  terminals.map((terminal: any) => Terminal.from(terminal, station));
        links.forEach((link: any) => Link.from(link, station));
        return station;
    }
}