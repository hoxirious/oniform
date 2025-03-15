import Station, {StationButtonAdd} from "./station.ts";
import '../styles/group.css';
import ActionButton from "./actionButton.ts";
import Oniform from "./oniform.ts";
import Clipboard from "./clipboard.ts";
import {animateHighlight, generateGUID, showErrorPopup, showSuccessPopup} from "../common/utility.ts";
import minusUrl from "../static/minus.svg";
import plusUrl from "../static/plus.svg";
import copyUrl from "../static/copy.svg";
import pasteUrl from "../static/paste.svg";
import Terminal from "./terminal.ts";
import Link, {Relationship} from "./link.ts";
import chevronDownUrl from "../static/chevron-down.svg";
import chevronRightUrl from "../static/chevron-right.svg";
import { h } from "snabbdom/build/h";
import {patch} from "../common/snabbdom.setup.ts";
import {VNode} from "snabbdom";
import {renderView} from "../main.ts";

export class GroupButtonAdd extends ActionButton {
    constructor(parent: Oniform|Station|Terminal, self?: Group) {
        if (!self) {
            super("New Group", () => {
                (parent as Oniform).addGroup();
            }, undefined, ["text"], "New Group");
        } else {
            const groupButton = new ActionButton("New group", () => {
                (parent as Oniform).addGroup(self);
            }, undefined, ["text"], "New Group")
            const stationButton = new ActionButton("New question", () => {
                self.addEmptyStation();
                self.stations[self.stations.length - 1].addEmptyTerminal();
            }, undefined, ["text"], "New Question");

            const actionItems = [groupButton, stationButton];

            const plusVNode = h("img", { props: { src: plusUrl, alt: "Plus" } });

            super(plusVNode, () => {}, actionItems, ["icon"], "New Group");
        }
    }
}

export class GroupButtonDelete extends ActionButton {
    constructor(parent: Oniform|Station|Terminal, self: Group) {

        super(h("img", {props: {src: minusUrl, alt: "Minus"}}), () => {
            parent.deleteGroup(self);
        }, undefined, ["icon"], "Delete Group");
    }
}

export class GroupButtonCollapse extends ActionButton {
    constructor(self: Group) {
        const chevronDownVNode = h("img", { props: { src: chevronDownUrl, alt: "Collapse All" } });
        const chevronRightVNode = h("img", { props: { src: chevronRightUrl, alt: "Expand All" } });

        const collapseCallback = () => {
            console.log("Collased")
            // const stationContainer = self.html.getElementsByClassName("station_container");
            //
            // if (stationContainer.length > 0) {
            //     const stations = self.html.getElementsByClassName("stations");
            //     stations[0].classList.toggle("collapse");
            //     self.html.getElementsByClassName(`group`)[0].classList.toggle("folded");
            //
            //     if (stations[0].classList.contains("collapse")) {
            //         this.button.replaceChild(chevronRightVNode.elm!, this.button.firstChild!);
            //     } else {
            //         this.button.replaceChild(chevronDownVNode.elm!, this.button.firstChild!);
            //     }
            //     self.isCollapsed = !self.isCollapsed;
            // }
        };

        if (self.isCollapsed) {
            super(chevronRightVNode, collapseCallback, undefined, ["icon"], "Collapse Dependants");
        } else {
            super(chevronDownVNode, collapseCallback, undefined, ["icon"], "Collapse Dependants");
        }
    }
}

export class GroupButtonCopy extends ActionButton {
    constructor(self: Group) {
        const copyVNode = h("img", { props: { src: copyUrl, alt: "Copy" } });

        super(copyVNode, () => {
            const previouslySelected = document.querySelector(".selected");
            if (previouslySelected) {
                previouslySelected.classList.remove("selected");
            }
            Clipboard.instance.copiedObject = self.clone();
            showSuccessPopup("Group copied to clipboard");
            // self.html.classList.add("selected");

            const removeSelection = (event: Event) => {
                if (event instanceof KeyboardEvent && event.key === "Escape") {
                    // self.html.classList.remove("selected");
                    document.removeEventListener("keydown", removeSelection);
                }
            };

            document.addEventListener("keydown", removeSelection);
        }, undefined, ["icon"], "Copy Group");
    }
}

export class GroupButtonPaste extends ActionButton {
    constructor(self: Group) {
        const pasteVNode = h("img", { props: { src: pasteUrl, alt: "Paste" } });

        super(pasteVNode, () => {
            self.paste();
        }, undefined, ["icon"], "Paste");
    }
}
export default class Group {
    private readonly _html: HTMLDivElement = document.createElement("div");
    isCollapsed: boolean = false;

    constructor(
        private _parent: Oniform|Station|Terminal,
        private _label: string = `Group ${_parent.findGroupIndex(this)}`,
        private _stations: Station[] = [],
        private readonly _scoreExpression: string = "",
        private _score: number = 0,
        private readonly _editable: boolean = true,
        private readonly _id: string = `group-${generateGUID()}`
    ) {}

    render() {
        this._label = `Group ${this._parent.findGroupIndex(this)}`
        return h("div.group_container", {props: {id: this._id}, key: this._id},
            [h("div.buttons", [
                this._parent && this._editable ? new GroupButtonDelete(this._parent, this).render() : undefined,
                this._parent instanceof Oniform && this._editable ? new GroupButtonAdd(this._parent, this).render() : undefined,
                this._editable ? new GroupButtonCopy(this).render() : null,
                this._editable ? new GroupButtonPaste(this).render() : null,
                this._editable ? new GroupButtonCollapse(this).render() : null,
                h("input.group_label", {
                    props: {
                        value: this._label,
                    },
                    on: {
                        input: (event: Event) => {
                            this._label = (event.target as HTMLInputElement).value;
                        }
                    }
                })
            ]),
                h("div.group",
                    {
                        style: {
                            opacity: "0.8",
                            top: "-0.5rem",
                            transition: "opacity 0.3s, top 0.3s",
                            delayed: {opacity: "1", top: "0"},
                        }
                    }, [
                        h("div.stations", [
                            this.stations.length === 0 ? new StationButtonAdd(this).render() : null,
                            ...this.stations.map(station => station.render())
                        ])
                    ])
            ]
        )
    }

    rerender():VNode {
        return this.render();
    }

    clone(editable: boolean = false, parentClone?: Station|Terminal): Group {
        const cloneGroup = new Group(parentClone ?? Oniform.instance, this._label, [], this._scoreExpression, this._score, editable);
        this._stations.map(station => station.clone(editable, cloneGroup)).forEach(station => cloneGroup.appendExistingStation(station));
        return cloneGroup;
    }

    paste(): void {
        const copiedObject = Clipboard.instance.cloneCopiedObject();
        if(!copiedObject) {
            showErrorPopup("Clipboard is empty");
            return;
        }
        if(copiedObject instanceof Group) {
            if(this._parent instanceof Oniform) {
                this._parent.addGroupAfterReference(this, copiedObject);
            }
            else {
                copiedObject.parent = this._parent;
                new Link(this._parent, copiedObject, Relationship.DEPENDANT);
            }
        }
        else if(copiedObject instanceof Station) {
            this.appendExistingStation(copiedObject);
        }
        else {
            showErrorPopup("Cannot copy Option in Group.", 2000);
            return;
        }
        renderView();
    }

    addEmptyStation(prevStation?: Station) {
        if(prevStation) {
            const stationIndex = this.findStationIndex(prevStation);
            const station = new Station(this, prevStation, "",`Question ${stationIndex + 1}`);
            this._stations.splice(stationIndex, 0, station);
        }
        else {
            const station = new Station(this);
            this._stations.push(station);
        }
        renderView();
    }

    appendExistingStation(station: Station) {
        station.parent = this;
        this._stations.push(station);
        renderView();
    }

    addStationAfterReference(refStation: Station, newStation: Station) {
        newStation.parent = this;
        const prevStationIndex = this.findStationIndex(refStation);
        this._stations.splice(prevStationIndex, 0, newStation);
        renderView();
    }

    deleteStation(station: Station) {
        const stationIndex = this.findStationIndex(station) - 1;
        this._stations.splice(stationIndex, 1);
        renderView();
    }

    findStationIndex(station: Station): number {
        const stationIndex = this._stations.findIndex(s => s.id === station.id);
        if(stationIndex === -1) return 1;

        return (stationIndex + 1);
    }


    get id(): string {
        return this._id;
    }

    get label(): string {
        return this._label;
    }

    get stations(): Station[] {
        return this._stations;
    }

    set stations(stations: Station[]) {
        this._stations = stations;
    }

    get scoreExpression(): string {
        return this._scoreExpression;
    }

    get score(): number {
        return this._score;
    }

    get parent(): Oniform|Station|Terminal|undefined {
        return this._parent;
    }

    set parent(parent: Oniform|Station|Terminal) {
        this._parent = parent;
    }

    toObj () {
        const {label, stations, scoreExpression, score, id} = this;
        return {
            id,
            label,
            score,
            scoreExpression,
            stations: stations.map(station => station.toObj()),
        }
    }

    static from (obj: any, parent: Oniform|Station|Terminal): Group {
        const {label, stations, scoreExpression, score, id} = obj;
        const group = new Group(parent, label, [], scoreExpression, score, true, id);
        group.stations = stations.map((station: any) => Station.from(station, group))
        return group;
    }
}