import {h} from "snabbdom";
import {Question} from "./question.ts";
import Group from "./group.ts";
import {Review} from "./review.ts";
import "../styles/collection.css";

export class Collection {
    questions: Map<string, Question> = new Map();
    label: string = "";
    parent: Review;
    id: string = "";

    constructor(
        group: Group,
        private readonly review: Review
    ) {
        this.id = group.id;
        this.label = group.label;
        group.stations.forEach(station => {
            this.questions.set(station.id, new Question(station, this));
        });
        this.parent = review;
    }

    render(): VNode {
        return h("div.collection", [
            h("div", [this.label]),
            ...Array.from(this.questions.values()).map(question => question.render())
        ])
    }
}