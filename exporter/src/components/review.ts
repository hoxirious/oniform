import {h} from "snabbdom";
import Oniform from "./oniform.ts";
import {Collection} from "./collection.ts";

export class Review {
    static instance: Review = new Review();
    collections: Map<string, Collection> = new Map();

    constructor() {
        Oniform.instance.groups.forEach(group => {
            this.collections.set(group.id, new Collection(group,this));
        })
    }

    render() {
        return h("div#sidebar", {key: "review"}, [
            ...Array.from(this.collections.values()).map(collection => collection.render())
        ]);
    }
}