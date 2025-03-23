import {h} from "snabbdom";
import {Collection} from "./collection.ts";
import Group from "./group.ts";

export class Review {
    static instance: Review = new Review();
    collections: Map<string, Collection> = new Map();

    constructor(groups?: Group[]) {
        if (groups) {
            groups.forEach(group => {
                this.collections.set(group.id, new Collection(group, this));
            })
        }
    }

    render() {
        console.log(this.collections);
        return h("div#sidebar", {key: "review"}, [
            ...Array.from(this.collections.values()).map(collection => collection.render())
        ]);
    }
}