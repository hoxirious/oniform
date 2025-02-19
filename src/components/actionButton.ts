export default class ActionButton {
    constructor(
        private _label: string,
        private _id: string,
        private _class: string[],
        private _onClick: (event: MouseEvent) => void,
        private _actionItems: HTMLUListElement|null = null,
        private _button: HTMLButtonElement = document.createElement("button")
    ){
        this._button.type = "button";
        this._button.textContent = this._label;
        this._button.classList.add(...this._class);
        this._button.id = this._id;

        if(this._actionItems)
            this._button.appendChild(this._actionItems);
        this._button.addEventListener("click", this._onClick);
    }

    get button(): HTMLButtonElement {
        return this._button;
    }
}