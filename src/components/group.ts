import Station, {StationButtonAdd} from "./station.ts";
import '../styles/group.css';
import ActionButton from "./actionButton.ts";
import Oniform from "./oniform.ts";
import Link from "./link.ts";
import {generateGUID} from "../common/utility.ts";
import minusUrl from "../../public/minus.svg";
import plusUrl from "../../public/plus.svg";
import Terminal from "./terminal.ts";

export class GroupButtonAdd extends ActionButton {
    constructor(self?: Group) {
        if(!self) {
            super("New Group", "new-group", ["button"], () => {
                const newGroup = new Group("New Group", [], Oniform.instance);
                Oniform.instance.addGroup(newGroup);
            });
        }
        else {
            const plus = document.createElement("img");
            plus.src = plusUrl as string;
            plus.alt = "Plus";

            super(plus, "new-group", ["icon"], () => {
                const newGroup = new Group("New Group", [], Oniform.instance);
                Oniform.instance.addGroup(newGroup);
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

export default class Group {
    private readonly _html: HTMLDivElement = document.createElement("div");

    constructor(
        private readonly _label: string,
        private readonly _stations: Station[] = [],
        private readonly _parent?: Oniform|Station|Terminal,
        private readonly _scoreExpression: string = "",
        private _score: number = 0,
        private readonly _links: Link[] = [],
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


        if (this._parent) {
            const deleteButton = new GroupButtonDelete(this._parent, this);
            buttons.appendChild(deleteButton.button);

            if (this._parent instanceof Oniform) {
                const addButton = new GroupButtonAdd(this);
                buttons.appendChild(addButton.button);
            }
        }
        const inputElement = document.createElement("input");
        inputElement.value = this._label;
        inputElement.classList.add("group_label");
        buttons.appendChild(inputElement);

        this.html.appendChild(buttons);


        const stationDiv = document.createElement("div");
        stationDiv.classList.add("stations");
        if(this._stations.length == 0) {
            group.appendChild(new StationButtonAdd(this).button);
        }
        this._stations.forEach(station => stationDiv.appendChild(station.html));
        group.appendChild(stationDiv);

        this._html.appendChild(group);
    }

    rerender() {
        this._html.innerHTML = "";
        this.render();
    }

    addStation(station: Station) {
        this._stations.push(station);
        this.rerender();
    }

    deleteStation(station: Station) {
        const stationIndex = this._stations.findIndex(s => s.id === station.id);
        this._stations.splice(stationIndex, 1);
        this.rerender();
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

    get links(): Link[] {
        return this._links;
    }

    addLink(link: Link) {
        this._links.push(link);
    }
}