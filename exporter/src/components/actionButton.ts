import "../styles/action-button.css";
import {h} from "snabbdom";
import {patch} from "../common/snabbdom.setup";

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

     render() {
         const labelVNode = typeof this._label === "string" ? this._label : this._label.outerHTML;
         const actionItemsVNode = this._actionItems ? h('div', { props: { innerHTML: this._actionItems.outerHTML } }) : undefined;

         return h("button", {
             props: {
                 id: this._id,
                 title: this._tooltip,
                 type: "button",
                 value: labelVNode
             },
             class: { "action-button": true, ...this._class.reduce((acc, cls) => ({ ...acc, [cls]: true }), {}) },
             on: this._getEventListeners(),
         }, [labelVNode, actionItemsVNode]);
     }

    private _getEventListeners() {
        const listeners: Record<string, EventListener> = {};

        if (this._isClicked) {
            listeners.click = this._callback;
        } else {
            listeners.mouseover = this._callback;
            listeners.mouseout = () => this._actionItems?.classList.remove("show");
        }

        document.addEventListener("click", (event) => {
            if (this._actionItems && !this._actionItems.contains(event.target as Node)) {
                this._actionItems.classList.remove("show");
            }
        });

        return listeners;
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

