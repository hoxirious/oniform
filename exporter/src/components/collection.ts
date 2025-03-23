import {h} from "snabbdom";
import {Question} from "./question.ts";
import Group from "./group.ts";
import {Review} from "./review.ts";

export class Collection {
    questions: Question[] = [];
    label: string = "";
    parent: Review;
    id: string = "";

    constructor(
        group: Group,
        private readonly review: Review
    ) {
        this.id = group.id;
        this.label = group.label;
        this.questions = group.stations.map(
            station => new Question(station, this)
        );
        this.parent = review;
    }

    render() {
        return h("div.set", [
            h("div", [this.label]),
            ...this.questions.map(question => question.render())
        ])
    }
}