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
import {generateGUID, showErrorPopup, showSuccessPopup} from "../common/utility.ts";
import Oniform from "./oniform.ts";
import {h, VNode} from "snabbdom";
import {patch} from "../common/snabbdom.setup.ts";
import {renderView} from "../main.ts";

export class TerminalButtonAdd extends ActionButton {
    constructor(parent: Station, self?: Terminal) {
        if(!self) {
            super("New option", () => {
                    parent.addEmptyTerminal();
                },
                undefined,
                ["text"]
            );
        }
        else
        {
            const siblingButton = new ActionButton("New option", () => {
                parent.addEmptyTerminal(self);
                parent.rerender();
            }, undefined, ["text"]);

            const groupDependantButton = new ActionButton("New sub-group", () => {
                const newGroup = new Group(self);
                newGroup.addEmptyStation();
                newGroup.stations[0].addEmptyTerminal();
                new Link(self, newGroup, Relationship.DEPENDANT);
            }, undefined, ["text"]);

            const stationDependantButton = new ActionButton("New sub-question", () => {
                new Link(self, new Station(self), Relationship.DEPENDANT);
            }, undefined, ["text"]);

            const actionItems = [siblingButton, groupDependantButton, stationDependantButton];

            super(h("img", { props: { src: plusUrl, alt: "Plus" } }), () => {}, actionItems, ["icon"], "New Option");
        }
    }
}

export class TerminalButtonCollapse extends ActionButton {
    constructor(self: Terminal) {
        const chevronDownVNode = h("img", { props: { src: chevronDownUrl, alt: "Collapse All" } });
        const chevronRightVNode = h("img", { props: { src: chevronRightUrl, alt: "Expand All" } });

        // const collapseCallback = () => {
        //     const expandedlinks = self.html.getElementsByClassName(`link ${Relationship.DEPENDANT}`);
        //     if (expandedlinks.length > 0) {
        //         for (let i = 0; i < expandedlinks.length; i++) {
        //             expandedlinks[i].classList.toggle("collapse");
        //         }
        //         self.html.getElementsByClassName("terminal_input")[0].classList.toggle("folded");
        //         if (expandedlinks[0].classList.contains("collapse")) {
        //             this.button.replaceChild(chevronRightVNode.elm!, this.button.firstChild!);
        //         } else {
        //             this.button.replaceChild(chevronDownVNode.elm!, this.button.firstChild!);
        //         }
        //         self.isCollapsed = !self.isCollapsed;
        //     }
        // };

        if (self.isCollapsed) {
            super(chevronRightVNode, () => {}, undefined, ["icon"], "Collapse Dependants");
        } else {
            super(chevronDownVNode, () => {}, undefined, ["icon"], "Collapse Dependants");
        }
    }
}

export class TerminalButtonDelete extends ActionButton {
    constructor(parent: Station, self: Terminal) {
        const minusVNode = h("img", { props: { src: minusUrl, alt: "Delete" } });

        super(minusVNode, () => {
            parent.deleteTerminal(self);
        }, undefined, ["icon"], "Delete Terminal");
    }
}

export class TerminalButtonCopy extends ActionButton {
    constructor(self: Terminal) {
        const copyVNode = h("img", { props: { src: copyUrl, alt: "Copy" } });

        super(copyVNode, () => {
            const previouslySelected = document.querySelector(".selected");
            if (previouslySelected) {
                previouslySelected.classList.remove("selected");
            }

            Clipboard.instance.copiedObject = self.clone();
            showSuccessPopup("Option copied to clipboard", 1500);
            // self.html.classList.add("selected");

            const removeSelection = (event: Event) => {
                if (event instanceof KeyboardEvent && event.key === "Escape") {
                    // self.html.classList.remove("selected");
                    document.removeEventListener("keydown", removeSelection);
                }
            };

            document.addEventListener("keydown", removeSelection);
        }, undefined, ["icon"], "Copy Terminal");
    }
}

export class TerminalButtonPaste extends ActionButton {
    constructor(self: Terminal) {
        const pasteVNode = h("img", { props: { src: pasteUrl, alt: "Paste" } });

        super(pasteVNode, () => {
            self.paste();
        }, undefined, ["icon"], "Paste");
    }
}

export default class Terminal {
    isCollapsed: boolean = false;
    constructor(
        private _parent: Station,
        private _label: string = `Option ${_parent.label.split(" ").pop()}-${_parent.findTerminalIndex(this).toString()}`,
        private _root: Terminal = this,
        private _value: string = "",
        private _links: Link[] = [],
        private _editable: boolean = true,
        private _id: string = `terminal-${generateGUID()}`
    ) {}

    public render():VNode {
        const links = this.links.map(link => {
            return link.rerender();
        });
        return h("div.terminal_container", {props: { id: this._id }, key: this._id}, [
            this.createTerminalElement(),
            ...links
            ]);
        // this._html.scrollIntoView({ behavior: "smooth" });
    }

    private createTerminalElement(): VNode {
        return h("div.terminal", [
            this.createButtons(),
            this.createInputElement()
           ]);
        // const terminalElement = document.createElement("div");
        // terminalElement.classList.add("terminal");
        //
        // const labelElement = this.createLabelElement();
        // const inputElement = this.createInputElement();
        //
        // const buttons = document.createElement("div");
        // buttons.classList.add("buttons");
        // if (this._editable) {
        //     const deleteButton = new TerminalButtonDelete(this. _parent, this).button;
        //     const collapseButton = new TerminalButtonCollapse(this).button;
        //     const addButton = new TerminalButtonAdd(this. _parent, this).button;
        //     const copyButton = new TerminalButtonCopy(this).button;
        //     const pasteButton = new TerminalButtonPaste(this).button;
        //     buttons.appendChild(deleteButton);
        //     buttons.appendChild(addButton);
        //     buttons.appendChild(collapseButton);
        //     buttons.appendChild(copyButton);
        //     buttons.appendChild(pasteButton);
        // }
        // buttons.appendChild(labelElement);
        //
        // terminalElement.appendChild(buttons);
        // terminalElement.appendChild(inputElement);
        //
        // return terminalElement;
    }

    private createLabelElement(): VNode {
        return h("input.terminal_label", {
            props: {
                disabled: true,
                value: this._label
            }
        });
    }

    private createInputElement(): VNode {
        return h("input.terminal_input", {
            props: {
                value: this._value,
                placeholder: "Enter option here"
            },
            on: {
                input: (event: Event) => {
                    this._value = (event.target as HTMLInputElement).value;
                }
            }
        });
    }
    public rerender() {
        return this.render();
    }

    public clone(editable: boolean = false, dumbStation?: Station): Terminal {
        const terminalClone = new Terminal(dumbStation ?? new Station(new Group(Oniform.instance)), this._label, this._root, this._value, [], editable);
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
            const newTerminal = copiedObject.clone(true, this. _parent);
            this. _parent.addTerminalAfterReference(this, newTerminal);
        }
        else if(copiedObject instanceof Group) {
            copiedObject.parent = this;
            new Link(this, copiedObject, Relationship.DEPENDANT);
        }
        else {
            new Link(this, copiedObject, Relationship.DEPENDANT);
        }

        this.rerender();
    }

    get label(): string {
        return this._label;
    }

    get value(): string {
        return this._value;
    }

    get root(): Terminal {
        return this._root;
    }

    get parent(): Station {
        return this. _parent;
    }

    set parent(station: Station) {
        this. _parent = station;
    }

    get id(): string {
        return this._id;
    }

    get links(): Link[] {
        return this._links;
    }

    deleteGroup(group: Group) {
        const linkIndex = this.links.findIndex(g => g.right.id === group.id);
        this.links.splice(linkIndex, 1);
        renderView();
    }

    deleteStation(station: Station) {
        const linkIndex = this.links.findIndex(g => g.right.id === station.id);
        this.links.splice(linkIndex, 1);
        renderView();
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

    public addEmptyStation() {
        const newStation = new Station(this);
        // animateHighlight(newStation.html);
        new Link(this, newStation, Relationship.DEPENDANT);
    }

    public addLink(link: Link) {
        link.parent = this;
        this._links.push(link);
        renderView();
        // this.parent.parent.rerender();
    }

    toObj () {
        const {id, label, value, links} = this;
        return {
            id,
            label,
            value,
            links: links.map(link => link.toObj())
        }
    }

    static from(obj: any, parent: Station): Terminal {
        const {label, value, links, id} = obj;
        const terminal = new Terminal(parent, label, undefined, value, [], undefined, id);
        links.forEach((link: any) => Link.from(link, terminal));
        return terminal;
    }

    private createButtons():VNode {
        return h("div.buttons", [
            this._editable ? new TerminalButtonDelete(this. _parent, this).render() : undefined,
            this._editable ? new TerminalButtonAdd(this. _parent, this).render() : undefined,
            this._editable ? new TerminalButtonCollapse(this).render() : undefined,
            this._editable ? new TerminalButtonCopy(this).render() : undefined,
            this._editable ? new TerminalButtonPaste(this).render() : undefined,
            this.createLabelElement()
        ]);
    }
}