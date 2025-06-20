import { h } from "snabbdom";
import Terminal from "../oniform/terminal";
import { Collection } from "./collection";
import { Question } from "./question";
import Group from "../oniform/group";
import Station from "../oniform/station";

export class Option {
  parent: Question;
  terminal: Terminal;
  value: string = "";
  id: string = "";
  nextDependencies: Map<string, Collection | Question> = new Map();
  isCompleted: boolean = false;

  constructor(terminal: Terminal, parent: Question) {
    this.value = terminal.value;
    this.parent = parent;
    this.terminal = terminal;
    this.id = terminal.id;
    terminal.links.forEach((link) => {
      this.nextDependencies.set(
        link.right.id,
        link.rightType === "Group"
          ? new Collection(link.right as Group, link.relationship)
          : new Question(link.right as Station, link.relationship),
      );
    });
  }

  update(terminal: Terminal) {
    this.terminal = terminal;
    this.value = terminal.value;
    let dependencyVisited: string[] = [];
    this.terminal.links.forEach((link) => {
      dependencyVisited.push(link.right.id);
      if (!this.nextDependencies.has(link.right.id)) {
        this.nextDependencies.set(
          link.right.id,
          link.rightType === "Group"
            ? new Collection(link.right as Group, link.relationship)
            : new Question(link.right as Station, link.relationship),
        );
      } else {
        if (link.rightType == "Group")
          (this.nextDependencies.get(link.right.id) as Collection).update(
            link.right as Group,
            link.relationship,
          );
        else
          (this.nextDependencies.get(link.right.id) as Question).update(
            link.right as Station,
            link.relationship,
          );
      }
    });

    Array.from(this.nextDependencies.keys()).forEach((key) => {
      if (dependencyVisited.includes(key) === false) {
        if (this.nextDependencies.get(key)) {
          this.parent.optionSubQuestions.delete(key);
        }
        this.nextDependencies.delete(key);
      }
    });
  }

  calculateIsCompleted(): boolean {
    this.isCompleted = Array.from(this.nextDependencies.values()).every(
      (dependency) => {
        if (dependency instanceof Collection) {
          return dependency.calculatedIsCompleted();
        } else {
          return dependency.calculateIsCompleted();
        }
      },
    );
    return this.isCompleted;
  }

  render() {
    return h("option", { props: { id: this.id } }, [this.value]);
  }
}
