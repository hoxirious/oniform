import {h, VNode} from "snabbdom";
import Group, {GroupButtonAdd} from "./group";
import "../styles/oniform.css";
import {generateGUID, scrollIntoView, showSuccessPopup} from "../common/utility";
import ActionButton from "./actionButton";
import {renderView} from "../main";
import {Library} from "./library";

export default class Oniform {
    static instance: Oniform = new Oniform();
    readonly _id = `oniform-${generateGUID()}`;
    private constructor(
        private _groups: Group[] = [],
        private _label: string = "Untitled Form",
    ) {}

    render(): VNode {
        return h(`form#oniform.oniform`, [
            h("div.oniform_header", [
                h("div.right", [
                    h("h2", "Playground"),
                    h("input.oniform_label", {props: {value: this._label}, on: {
                            input: (event: Event) => {
                                this._label = (event.target as HTMLInputElement).value;
                            }
                        }},
                    ),
                ]),
                this.createButtons()
            ]),
            this._groups.length === 0 ? new GroupButtonAdd(this).render() : null,
            h("div.groups", [...this._groups.map(group => group.render())])
        ]);
    }

    private createButtons(): VNode {
        return h("div.buttons", [
            new ActionButton("Save", () => {
                const serializedForm = this.serialize();
                const index = Library.instance.oniformList.length;
                localStorage.setItem("oniformInstance", serializedForm);
                localStorage.setItem(`oniformLibrary-${index}`, serializedForm);
                Library.instance.oniformList.push(serializedForm);
                renderView();
                showSuccessPopup("Form saved");
            }, undefined, ["text", "save"], "Save form").render(),
            new ActionButton("Reset",() => {
                this.clear();
                this.render();
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
        let groupId;
        if (prevGroup) {
            const prevGroupIndex = this.findGroupIndex(prevGroup);
            const group = new Group(this, `Group ${prevGroupIndex + 1}`);
            this._groups.splice(prevGroupIndex, 0, group);
            groupId = group.id;
        }
        else {
            const group = new Group(this);
            this._groups.push(group);
            groupId = group.id;
        }
        renderView();
        scrollIntoView(groupId);
    }

    addGroupAfterReference(prevGroup: Group, newGroup: Group) {
        newGroup.parent = this;
        const prevGroupIndex = this.findGroupIndex(prevGroup);
        this._groups.splice(prevGroupIndex, 0, newGroup);
        renderView();
        scrollIntoView(newGroup.id);
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
            groups: groups.map(group => group.toObj()),
            date: new Date().toISOString()
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
        return Oniform.from(JSON.parse(json));
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
