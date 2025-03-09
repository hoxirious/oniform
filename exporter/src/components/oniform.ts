import Group, {GroupButtonAdd} from "./group.ts";
import "../styles/oniform.css";
import {animateHighlight} from "../common/utility.ts";
import ActionButton from "./actionButton.ts";

export default class Oniform {
    static instance = new Oniform([]);
    private constructor(
        private _groups: Group[],
        private _label: string = "",
        private _html: HTMLFormElement = document.createElement("form")
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

    get html(): HTMLFormElement {
        return this._html;
    }

    render() {
        const form = document.createElement("form");
        form.classList.add("oniform");

        const exportButton = new ActionButton("Export", "export", ["button"], () => {
            const serializedForm = this.serialize();
            localStorage.setItem("oniformInstance", serializedForm);
        });

        form.appendChild(exportButton.button);
        const resetButton = new ActionButton("Reset", "reset", ["button"], () => {
            this.clear();
            localStorage.removeItem("oniformInstance");
        });
        form.appendChild(resetButton.button);
        this._groups.forEach(group => {
            group.rerender();
            const groupDiv = group.html;
            form.appendChild(groupDiv);
        });

        if(this._groups.length === 0) {
            const newGroupButton = new GroupButtonAdd();
            form.appendChild(newGroupButton.button);
        }

        this._html = form;
        this._html.scrollIntoView({behavior: "smooth", block: "center"});
    }

    rerender() {
        const oniform = document.getElementById("oniform");
        if (oniform) {
            this.render();
            if (oniform.firstChild)
                oniform!.replaceChild(this.html, oniform.firstChild);
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
            animateHighlight(group.html);
        }
        else {
            const group = new Group(this);
            this._groups.push(group);
            animateHighlight(group.html);
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