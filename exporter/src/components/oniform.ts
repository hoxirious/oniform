import {h, VNode} from "snabbdom";
import { patch } from "../common/snabbdom.setup.ts";
import Group, {GroupButtonAdd} from "./group.ts";
import "../styles/oniform.css";
import {animateHighlight, generateGUID, showSuccessPopup} from "../common/utility.ts";
import ActionButton from "./actionButton.ts";

export default class Oniform {
    static instance = new Oniform([]);
    private readonly _id = `oniform-${generateGUID()}`;
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
        const groups = this.groups.length > 0 ? this.groups.map(group => group.render()) : new GroupButtonAdd().render();
        return h(`form.oniform${this._id}`, [groups]);
    }

    // private initComponent() {
    //     const buttons = document.createElement("div");
    //     buttons.classList.add("buttons");
    //     const saveButton = new ActionButton("Save", "save", ["button"], () => {
    //         const serializedForm = this.serialize();
    //         localStorage.setItem("oniformInstance", serializedForm);
    //         showSuccessPopup("Form saved");
    //     });
    //
    //     buttons.appendChild(saveButton.button);
    //     const resetButton = new ActionButton("Reset", "reset", ["button"], () => {
    //         this.clear();
    //         localStorage.removeItem("oniformInstance");
    //         showSuccessPopup("Form cleared");
    //     });
    //     buttons.appendChild(resetButton.button);
    //     form.appendChild(buttons);
    //     this._groups.forEach(group => {
    //         group.rerender();
    //         const groupDiv = group.html;
    //         form.appendChild(groupDiv);
    //     });
    //
    //     if(this._groups.length === 0) {
    //         const newGroupButton = new GroupButtonAdd();
    //         form.appendChild(newGroupButton.button);
    //     }
    // }

    rerender() {
        const oniformElement = document.getElementById("oniform");
        if (oniformElement) {
            patch(oniformElement, this.render());
        }
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