import {h} from "snabbdom";
import {Collection} from "./collection";
import Group from "./group";

export class Review {
    static instance: Review = new Review();
    collections: Map<string, Collection> = new Map();

    constructor(groups?: Group[]) {
        if (groups) {
            groups.forEach(group => {
                this.collections.set(group.id, new Collection(group));
            })
        }
    }

    render() {
        return h("div#review-window", {key: "review"}, [
            h("div", Array.from(this.collections.values()).map(collection => collection.render()))
        ]);
    }
}