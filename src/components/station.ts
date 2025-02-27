import Terminal from "./terminal.ts";
import ActionButton from "./actionButton.ts";
import "../styles/station.css";

import plusUrl from "../../public/plus.svg";
import Group from "./group.ts";
import Link, {Relationship} from "./link.ts";

export class StationButtonAdd extends ActionButton {
    constructor(owner: Group, self: Station) {
        const actionItems = document.createElement("ul");
        actionItems.classList.add("action_items");
        actionItems.appendChild(document.createElement("li").appendChild(new ActionButton("Sibling", "station-sibling", ["add_station_button"],
            () => {
                const newStation = new Station(owner);
                new Link(self, newStation, Relationship.SIBLING);
                owner.addStation(newStation);
                owner.rerender();
            }
        ).button));
        actionItems.appendChild(document.createElement("li").appendChild(new ActionButton("Dependant", "station-dependant", ["add_station_button"],
            () => {
                const newStation = new Station(owner);
                new Link(self, newStation, Relationship.DEPENDANT);
                owner.addStation(newStation);
                owner.rerender();
            }
        ).button));

        const plus = document.createElement("img");
        plus.src = plusUrl as string;
        plus.alt = "Plus";

        super(plus, "new-station", ["rounded"], () => {
            actionItems.classList.toggle("show");
        }, true, actionItems);
    }
}

export default class Station {
    public constructor(
        private _groupOwner: Group,
        private _label: string = "",
        private _nextTerminals: Terminal[] = [new Terminal("", this)],
        private _links: Link[] = [],
        private _html: HTMLDivElement = document.createElement("div")
    ) {
        this.render();
    }

    render() {
        const station = document.createElement("div");
        station.classList.add("station");
        station.appendChild(new StationButtonAdd(this._groupOwner, this).button);
        const textareaElement = document.createElement("textarea");
        textareaElement.classList.add("station_textarea");
        textareaElement.setAttribute("value", this.label);

        station.appendChild(textareaElement);


        const terminals = document.createElement("div");
        terminals.classList.add("terminals");
        this.nextTerminals.forEach(terminal => terminals.appendChild(terminal.html));
        this._html.classList.add("container");

        this._html.appendChild(station);
        this._html.appendChild(terminals);
    }

    rerender() {
        this._html.innerHTML = "";
        this.render();
    }

    get label(): string {
        return this._label;
    }

    get html(): HTMLDivElement {
        return this._html;
    }

    get nextTerminals(): Terminal[] {
        return this._nextTerminals;
    }

    addTerminal(terminal: Terminal) {
        this.nextTerminals.push(terminal);
    }

    addLink(link: Link) {
        this._links.push(link);
    }
}