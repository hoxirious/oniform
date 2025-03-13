import "../styles/action-button.css";
import {h, VNode} from "snabbdom";
import {patch} from "../common/snabbdom.setup";
import {generateGUID} from "../common/utility.ts";

export default class ActionButton {
    private readonly _id = `button-${generateGUID()}`;
    private showDropdown: boolean = false;
    _vnode?: VNode;
    constructor(
        readonly _label: string | VNode,
        readonly _callback: () => void,
        readonly _subButtons?: ActionButton[],
        readonly _class?: string[],
        readonly _tooltip?: string,
    ) {

        this._callback = () => {
            _callback();
            if (_subButtons && this._vnode) {
                this.showDropdown = !this.showDropdown;
                patch(this._vnode, this.render());
            }
        }
    }

     render():VNode {
         this._vnode = h("button",{
             props: {
                 id: this._id,
                 title: this._tooltip,
                 type: "button"
             },
             on: { click: this._callback },
             class: { dropdown: true, "action-button": true, [this._class]: true }
         }, [
             this._label,
             this.showDropdown && this._subButtons
                 ? h("ul.action_items", this._subButtons.map(btn => h("li",btn.render())))
                 : null,
         ]);
         return this._vnode;
     }
}
