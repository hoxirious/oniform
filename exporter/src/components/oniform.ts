import {h, VNode} from "snabbdom";
import Group, {GroupButtonAdd} from "./group.ts";
import "../styles/oniform.css";
import {animateHighlight, generateGUID, showSuccessPopup} from "../common/utility.ts";
import ActionButton from "./actionButton.ts";
import {renderView} from "../main.ts";

export default class Oniform {
    static instance: Oniform = new Oniform();
    readonly _id = `oniform-${generateGUID()}`;
    private constructor(
        private _groups: Group[] = [],
        private _label: string = "",
    ) {}


    render(): VNode {
        const newNode = h(`form#${this._id}.oniform`, {key: this._id}, [
            this.createButtons(),
            this._groups.length === 0 ? new GroupButtonAdd(this).render() : null,
            ...this._groups.map(group => group.render())
        ]);

        return newNode;
    }

    rerender():VNode {
        return this.render();
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
                this.rerender();
                localStorage.removeItem("oniformInstance");
                showSuccessPopup("Form cleared");
            }, undefined, ["text"], "Reset form" ).render()
        ])
    }

    clear() {
        this._groups = [];
        renderView();
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
        renderView();
    }

    addGroupAfterReference(prevGroup: Group, newGroup: Group) {
        newGroup.parent = this;
        const prevGroupIndex = this.findGroupIndex(prevGroup);
        this._groups.splice(prevGroupIndex, 0, newGroup);
        // animateHighlight(newGroup.html);
        renderView();
    }

    deleteGroup(group: Group) {
        const groupIndex = this.findGroupIndex(group) - 1;
        this._groups.splice(groupIndex, 1);
        renderView();
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

    get groups(): Group[] {
        return this._groups;
    }

    set groups(groups: Group[]) {
        this._groups = groups;
    }

    get label(): string {
        return this._label;
    }

    get id(): string {
        return this._id;
    }
}