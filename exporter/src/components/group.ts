import Station, {StationButtonAdd} from "./station.ts";
import '../styles/group.css';
import ActionButton from "./actionButton.ts";
import Oniform from "./oniform.ts";
import Clipboard from "./clipboard.ts";
// import Link from "./link.ts";
import {generateGUID} from "../common/utility.ts";
import minusUrl from "../static/minus.svg";
import plusUrl from "../static/plus.svg";
import copyUrl from "../static/copy.svg";
import pasteUrl from "../static/paste.svg";
import Terminal from "./terminal.ts";
import Link, {Relationship} from "./link.ts";

export class GroupButtonAdd extends ActionButton {
    constructor(self?: Group) {
        if(!self) {
            super("New Group", "new-group", ["button"], () => {
                Oniform.instance.addGroup();
            });
        }
        else {
            const plus = document.createElement("img");
            plus.src = plusUrl as string;
            plus.alt = "Plus";

            super(plus, "new-group", ["icon"], () => {
                Oniform.instance.addGroup(self);
            });
        }
    }
}

export class GroupButtonDelete extends ActionButton {
    constructor(parent: Oniform|Station|Terminal, self: Group) {

        const minus = document.createElement("img");
        minus.src = minusUrl as string;
        minus.alt = "Minus";

        super(minus, "delete-group", ["icon"], () => {
            parent.deleteGroup(self);
        });
    }
}

export class GroupButtonCopy extends ActionButton {
    constructor(self: Group) {
        const copy = document.createElement("img");
        copy.src = copyUrl as string;
        copy.alt = "Copy";

        super(copy, "copy-group", ["icon"], () => {
            Clipboard.instance.copiedObject = self.clone();
        }, true, undefined, "Copy Group");
    }
}

export class GroupButtonPaste extends ActionButton {
    constructor(self: Group) {
        const paste = document.createElement("img");
        paste.src = pasteUrl as string;
        paste.alt = "Paste";

        super(paste, "paste-group", ["icon"], () => {
            self.paste();
        }, true, undefined, "Paste Group");
    }
}

export default class Group {
    private readonly _html: HTMLDivElement = document.createElement("div");

    constructor(
        private readonly _parent: Oniform|Station|Terminal,
        private _label: string = "Group 1",
        private readonly _stations: Station[] = [],
        private readonly _scoreExpression: string = "",
        private _score: number = 0,
        // private readonly _links: Link[] = [],
        private readonly _editable: boolean = true,
        private readonly _id: string = `group-${generateGUID()}`
    ) {
        this.render();
    }

    render() {
        this._html.innerHTML = "";
        this._html.classList.add("group_container");
        this._html.id = this._id;

        const group = document.createElement("div");
        group.classList.add("group");

        const buttons = document.createElement("div");
        buttons.classList.add("buttons");

        const inputElement = document.createElement("input");
        inputElement.value = this._label;
        inputElement.classList.add("group_label");

        inputElement.addEventListener("input", (event) => {
            this._label = (event.target as HTMLInputElement).value;
        });

        if (this._parent) {
            if(this._editable) {
                const deleteButton = new GroupButtonDelete(this._parent, this);
                buttons.appendChild(deleteButton.button);

                if (this._parent instanceof Oniform) {
                    const addButton = new GroupButtonAdd(this);
                    buttons.appendChild(addButton.button);
                }

                const copyButton = new GroupButtonCopy(this);
                const pasteButton = new GroupButtonPaste(this);
                buttons.appendChild(copyButton.button);
                buttons.appendChild(pasteButton.button);
            }
            let parentLabel = this._parent.label;
            let parentSignature = "";

            if(this._parent instanceof Station) {
                parentLabel = this._parent.groupOwner.label;
                parentSignature = "S";
            }
            else if(this._parent instanceof Terminal) {
                parentLabel = this._parent.prevStation.groupOwner.label;
                parentSignature = "T";
            }
            const parentLabelSplit = parentLabel.split(" ");
            let parentIndex = parentLabelSplit[parentLabelSplit.length - 1]
            // Remove signature if applicable
            parentIndex = parentIndex.slice(0, -parentSignature.length);

            // Group parentIndex.groupIndex(S/T)
            this._label = `Group ${parentIndex ? parentIndex + "." : ""}${this._parent.findGroupIndex(this).toString()}${parentSignature}`;
            inputElement.value = this._label;
        }

        buttons.appendChild(inputElement);
        this.html.appendChild(buttons);

        const stationDiv = document.createElement("div");
        stationDiv.classList.add("stations");
        if(this._stations.length == 0 && this._editable) {
            group.appendChild(new StationButtonAdd(this).button);
        }
        this._stations.forEach(station => {
            station.rerender();
            stationDiv.appendChild(station.html)
        });
        group.appendChild(stationDiv);

        this._html.appendChild(group);
    }

    rerender() {
        this._html.innerHTML = "";
        this.render();
    }

    clone(editable: boolean = false): Group {
        const clonedStations: Station[] = this._stations.map(station => station.clone(editable));
        return new Group(this._parent, this._label, clonedStations, this._scoreExpression, this._score, editable);
    }

    paste(): void {
        const copiedObject = Clipboard.instance.cloneCopiedObject();
        if(!copiedObject) {
            console.log("Nothing to paste");
            return;
        }
        if(copiedObject instanceof Group) {
            if(this._parent instanceof Oniform) {
                this._parent.addGroupAfterReference(this, copiedObject);
            }
            else {
                new Link(this._parent, copiedObject, Relationship.DEPENDANT);
            }
        }
        else if(copiedObject instanceof Station) {
            this.appendExistingStation(copiedObject);
        }
        else {
            console.error("Invalid object to paste");
            return;
        }
        this.rerender();
    }

    addEmptyStation(prevStation?: Station) {
        if(prevStation) {
            const stationIndex = this.findStationIndex(prevStation);
            const station = new Station(this, prevStation, "",`Station ${stationIndex + 1}`);
            this._stations.splice(stationIndex, 0, station);
        }
        else {
            this._stations.push(new Station(this));
        }
        this.rerender();
    }

    appendExistingStation(station: Station) {
        station.groupOwner = this;
        this._stations.push(station);
        this.rerender();
    }

    addStationAfterReference(refStation: Station, newStation: Station) {
        newStation.groupOwner = this;
        const prevStationIndex = this.findStationIndex(refStation);
        this._stations.splice(prevStationIndex, 0, newStation);
        this.rerender();
    }

    deleteStation(station: Station) {
        const stationIndex = this.findStationIndex(station) - 1;
        this._stations.splice(stationIndex, 1);
        this.rerender();
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

    get scoreExpression(): string {
        return this._scoreExpression;
    }

    get score(): number {
        return this._score;
    }

    get html(): HTMLDivElement {
        return this._html;
    }

    // get links(): Link[] {
    //     return this._links;
    // }

    get parent(): Oniform|Station|Terminal|undefined {
        return this._parent;
    }

    toJSON(): any {
        return {
            id: this._id,
            label: this._label,
            stations: this._stations.map(station => station.toJSON()),
            // links: this._links.map(link => link.toJSON())
        }
    }
}