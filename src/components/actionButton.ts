export default class ActionButton {
    constructor(
        private _label: string,
        private _actionItems: HTMLUListElement,
    ){}

    get label(): string {
        return this._label;
    }

    get actionItems(): HTMLUListElement {
        return this._actionItems;
    }
}