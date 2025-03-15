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
import {generateGUID, showErrorPopup, showSuccessPopup} from "../common/utility.ts";
import Oniform from "./oniform.ts";
import {h, vnode, VNode} from "snabbdom";
import {renderView} from "../main.ts";
import {patch} from "../common/snabbdom.setup.ts";

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
            console.log("Collapse");
            // const links = self.html.getElementsByClassName(`link ${Relationship.DEPENDANT}`);
            // const terminals = self.html.getElementsByClassName("terminals");
            // if (links.length != 0 || terminals.length != 0) {
            //     for (let i = 0; i < links.length; i++) {
            //         links[i].classList.toggle("collapse");
            //     }
            //     terminals[0].classList.toggle("collapse");
            //     self.html.getElementsByClassName("station_textarea")[0].classList.toggle("folded");
            // }
            //
            // if ((terminals.length > 0 && terminals[0].classList.contains("collapse")) ||
            //     (links.length > 0 && links[0].classList.contains("collapse"))) {
            //     this.button.replaceChild(chevronRightVNode.elm!, this.button.firstChild!);
            // } else {
            //     this.button.replaceChild(chevronDownVNode.elm!, this.button.firstChild!);
            // }
            // self.isCollapsed = !self.isCollapsed;
        };

        if (self.isCollapsed) {
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
            // const previouslySelected = document.querySelector(".selected");
            // if (previouslySelected) {
            //     previouslySelected.classList.remove("selected");
            // }
            Clipboard.instance.copiedObject = self.clone();
            showSuccessPopup("Question copied to clipboard", 1500);
            // self.html.classList.add("selected");

            // const removeSelection = (event: Event) => {
            //     if (event instanceof KeyboardEvent && event.key === "Escape") {
            //         // self.html.classList.remove("selected");
            //         document.removeEventListener("keydown", removeSelection);
            //     }
            // };

            // document.addEventListener("keydown", removeSelection);
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
        const newVnode = h("div.station_container", {props: {id: this._id}, key: this._id}, [
            h("div.station",
                {
                    style: {
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
                        }
                    }),
                    this.terminals.length === 0 ? new TerminalButtonAdd(this).render() : null,
                    this.terminals.length > 0 ? h("div.terminals", this.terminals.map(terminal => terminal.render())) : null,
                    ...links,
                ]),
        ]);
        newVnode.dd
        return newVnode;

        // Buttons
        // const buttons = document.createElement("div");
        // buttons.classList.add("buttons");
        // const buttonCollapse = new StationButtonCollapse(this).button;
        // const buttonAdd = new StationButtonAdd(this._parent, this).button;
        // const buttonDelete = new StationButtonDelete(this).button;
        // const buttonCopy = new StationButtonCopy(this).button;
        // const buttonPaste = new StationButtonPaste(this).button;
        // if(this._editable) {
        //     buttons.appendChild(buttonDelete);
        //     buttons.appendChild(buttonAdd);
        //     buttons.appendChild(buttonCollapse);
        //     buttons.appendChild(buttonCopy);
        //     buttons.appendChild(buttonPaste);
        // }
        //     buttons.appendChild(labelElement);
        // station.appendChild(buttons);

        // const textareaElement = document.createElement("textarea");
        // textareaElement.classList.add("station_textarea");
        // textareaElement.value = this._value;
        // textareaElement.placeholder = "Enter question here";
        // textareaElement.addEventListener("input", (event) => {
        //     this._value = (event.target as HTMLTextAreaElement).value;
        // });

        // station.appendChild(textareaElement);

        // this._html.appendChild(station);
        // if(this._terminals.length == 0)
        // {
        //     const terminalElement = document.createElement("div");
        //     terminalElement.classList.add("terminal");
        //     terminalElement.appendChild(new TerminalButtonAdd(this).button);
        //     if(this._editable) {
        //         this._html.appendChild(terminalElement);
        //     }
        // }
        // else  {
        //     const terminals = document.createElement("div");
        //     terminals.classList.add("terminals");
        //     this._terminals.forEach(terminal =>
        //     {
        //         terminal.rerender();
        //         terminals.appendChild(terminal.html);
        //     }
        //     );
        //     this._html.appendChild(terminals);
        // }
        // this._links.forEach(link => {
        //     link.html.classList.remove("collapse");
        //     link.right.rerender();
        //     this._html.appendChild(link.html)
        // });
        // this._html.scrollIntoView({behavior: "smooth", block: "center"});

    }

    rerender(): VNode {
        return this.render();
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
            this.appendExistingTerminal(copiedObject);
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
        if (prevTerminal) {
            const terminalIndex = this.findTerminalIndex(prevTerminal);
            const terminal = new Terminal(this);
            this._terminals.splice(terminalIndex, 0, terminal);
        } else {
            const terminal = new Terminal(this);
            this._terminals.push(terminal);
        }

        renderView();
    }

    appendExistingTerminal(terminal: Terminal) {
        terminal.parent = this;
        this._terminals.push(terminal);
        // animateHighlight(terminal.html);
        renderView();
    }

    addTerminalAfterReference(refTerminal: Terminal, newTerminal: Terminal) {
        newTerminal.parent = this;
        const prevTerminalIndex = this.findTerminalIndex(refTerminal);
        this._terminals.splice(prevTerminalIndex, 0, newTerminal);
        renderView();
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
    }

    addStationAfterReference(refStation: Station, newStation: Station) {
        new Link(this, newStation, Relationship.DEPENDANT);
    }

    deleteStation(station: Station) {
        const linkIndex = this.links.findIndex(g => g.right.id === station.id);
        this.links[linkIndex].html.remove();
        this.links.splice(linkIndex, 1);
        renderView();
    }

    deleteGroup(group: Group) {
        this.links.forEach(link => console.log(link.right.id));
        console.log(group.id);
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

    addLink(link: Link) {
        this.links.push(link);
        renderView();
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

    static from(obj: any, parent: Group | Station | Terminal): Station {
        const {id, value, label, terminals, links} = obj;
        const station = new Station(parent, undefined, value, label, [], [], undefined, true, id);
        station.terminals = terminals.map((terminal: any) => Terminal.from(terminal, station));
        links.forEach((link: any) => Link.from(link, station));
        return station;
    }
}