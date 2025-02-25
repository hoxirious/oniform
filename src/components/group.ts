import Terminal from "./terminal.ts";
import '../styles/group.css';
import ActionButton from "./actionButton.ts";
import Oniform from "../oniform.ts";

export class GroupButtonAdd extends ActionButton {
    constructor(parent: Group[]) {
        super("New Group", "new-group", ["button"], () => {
            parent.push(new Group(`group-${parent.length}`, "New Group"));
            Oniform.instance.rerender();
        });
    }
}

export default class Group {
    constructor(
        private _id: string,
        private _label: string,
        private _terminals: Terminal[] = [new Terminal(this)],
        private _scoreExpression: string = "",
        private _score: number = 0,
        private _groupDiv: HTMLDivElement = document.createElement("div")
    ) {
        this.render();
    }

    render() {
        this._groupDiv.classList.add("group");
        this._groupDiv.id = this._id;
        const inputElement = document.createElement("input");
        inputElement.value = this.label;
        inputElement.classList.add("group_label");
        this._groupDiv.appendChild(inputElement);
        const terminalDiv =  document.createElement("div");
        this._terminals.forEach(terminal => { terminalDiv.appendChild(terminal.html) });
        this._groupDiv.appendChild(terminalDiv);
    }

    rerender() {
        this._groupDiv.innerHTML = "";
        this.render();
    }

    addTerminal(terminal: Terminal) {
        this._terminals.push(terminal);
    }

    get id(): string {
        return this._id;
    }

    get label(): string {
        return this._label;
    }

    get terminals(): Terminal[] {
        return this._terminals;
    }

    get scoreExpression(): string {
        return this._scoreExpression;
    }

    get score(): number {
        return this._score;
    }

    get groupDiv(): HTMLDivElement {
        return this._groupDiv;
    }
}
