import "../styles/action-button.css";

export default class ActionButton {
    private _button: HTMLButtonElement = document.createElement("button");

    constructor(
        private readonly _label: string | HTMLElement,
        private readonly _id: string,
        private readonly _class: string[],
        private readonly _callback: () => void = () => {
            this._actionItems?.classList.add("show");
        },
        private readonly _isClicked: boolean = true,
        private _actionItems?: HTMLUListElement,
        private _tooltip?: string
    ) {
        this.render();
    }

    render(): void {
        this._button.type = "button";
        this._button.classList.add("action-button", ...this._class);
        this._button.id = this._id;
        if(this._tooltip)
            this._button.title = this._tooltip;
        this._button.appendChild(typeof this._label === "string" ? document.createTextNode(this._label) : this._label);
        if(this._actionItems) {
            this._actionItems.classList.add("action_items");
            this._button.appendChild(this._actionItems);
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

    get actionItems(): HTMLUListElement {
        return <HTMLUListElement>this._actionItems;
    }
    set actionItems(actionItems: HTMLUListElement) {
        this._actionItems = actionItems;
    }
}

export class SubActionButton extends ActionButton {
    constructor(_label: string, _id: string, _classes: string[], subActionItems: HTMLUListElement) {
        super(_label, _id, _classes, undefined, false);
        subActionItems.classList.add("sub_action_items");
        this.actionItems = subActionItems;
    }
}

