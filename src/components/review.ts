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
            h("div.review_container",
                [
                    h("h2", "Review"),
                    h("p", "> A quick peek at the result of your current oniform in the playground"),
                    h("div.review_object", Array.from(this.collections.values()).map(collection => collection.render()))
                ])
        ]);
    }
}