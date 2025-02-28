import Terminal from "./terminal.ts";
import ActionButton from "./actionButton.ts";
import "../styles/station.css";
import plusUrl from "../../public/plus.svg";
import chevronDownUrl from "../../public/chevron-down.svg";
import chevronUpUrl from "../../public/chevron-up.svg";
import Group from "./group.ts";
import Link, { Relationship } from "./link.ts";

export class StationButtonAdd extends ActionButton {
    constructor(group: Group, self: Station) {
        const actionItems = document.createElement("ul");
        actionItems.classList.add("action_items");

        const siblingButton = new ActionButton("Sibling", "station-sibling", ["add_station_button"], () => {
            const newStation = new Station(group, self);
            new Link(self, newStation, Relationship.SIBLING);
        }).button;
        const dependantButton = new ActionButton("Dependant", "station-dependant", ["add_station_button"], () => {
            const newStation = new Station(group);
            new Link(self, newStation, Relationship.DEPENDANT);
        }).button;

        actionItems.appendChild(createListItem(siblingButton));
        actionItems.appendChild(createListItem(dependantButton));

        const plus = document.createElement("img");
        plus.src = plusUrl as string;
        plus.alt = "Plus";

        super(plus, "new-station", ["icon"], () => {
            actionItems.classList.toggle("show");
        }, true, actionItems);
    }
}

export class StationButtonCollapse extends ActionButton {
    constructor(self: Station) {
        const chevronDown = document.createElement("img");
        chevronDown.src = chevronDownUrl as string;
        chevronDown.alt = "Collapse All";

        const chevronUp = document.createElement("img");
        chevronUp.src = chevronUpUrl as string;
        chevronUp.alt = "Expand All";

        super(chevronDown, "collapse-stations", ["icon"], () => {
            const links = self.html.getElementsByClassName(`link ${Relationship.DEPENDANT}`);
            for (let i = 0; i < links.length; i++) {
                links[i].classList.toggle("collapse");
            }

            const terminals = self.html.getElementsByClassName("terminals");
            terminals[0].classList.toggle("collapse");

            if ((terminals.length > 0 && terminals[0].classList.contains("collapse")) ||
                (links.length > 0 && links[0].classList.contains("collapse"))) {
                this.button.replaceChild(chevronUp, this.button.firstChild);
            }
            else {
                this.button.replaceChild(chevronDown, this.button.firstChild);
            }
        }, true);
    }
}


function createListItem(button: HTMLButtonElement): HTMLLIElement {
    const listItem = document.createElement("li");
    listItem.appendChild(button);
    return listItem;
}

export default class Station {
    private readonly _groupOwner: Group;
    private readonly _root: Station;
    private readonly _label: string;
    private readonly _nextTerminals: Terminal[];
    private _links: Link[];
    private readonly _html: HTMLDivElement;

    constructor(
        groupOwner: Group,
        root: Station = this,
        label: string = "New Station",
        nextTerminals: Terminal[] = [new Terminal(this)],
        links: Link[] = [],
        html: HTMLDivElement = document.createElement("div")
    ) {
        this._groupOwner = groupOwner;
        this._root = root || this;
        this._label = label;
        this._nextTerminals = nextTerminals;
        this._links = links;
        this._html = html;
        this.render();
    }

    render() {
        this._html.innerHTML = "";
        this._html.classList.add("station_container");

        const station = document.createElement("div");
        station.classList.add("station");

        const labelElement = document.createElement("input");
        labelElement.value = this._label;
        labelElement.classList.add("station_label");
        station.appendChild(labelElement);

        const buttons = document.createElement("div");
        buttons.classList.add("buttons");
        const buttonCollapse = new StationButtonCollapse(this).button;
        buttons.appendChild(buttonCollapse);
        const buttonAdd = new StationButtonAdd(this._groupOwner, this).button;
        buttons.appendChild(buttonAdd);

        station.appendChild(buttons);

        const textareaElement = document.createElement("textarea");
        textareaElement.classList.add("station_textarea");
        station.appendChild(textareaElement);

        const terminals = document.createElement("div");
        terminals.classList.add("terminals");
        this._nextTerminals.forEach(terminal => terminals.appendChild(terminal.html));

        this._html.appendChild(station);
        this._html.appendChild(terminals);

        this._links.forEach(link => this._html.appendChild(link.html));
    }

    rerender() {
        this.render();
    }

    get root(): Station {
        return this._root;
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

    get groupOwner(): Group {
        return this._groupOwner;
    }

    addTerminal(terminal: Terminal) {
        this._nextTerminals.push(terminal);
    }

    addLink(link: Link) {
        if (link.relationship === Relationship.DEPENDANT) {
            const siblingIndex = this._links.findIndex(l => l.relationship === Relationship.SIBLING);
            if (siblingIndex !== -1) {
                this._links.splice(siblingIndex, 0, link);
            } else {
                this._links.push(link);
            }
        } else {
            this._links.push(link);
        }
        this.rerender();
    }
}