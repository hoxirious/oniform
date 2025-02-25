import Group, {GroupButtonAdd} from "./components/group.ts";

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
            const groupDiv = group.groupDiv;
            form.appendChild(groupDiv);
        });

        const newGroupButton = new GroupButtonAdd(this.groups);
        form.appendChild(newGroupButton.button);
        return form;
    }

    rerender() {
        const app = document.getElementById("app");
        app.innerHTML = "";
        app.appendChild(this.render());
    }
}