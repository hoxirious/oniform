import { h, VNode } from "snabbdom";
import { Question } from "./question";
import Group from "./group";
import "../styles/collection.css";

export class Collection {
  questions: Map<string, Question> = new Map();
  group: Group;
  label: string = "";
  id: string = "";
  isCompleted: boolean = this.calculatedIsCompleted();

  constructor(group: Group) {
    this.id = group.id;
    this.group = group;
    this.label = group.label;
    group.stations.forEach((station) => {
      this.questions.set(station.id, new Question(station));
    });
  }

  update(group: Group) {
    this.group = group;
    this.label = group.label;
    let visited: string[] = [];
    this.group.stations.forEach((station) => {
      visited.push(station.id);
      if (!this.questions.has(station.id)) {
        this.questions.set(station.id, new Question(station));
      } else {
        this.questions.get(station.id).update(station);
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

  render(): VNode {
    // this.questions = new Map();
    // this.group.stations.forEach(station => {
    //     this.questions.set(station.id, new Question(station, this));
    // });
    return h("div.collection", [
      h("div", [this.label]),
      ...Array.from(this.questions.values()).map((question) =>
        question.render(),
      ),
    ]);
  }
}
