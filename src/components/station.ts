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
import {generateGUID, scrollIntoView, showErrorPopup, showSuccessPopup} from "../common/utility.ts";
import Oniform from "./oniform.ts";
import {h, VNode} from "snabbdom";
import {renderView} from "../main.ts";

export class StationButtonAdd extends ActionButton {
    constructor(parent: Group | Station | Terminal, self?: Station) {
        if (!self) {
            super("New Question", () => {
                parent.addEmptyStation();
            }, undefined, ["text"], "New Question");
        } else {
            const siblingButton = new ActionButton("New question", () => {
                parent.addEmptyStation(self);
            }, undefined, ["text"], "New Question");
            const dependantGroup = new ActionButton("New sub-group", () => {
                const newGroup = new Group(self);
                newGroup.addEmptyStation();
                newGroup.stations[0].addEmptyTerminal();
                new Link(self, newGroup, Relationship.DEPENDANT);
            }, undefined, ["text"], "New Dependant Group");
            const dependantStation = new ActionButton("New sub-question", () => {
                const newStation = new Station(self);
                newStation.addEmptyTerminal();
                new Link(self, newStation, Relationship.DEPENDANT);
            }, undefined, ["text"], "New Dependant Station");
            const terminalButton = new ActionButton("New option", () => {
                self.addEmptyTerminal();
            }, undefined, ["text"], "New Option");

            const actionItems = [siblingButton, dependantGroup, dependantStation, terminalButton];

            super(h("img", {props: {src: plusUrl, alt: "Plus"}}), () => {
            }, actionItems, ["icon"], "New Station");
        }
    }
}

export class StationButtonCollapse extends ActionButton {
    constructor(self: Station) {
        const chevronDownVNode = h("img", {props: {src: chevronDownUrl, alt: "Collapse All"}});
        const chevronRightVNode = h("img", {props: {src: chevronRightUrl, alt: "Expand All"}});

        const collapseCallback = () => {
            self.isCollapsed = !self.isCollapsed;
            self.links.forEach(link => link.isCollapsed = !link.isCollapsed);
            renderView();
        };

        if (self.isCollapsed && (self.links.length > 0 || self.terminals.length > 0)) {
            super(chevronRightVNode, collapseCallback, undefined, ["icon"], "Collapse Dependants");
        } else {
            super(chevronDownVNode, collapseCallback, undefined, ["icon"], "Collapse Dependants");
        }
    }
}

export class StationButtonDelete extends ActionButton {
    constructor(self: Station) {
        const minusVNode = h("img", {props: {src: minusUrl, alt: "Delete"}});

        super(minusVNode, () => {
            self.parent.deleteStation(self);
        }, undefined, ["icon"], "Delete Station");
    }
}

export class StationButtonCopy extends ActionButton {
    constructor(self: Station) {
        const copyVNode = h("img", {props: {src: copyUrl, alt: "Copy"}});

        super(copyVNode, () => {
            const previouslySelected = document.querySelector(".selected");
            if (previouslySelected) {
                previouslySelected.classList.remove("selected");
            }
            Clipboard.instance.copiedObject = self.clone();
            showSuccessPopup("Question copied to clipboard", 1500);
            const stationElement = document.getElementById(self.id);
            if(!stationElement) {
                showErrorPopup("Station not found");
                return;
            }

            stationElement.classList.add("selected");

            const removeSelection = (event: Event) => {
                if (event instanceof KeyboardEvent && event.key === "Escape") {
                    stationElement.classList.remove("selected");
                    document.removeEventListener("keydown", removeSelection);
                }
            };

            document.addEventListener("keydown", removeSelection);
        }, undefined, ["icon"], "Copy Station");
    }
}

export class StationButtonPaste extends ActionButton {
    constructor(self: Station) {
        const pasteVNode = h("img", {props: {src: pasteUrl, alt: "Paste"}});

        const actionItems = [
            new ActionButton("Paste as question", () => {
                if (self.parent instanceof Group || self.parent instanceof Station)
                    self.parent.addStationAfterReference(self, <Station>Clipboard.instance.cloneCopiedObject());
            }, undefined, ["text"], "New Question"),
            new ActionButton("Paste as sub-question", () => {
                const cloneObject = <Station>Clipboard.instance.cloneCopiedObject();
                cloneObject.parent = self;
                new Link(self, cloneObject, Relationship.DEPENDANT);
            }, undefined, ["text"], "New Dependant Station")
        ];

        super(pasteVNode, () => {
            self.paste();
        }, actionItems, ["icon"], "Paste");
    }
}

export default class Station {
    isCollapsed: boolean = false;

    constructor(
        private _parent: Group | Station | Terminal,
        private _root: Station = this,
        private _value: string = "",
        private _label: string = `Question ${_parent.findStationIndex(this)}`,
        private _terminals: Terminal[] = [],
        private _links: Link[] = [],
        private _html: HTMLDivElement = document.createElement("div"),
        private _editable: boolean = true,
        private _id: string = `station-${generateGUID()}`
    ) {
    }

    render(): VNode {
        this._label = `Question ${this._parent.findStationIndex(this)}`;
        const labelElement = h("input.station_label", {
            props: {disabled: true, value: this._label}, on: {
                input: (event: Event) => {
                    this._label = (event.target as HTMLInputElement).value;
                }
            }
        });

        const links = this.links.map(link => {
            return link.rerender();
        });
        return h("div.station_container", {props: {id: this._id}, key: this._id}, [
            h("div.station",
                {
                    styles: {
                        opacity: "0.8",
                        top: "-0.5rem",
                        transition: "opacity 0.3s, top 0.3s ",
                        delayed: {opacity: "1", top: "0"},
                    }
                }, [
                    h("div.buttons", [
                        this._editable ? new StationButtonDelete(this).render() : null,
                        this._editable ? new StationButtonAdd(this._parent, this).render() : null,
                        this._editable ? new StationButtonCollapse(this).render() : null,
                        this._editable ? new StationButtonCopy(this).render() : null,
                        this._editable ? new StationButtonPaste(this).render() : null,
                        labelElement,
                    ]),
                    h("textarea.station_textarea", {
                        props: {value: this._value, placeholder: "Enter question here"}, on: {
                            input: (event: Event) => {
                                this._value = (event.target as HTMLTextAreaElement).value;
                            }
                        }, class: {folded: this.isCollapsed && (this.terminals.length > 0 || this.links.length > 0)}
                    }),
                    this.terminals.length === 0 ? new TerminalButtonAdd(this).render() : null,
                    this.terminals.length > 0 ? h("div.terminals",{class: {collapse: this.isCollapsed}} ,this.terminals.map(terminal => terminal.render())) : null,
                    ...links,
                ]),
        ]);
    }

    clone(editable: boolean = false, parentClone?: Group | Station | Terminal): Station {
        const stationClone = new Station(
            parentClone ?? new Group(Oniform.instance),
            this._root, this._value, this._label,
            [], [], undefined, editable);

        this._terminals.map(terminal => terminal.clone(editable, stationClone)).forEach(terminal => stationClone.appendExistingTerminal(terminal, true));
        this._links.forEach(link => link.clone(stationClone, editable))
        return stationClone;
    }

    paste(): void {
        if (!Clipboard.instance.copiedObject) {
            showErrorPopup("Clipboard is empty");
            console.log("Clipboard is empty");
            return;
        }
        if(Clipboard.instance.copiedObject instanceof Station) {
            return;
        }

        const copiedObject = Clipboard.instance.cloneCopiedObject();
        if (copiedObject instanceof Group) {
            copiedObject.parent = this;
            new Link(this, copiedObject, Relationship.DEPENDANT);
        } else if (copiedObject instanceof Terminal) {
            this.appendExistingTerminal(copiedObject, true);
        }
    }

    get label() {
        return this._label;
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
        let terminalId;
        if (prevTerminal) {
            const terminalIndex = this.findTerminalIndex(prevTerminal);
            const terminal = new Terminal(this);
            this._terminals.splice(terminalIndex, 0, terminal);
            terminalId = terminal.id;
        } else {
            const terminal = new Terminal(this);
            this._terminals.push(terminal);
            terminalId = terminal.id;
        }
        renderView();
        scrollIntoView(terminalId);
    }

    appendExistingTerminal(terminal: Terminal, noRender: boolean = false) {
        terminal.parent = this;
        this._terminals.push(terminal);
        if (!noRender) renderView();
        scrollIntoView(terminal.id);
    }

    addTerminalAfterReference(refTerminal: Terminal, newTerminal: Terminal) {
        newTerminal.parent = this;
        const prevTerminalIndex = this.findTerminalIndex(refTerminal);
        this._terminals.splice(prevTerminalIndex, 0, newTerminal);
        renderView();
        scrollIntoView(newTerminal.id);
    }

    deleteTerminal(terminal: Terminal) {
        const terminalIndex = this.findTerminalIndex(terminal) - 1;
        this._terminals.splice(terminalIndex, 1);
        renderView();
    }

    findTerminalIndex(terminal: Terminal): number {
        const terminalIndex = this._terminals.findIndex(t => t.id === terminal.id);
        if (terminalIndex === -1) return 1;
        return (terminalIndex + 1);
    }

    addEmptyStation() {
        const newStation = new Station(this);
        new Link(this, newStation, Relationship.DEPENDANT);
        scrollIntoView(newStation.id);
    }

    addStationAfterReference(refStation: Station, newStation: Station) {
        new Link(this, newStation, Relationship.DEPENDANT);
        scrollIntoView(newStation.id);
    }

    deleteStation(station: Station) {
        const linkIndex = this.links.findIndex(g => g.right.id === station.id);
        this.links.splice(linkIndex, 1);
        renderView();
    }

    deleteGroup(group: Group) {
        this.links.forEach(link => console.log(link.right.id));
        const linkIndex = this.links.findIndex(g => g.right.id === group.id);
        this.links.splice(linkIndex, 1);
        renderView();
    }

    findGroupIndex(group: Group): number {
        const index = this.links.findIndex(g => g.right.id === group.id);
        if (index == -1) return 1;
        return (index + 1);
    }

    findStationIndex(station: Station): number {
        const index = this.links.findIndex(g => g.right.id === station.id);
        if (index == -1) return 1;
        return (index + 1);
    }

    addLink(link: Link, noRender: boolean = false) {
        this.links.push(link);
        if(!noRender) renderView();
        scrollIntoView(link.id);
    }


    set parent(parent: Group | Station | Terminal) {
        this._parent = parent;
    }


    toObj(): any {
        const {id, value, label, terminals, links} = this;
        return {
            id,
            value,
            label,
            terminals: terminals.map(terminal => terminal.toObj()),
            links: links.map(link => link.toObj())
        }
    }

    static from(obj: any, parent: Group | Station | Terminal): Station {
        const {id, value, label, terminals, links} = obj;
        const station = new Station(parent, undefined, value, label, [], [], undefined, true, id);
        station.terminals = terminals.map((terminal: any) => Terminal.from(terminal, station));
        links.forEach((link: any) => Link.from(link, station));
        return station;
    }
}