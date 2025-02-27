import Terminal from "./terminal.ts";
import ActionButton from "./actionButton.ts";
import "../styles/station.css";
import plusUrl from "../../public/plus.svg";
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

        actionItems.appendChild(document.createElement("li").appendChild(siblingButton));
        actionItems.appendChild(document.createElement("li").appendChild(dependantButton));

        const plus = document.createElement("img");
        plus.src = plusUrl as string;
        plus.alt = "Plus";

        super(plus, "new-station", ["rounded"], () => {
            actionItems.classList.toggle("show");
        }, true, actionItems);
    }
}

export default class Station {
    #groupOwner: Group;
    #root: Station;
    #label: string;
    #nextTerminals: Terminal[];
    #links: Link[];
    #html: HTMLDivElement;

    public constructor(
        groupOwner: Group,
        root: Station = this,
        label: string = "New Station",
        nextTerminals: Terminal[] = [new Terminal(this)],
        links: Link[] = [],
        html: HTMLDivElement = document.createElement("div")
    ) {
        this.#groupOwner = groupOwner;
        this.#root = root || this;
        this.#label = label;
        this.#nextTerminals = nextTerminals;
        this.#links = links;
        this.#html = html;
        this.render();
    }

    render() {
        this.#html.innerHTML = "";
        this.#html.classList.add("station_container");

        const station = document.createElement("div");
        station.classList.add("station");


        const labelElement = document.createElement("input");
        labelElement.value = this.label;
        labelElement.classList.add("station_label");
        station.appendChild(labelElement);

        const buttonAdd = new StationButtonAdd(this.#groupOwner, this).button;
        station.appendChild(buttonAdd);

        const textareaElement = document.createElement("textarea");
        textareaElement.classList.add("station_textarea");
        station.appendChild(textareaElement);

        const terminals = document.createElement("div");
        terminals.classList.add("terminals");
        this.#nextTerminals.forEach(terminal => terminals.appendChild(terminal.html));

        this.#html.appendChild(station);
        this.#html.appendChild(terminals);

        this.#links.forEach(link => this.#html.appendChild(link.html));
    }

    rerender() {
        this.render();
    }

    get root(): Station {
        return this.#root;
    }

    get label(): string {
        return this.#label;
    }

    get html(): HTMLDivElement {
        return this.#html;
    }

    get nextTerminals(): Terminal[] {
        return this.#nextTerminals;
    }

    get groupOwner(): Group {
        return this.#groupOwner;
    }

    addTerminal(terminal: Terminal) {
        this.#nextTerminals.push(terminal);
    }

    addLink(link: Link) {
        if (link.relationship === Relationship.DEPENDANT) {
            const siblingIndex = this.#links.findIndex(l => l.relationship === Relationship.SIBLING);
            if (siblingIndex !== -1) {
                this.#links.splice(siblingIndex, 0, link);
            } else {
                this.#links.push(link);
            }
        } else {
            this.#links.push(link);
        }
        this.rerender();
    }
}