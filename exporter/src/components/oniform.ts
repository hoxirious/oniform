import {h, VNode} from "snabbdom";
import { patch } from "../common/snabbdom.setup.ts";
import Group, {GroupButtonAdd} from "./group.ts";
import "../styles/oniform.css";
import {animateHighlight, generateGUID, showSuccessPopup} from "../common/utility.ts";
import ActionButton from "./actionButton.ts";

export default class Oniform {
    static instance = new Oniform([]);
    readonly _id = `oniform-${generateGUID()}`;
    vnode?: VNode;
    private constructor(
        private _groups: Group[] = [],
        private _label: string = "",
    ) {}

    get groups(): Group[] {
        return this._groups;
    }

    set groups(groups: Group[]) {
        this._groups = groups;
    }

    get label(): string {
        return this._label;
    }

    render():VNode {
        const groups = this.groups.length > 0 ? this.groups.map(g => g.rerender()) : undefined;

        this.vnode = h(`form#${this._id}.oniform`, [this.createButtons(),
            this.groups.length == 0 ? new GroupButtonAdd().render() : undefined,
            h("div.groups", groups),
        ]);
        return this.vnode;
    }

    private createButtons(): VNode {
        return h("div.buttons", [
            new ActionButton("Save", () => {
                const serializedForm = this.serialize();
                localStorage.setItem("oniformInstance", serializedForm);
                showSuccessPopup("Form saved");
            }, undefined, ["text"], "Save form").render(),
            new ActionButton("Reset",() => {
                this.clear();
                localStorage.removeItem("oniformInstance");
                showSuccessPopup("Form cleared");
            }, undefined, ["text"], "Reset form" ).render()
        ])
    }

    rerender() {
        console.log(this.groups);
        if(this.vnode){
            return patch(this.vnode, this.render());
        }
        else
            return this.render();
    }

    clear() {
        this._groups = [];
        this.rerender();
    }

    addGroup(prevGroup?: Group) {
        if (prevGroup) {
            const prevGroupIndex = this.findGroupIndex(prevGroup);
            const group = new Group(this, `${prevGroupIndex + 1}`);
            this._groups.splice(prevGroupIndex, 0, group);
            // animateHighlight(group.html);
        }
        else {
            const group = new Group(this);
            this._groups.push(group);
            // animateHighlight(group.html);
        }
        this.rerender();
    }

    addGroupAfterReference(prevGroup: Group, newGroup: Group) {
        newGroup.parent = this;
        const prevGroupIndex = this.findGroupIndex(prevGroup);
        this._groups.splice(prevGroupIndex, 0, newGroup);
        animateHighlight(newGroup.html);
        this.rerender();
    }

    deleteGroup(group: Group) {
        const groupIndex = this.findGroupIndex(group) - 1;
        this._groups.splice(groupIndex, 1);
        this.rerender();
    }

    findGroupIndex(group: Group): number {
        return (this._groups.findIndex(g => g.id === group.id) + 1);
    }

    toObj() {
        const {groups, label} = this;
        return {
            label,
            groups: groups.map(group => group.toObj())
        };
    }

    static from(obj: any): Oniform {
        const {groups, label} = obj;
        const form = new Oniform([], label);
        form.groups = groups.map((group: any) => Group.from(group, form));
        return form;
    }

    serialize() {
        return JSON.stringify(this.toObj());
    }

    static deserialize(json: string) {
        this.instance = Oniform.from(JSON.parse(json));
    }
}