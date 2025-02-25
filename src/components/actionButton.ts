import "../styles/action-button.css";

export default class ActionButton {
    private readonly _button: HTMLButtonElement;
    private _actionItems?: HTMLUListElement;

    constructor(
        private readonly _label: string | HTMLElement,
        private readonly _id: string,
        private readonly _class: string[],
        private readonly _callback: () => void = () => {
            this._actionItems?.classList.add("show");
        },
        private readonly _isClicked: boolean = true,
        actionItems?: HTMLUListElement
    ) {
        this._button = document.createElement("button");
        this._button.type = "button";
        this._button.classList.add("action-button", ...this._class);
        this._button.id = this._id;
        this._button.appendChild(typeof this._label === "string" ? document.createTextNode(this._label) : this._label);

        if (actionItems) {
            this.actionItems = actionItems;
        }

        this.addEventListeners();
    }

    private addEventListeners(): void {
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
        this._actionItems.classList.add("action_items");
        this._button.appendChild(this._actionItems);
    }
}

export class SubActionButton extends ActionButton {
    constructor(_label: string, _id: string, _classes: string[], subActionItems: HTMLUListElement) {
        super(_label, _id, _classes, undefined, false);
        subActionItems.classList.add("sub_action_items");
        this.actionItems = subActionItems;
    }
}

