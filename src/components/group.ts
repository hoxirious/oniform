import Terminal from "./terminal.ts";

export default class Group {
    constructor(
        private _label: string,
        private _terminals: Terminal[],
        private _scoreExpression: string = "",
        private _score: number = 0,
    ) {}

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
}
