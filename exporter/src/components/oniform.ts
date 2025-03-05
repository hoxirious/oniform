import Group, {GroupButtonAdd} from "./group.ts";
import "../styles/oniform.css";
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

    get label(): string {
        return this._label;
    }

    get html(): HTMLFormElement {
        return this._html;
    }

    render() {
        const form = document.createElement("form");
        form.classList.add("oniform");
        form.innerHTML = `
            <h1>Oniform</h1>
        `;
        const exportButton = new ActionButton("Export Json", "export-json", ["button"], () => {
            const json = this.toJSON();
            console.log(json);
        });
        form.appendChild(exportButton.button);

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
    }

    rerender() {
        const oniform = document.getElementById("oniform");
        if (oniform) {
            this.render();
            if (oniform.firstChild)
                oniform!.replaceChild(this.html, oniform.firstChild);
        }
    }

    addGroup(prevGroup?: Group) {
        if (prevGroup) {
            const prevGroupIndex = this.findGroupIndex(prevGroup);
            this._groups.splice(prevGroupIndex, 0, new Group(this, `${prevGroupIndex + 1}`));
        }
        else {
            this._groups.push(new Group(this));
        }
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

    static fromJSON(json: any): Oniform {
        return new Oniform(json._groups, json._label);
    }

    toJSON(): any {
        return this._groups.map(group => group.toJSON());
    }
}