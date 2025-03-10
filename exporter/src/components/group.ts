import Station, {StationButtonAdd} from "./station.ts";
import '../styles/group.css';
import ActionButton from "./actionButton.ts";
import Oniform from "./oniform.ts";
import Clipboard from "./clipboard.ts";
// import Link from "./link.ts";
import {animateHighlight, createListItem, generateGUID, showErrorPopup, showSuccessPopup} from "../common/utility.ts";
import minusUrl from "../static/minus.svg";
import plusUrl from "../static/plus.svg";
import copyUrl from "../static/copy.svg";
import pasteUrl from "../static/paste.svg";
import Terminal from "./terminal.ts";
import Link, {Relationship} from "./link.ts";
import chevronDownUrl from "../static/chevron-down.svg";
import chevronRightUrl from "../static/chevron-right.svg";

export class GroupButtonAdd extends ActionButton {
    constructor(self?: Group) {
        if(!self) {
            super("New Group", "new-group", ["button"], () => {
                Oniform.instance.addGroup();
            });
        }
        else {
            const actionItems = document.createElement("ul");
            actionItems.classList.add("action_items");

            const groupButton = new ActionButton("New group", "new-group", ["add-group"], () => {
                Oniform.instance.addGroup(self);
            }, true, undefined, "New Group").button;
            const stationButton = new ActionButton("New question", "station-dependant", ["add_station_button"], () => {
                self.addEmptyStation();
                self.stations[self.stations.length - 1].addEmptyTerminal();
            }, true, undefined, "New Question").button;

            actionItems.appendChild(createListItem(stationButton));
            actionItems.appendChild(createListItem(groupButton));

            const plus = document.createElement("img");
            plus.src = plusUrl as string;
            plus.alt = "Plus";

            super(plus, "new-group", ["icon"], () => {
                actionItems.classList.toggle("show");
            }, true, actionItems, "New Group");
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

export class GroupButtonCollapse extends ActionButton {
    constructor(self: Group) {
        const chevronDown = document.createElement("img");
        chevronDown.src = chevronDownUrl as string;
        chevronDown.alt = "Collapse All";

        const chevronRight = document.createElement("img");
        chevronRight.src = chevronRightUrl as string;
        chevronRight.alt = "Expand All";

        const collapseCallback = () => {
            const stationContainer = self.html.getElementsByClassName("station_container");

            if (stationContainer.length > 0) {
                const stations = self.html.getElementsByClassName("stations")
                stations[0].classList.toggle("collapse");
                self.html.getElementsByClassName(`group`)[0].classList.toggle("folded");

                if (stations[0].classList.contains("collapse")) {
                    this.button.replaceChild(chevronRight, this.button.firstChild!);
                } else {
                    this.button.replaceChild(chevronDown, this.button.firstChild!);
                }
                self.isCollapsed = !self.isCollapsed;
            }
        }

        if(self.isCollapsed) {
            super(chevronRight, "collapse-stations", ["icon"], collapseCallback, true, undefined, "Collapse Dependants");
        }
        else {
            super(chevronDown, "collapse-stations", ["icon"], collapseCallback, true, undefined, "Collapse Dependants");
        }
    }
}

export class GroupButtonCopy extends ActionButton {
    constructor(self: Group) {
        const copy = document.createElement("img");
        copy.src = copyUrl as string;
        copy.alt = "Copy";

        super(copy, "copy-group", ["icon"], () => {
            const previouslySelected = document.querySelector(".selected");
            if (previouslySelected) {
                previouslySelected.classList.remove("selected");
            }
            Clipboard.instance.copiedObject = self.clone();
            showSuccessPopup("Group copied to clipboard");
            self.html.classList.add("selected");

            const removeSelection = (event: Event) => {
                if (event instanceof KeyboardEvent && event.key === "Escape") {
                    self.html.classList.remove("selected");
                    document.removeEventListener("keydown", removeSelection);
                }
            };

            document.addEventListener("keydown", removeSelection);
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
        }, true, undefined, "Paste");
    }
}

export default class Group {
    private readonly _html: HTMLDivElement = document.createElement("div");
    isCollapsed: boolean = false;

    constructor(
        private _parent: Oniform|Station|Terminal,
        private _label: string = "Group 1",
        private _stations: Station[] = [],
        private readonly _scoreExpression: string = "",
        private _score: number = 0,
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
                const collapseButton = new GroupButtonCollapse(this);
                buttons.appendChild(collapseButton.button);
                buttons.appendChild(copyButton.button);
                buttons.appendChild(pasteButton.button);
            }
            let parentLabel = this._parent.label;
            let parentSignature = "";

            if(this._parent instanceof Station) {
                parentLabel = this._parent.parent.label;
                parentSignature = "-Q";
            }
            else if(this._parent instanceof Terminal) {
                parentLabel = this._parent.parent.parent.label;
                parentSignature = "-O";
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
        this._html.scrollIntoView({behavior: "smooth", block: "center"});
    }

    rerender() {
        this._html.innerHTML = "";
        this.render();
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
        this.rerender();
    }

    addEmptyStation(prevStation?: Station) {
        if(prevStation) {
            const stationIndex = this.findStationIndex(prevStation);
            const station = new Station(this, prevStation, "",`Station ${stationIndex + 1}`);
            this._stations.splice(stationIndex, 0, station);
            animateHighlight(station.html);
        }
        else {
            const station = new Station(this);
            this._stations.push(station);
            animateHighlight(station.html);
        }
        this.rerender();
    }

    appendExistingStation(station: Station) {
        station.parent = this;
        this._stations.push(station);
        animateHighlight(station.html);
        this.rerender();
    }

    addStationAfterReference(refStation: Station, newStation: Station) {
        newStation.parent = this;
        const prevStationIndex = this.findStationIndex(refStation);
        this._stations.splice(prevStationIndex, 0, newStation);
        animateHighlight(newStation.html);
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

    set stations(stations: Station[]) {
        this._stations = stations;
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