import Terminal, {TerminalButtonAdd} from "./terminal.ts";
import '../styles/group.css';

export default class Group {
    constructor(
        private _id: string,
        private _label: string,
        private _terminals: Terminal[],
        private _scoreExpression: string = "",
        private _score: number = 0,
        private _groupDiv: HTMLDivElement = document.createElement("div")
    ) {
        this._groupDiv.classList.add("group");
        this._groupDiv.id = this._id;
        this._groupDiv.innerHTML = `
                <input value="${this._label}" class="group_label" />
            `;
        this._groupDiv.appendChild(new TerminalButtonAdd().button);
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
