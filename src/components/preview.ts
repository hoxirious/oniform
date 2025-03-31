import {h} from "snabbdom";
import {Collection} from "./collection";
import Group from "./group";

export class Preview {
    static instance: Preview = new Preview();
    collections: Map<string, Collection> = new Map();

    constructor(groups?: Group[]) {
        if (groups) {
            groups.forEach(group => {
                this.collections.set(group.id, new Collection(group));
            })
        }
    }

    render() {
        return h("div#preview-window", {key: "preview"}, [
            h("div.review_container",
                [
                    h("h2", "Preview"),
                    h("p", "> A quick peek at the result of your current oniform in the playground"),
                    h("div.review_object", Array.from(this.collections.values()).map(collection => collection.render()))
                ])
        ]);
    }
}