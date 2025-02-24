import Group from "./components/group.ts";
import ActionButton from "./components/actionButton.ts";
import { TerminalButtonAdd } from "./components/terminal.ts";

export default class Oniform {
    static instance = new Oniform([]);
    private constructor(
        private _groups: Group[]
    ) {}

    get groups(): Group[] {
        return this._groups;
    }

    get groupLength(): number {
        return this._groups.length;
    }

    render() {
        const form = document.createElement("form");
        form.id = "oniform";
        form.classList.add("oniform");
        form.innerHTML = `
            <h1>Oniform</h1>
        `;

        this._groups.forEach(group => {
            const groupDiv = group.groupDiv;
            form.appendChild(groupDiv);
        });

        const newGroupButton = new ActionButton("New Group", "new-group", ["button"], () => {
            this._groups.push(new Group(`group-${this._groups.length}`,"New Group", []));
            this.rerender();
        });

        form.appendChild(newGroupButton.button);
        return form;
    }

    rerender() {
        const app = document.getElementById("app");
        app.innerHTML = "";
        app.appendChild(this.render());
    }
}