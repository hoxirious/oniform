import "../styles/action-button.css";

export default class ActionButton {
    constructor(
        private _label: string,
        private _id: string,
        private _class: string[],
        private readonly _callback?: () => void,
        private _isClicked: boolean = true,
        private _actionItems?: HTMLUListElement,
        private _button: HTMLButtonElement = document.createElement("button")
    ){
        this._button.type = "button";
        this._button.textContent = this._label;
        this._button.classList.add("action-button", ...this._class);
        this._button.id = this._id;

        if(this._actionItems) {
            this._actionItems.classList.add("action_items");
            this._button.appendChild(this._actionItems);
        }
        if (!this._callback) {
            this._callback = () => {
                this._actionItems?.classList.add("show");
            }
        }
        if (this._isClicked) {
            this._button.addEventListener("click", this._callback);
        } else {
            this._button.addEventListener("mouseover", this._callback);
            this._button.addEventListener("mouseout", () => {
                this._actionItems?.classList.remove("show");
            });
        }

        document.addEventListener("click", (event) => {
            if (this._actionItems && !this._actionItems.contains(event.target as Node) && !this._button.contains(event.target as Node)) {
                this._actionItems.classList.remove("show");
            }
        });
    }

    get button(): HTMLButtonElement {
        return this._button;
    }

    set actionItems(actionItems: HTMLUListElement) {
        this._actionItems = actionItems;
        this._button.appendChild(this._actionItems);
    }
}