import Station, {StationButtonAdd} from "./station.ts";
import '../styles/group.css';
import ActionButton from "./actionButton.ts";
import Oniform from "./oniform.ts";
import Link from "./link.ts";
import {generateGUID} from "../common/utility.ts";

export class GroupButtonAdd extends ActionButton {
    constructor(parent: Group[]) {
        super("New Group", "new-group", ["button"], () => {
            const newGroup = new Group("New Group");
            parent.push(newGroup);
            Oniform.instance.rerender();
        });
    }
}

export default class Group {
    private readonly _html: HTMLDivElement = document.createElement("div");

    constructor(
        private readonly _label: string,
        private readonly _stations: Station[] = [],
        private readonly _scoreExpression: string = "",
        private _score: number = 0,
        private readonly _links: Link[] = [],
        private readonly _id: string = `group-${generateGUID()}`
    ) {
        this.render();
    }

    render() {
        this._html.classList.add("group");
        this._html.id = this._id;

        const inputElement = document.createElement("input");
        inputElement.value = this._label;
        inputElement.classList.add("group_label");
        this._html.appendChild(inputElement);

        const stationDiv = document.createElement("div");
        if(this._stations.length == 0) {
            this._html.appendChild(new StationButtonAdd(this).button);
        }
        this._stations.forEach(station => stationDiv.appendChild(station.html));
        this._html.appendChild(stationDiv);
    }

    rerender() {
        this._html.innerHTML = "";
        this.render();
    }

    addStation(station: Station) {
        this._stations.push(station);
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