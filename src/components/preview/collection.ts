import { h, VNode } from "snabbdom";
import { Question } from "./question";
import Group from "../oniform/group";
import "../../styles/collection.css";
import {Relationship} from "../../common/utility";

export class Collection {
  questions: Map<string, Question> = new Map();
  group: Group;
  label: string = "";
  id: string = "";
  isCompleted: boolean = this.calculatedIsCompleted();
  relationship: Relationship = Relationship.ASSOCIATE;

  constructor(group: Group, relationship?: Relationship) {
    this.id = group.id;
    this.group = group;
    this.label = group.label;
    if (relationship) this.relationship = relationship;
    group.stations.forEach((station) => {
      this.questions.set(station.id, new Question(station, this.relationship));
    });
  }

  update(group: Group, relationship?: Relationship) {
    this.group = group;
    this.label = group.label;
    if (relationship) this.relationship = relationship;
    let visited: string[] = [];
    this.group.stations.forEach((station) => {
      visited.push(station.id);
      if (!this.questions.has(station.id)) {
        this.questions.set(station.id, new Question(station, relationship));
      } else {
        this.questions.get(station.id).update(station, relationship);
      }
    });

    // Remove unvisited
    Array.from(this.questions.keys()).forEach((key) => {
      if (visited.includes(key) === false) this.questions.delete(key);
    });
  }

  calculatedIsCompleted(): boolean {
    this.isCompleted =
      this.questions.size > 0
        ? Array.from(this.questions.values()).every(
            (question) => question.isCompleted,
          )
        : false;
    return this.isCompleted;
  }

  render(number?: string): VNode {
    return h("div.collection", [
      h("div", [this.label]),
      ...Array.from(this.questions.values()).map((question, index) =>
          {
            let label = `${index+1}`;
            if(number) label = number + "." + label;
            return question.render(label);
          }
      ),
    ]);
  }
}
