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
            <button>New Group</button>
        `
        this._groups.forEach((group, index) => {
            const groupDiv = document.createElement("div");
            groupDiv.id = `group-${index}`;
            groupDiv.innerHTML = `
                <h2>${group.label}</h2>
                <button>New Terminal</button>
            `
        })
        return form;
    }
}