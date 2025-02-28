import Group, {GroupButtonAdd} from "./group.ts";
import "../styles/oniform.css";

export default class Oniform {
    static instance = new Oniform([]);
    private constructor(
        private _groups: Group[]
    ) {}

    get groups(): Group[] {
        return this._groups;
    }

    render() {
        const form = document.createElement("form");
        form.id = "oniform";
        form.classList.add("oniform");
        form.innerHTML = `
            <h1>Oniform</h1>
        `;

        this._groups.forEach(group => {
            group.rerender();
            const groupDiv = group.html;
            form.appendChild(groupDiv);
        });

        if(this._groups.length === 0) {
            const newGroupButton = new GroupButtonAdd();
            form.appendChild(newGroupButton.button);
        }
        return form;
    }

    rerender() {
        const app = document.getElementById("app");
        app!.innerHTML = "";
        app!.appendChild(this.render());
    }

    addGroup(prevGroup?: Group) {
        if (prevGroup) {
            const prevGroupIndex = this._groups.findIndex(g => g.id === prevGroup.id) + 1;
            this._groups.splice(prevGroupIndex, 0, new Group(this, `${prevGroupIndex + 1}`));
        }
        else {
            this._groups.push(new Group(this));
        }
        this.rerender();
    }

    deleteGroup(group: Group) {
        const groupIndex = this._groups.findIndex(g => g.id === group.id);
        this._groups.splice(groupIndex, 1);
        this.rerender();
    }

    findGroupIndex(group: Group): string {
        return (this._groups.findIndex(g => g.id === group.id) + 1).toString();
    }
}