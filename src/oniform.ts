import Group from "./components/group.ts";
import ActionButton from "./components/actionButton.ts";
import { TerminalButtonAdd } from "./components/terminal.ts";

export default class Oniform {
    static instance = new Oniform([]);
    private constructor(
        private _groups: Group[]
    ) {}

    render() {
        const form = document.createElement("form");
        form.id = "oniform";
        form.classList.add("oniform");
        form.innerHTML = `
            <h1>Oniform</h1>
        `;
        this._groups.forEach((group, index) => {
            const groupDiv = document.createElement("div");
            groupDiv.id = `group-${index}`;
            groupDiv.innerHTML = `
                <h2>${group.label}</h2>
            `;
            groupDiv.appendChild(new TerminalButtonAdd().button);
            form.appendChild(groupDiv);
        });

        const newGroupButton = new ActionButton("New Group", "new-group", ["button"], () => {
            this._groups.push(new Group("New Group", []));
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